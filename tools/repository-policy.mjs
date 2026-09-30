import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { projectSchema, workflowSchema, readJson } from "./project-config.mjs";

const requiredFiles = [
  "README.md", "AGENTS.md", "CLAUDE.md", ".npmrc", ".gitattributes", ".python-version",
  "specs/README.md", "specs/product.md", "specs/acceptance.md",
  "docs/workflow.md", "docs/verification.md", "docs/deploy/README.md",
  "public/_headers",
  "config/acceptance.json", "config/github-ruleset.json", ".github/ISSUE_TEMPLATE/change.yml",
  ".github/pull_request_template.md", ".github/workflows/ci.yml",
  "tests/e2e/site.spec.ts", "tools/requirements-ogp.txt", "tools/run-ogp.mjs",
];

const GITHUB_ACTIONS_APP_ID = 15368;
const EXPECTED_RULE_TYPES = ["deletion", "non_fast_forward", "pull_request", "required_status_checks"];

function sameStringSet(actual, expected) {
  return Array.isArray(actual) && actual.length === expected.length &&
    JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

function hasExactKeys(value, expected) {
  return value !== null && typeof value === "object" && !Array.isArray(value) &&
    sameStringSet(Object.keys(value), expected);
}

function sameRequiredChecks(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false;
  if (!actual.every((check) =>
    hasExactKeys(check, ["context", "integration_id"]) &&
    typeof check.context === "string" && Number.isInteger(check.integration_id))) return false;
  const normalize = (checks) => checks
    .map((check) => JSON.stringify([check.context, check.integration_id]))
    .sort();
  return JSON.stringify(normalize(actual)) === JSON.stringify(normalize(expected));
}

export async function checkRepository(root) {
  const errors = [];
  for (const file of requiredFiles) {
    if (!(await stat(path.join(root, file)).catch(() => null))?.isFile()) errors.push(`Missing ${file}`);
  }
  for (const file of ["README.md", "AGENTS.md", "CLAUDE.md"]) {
    const text = await readFile(path.join(root, file), "utf8").catch(() => "");
    if (text.trimEnd().split("\n").length > 200) errors.push(`${file} must stay within 200 lines`);
  }
  try {
    projectSchema.parse(await readJson(root, "config/project.json"));
    const workflow = workflowSchema.parse(await readJson(root, "config/workflow.json"));
    const ci = await readFile(path.join(root, ".github/workflows/ci.yml"), "utf8");
    errors.push(...validateCheckNames(workflow, ci));
    const pythonPin = (await readFile(path.join(root, ".python-version"), "utf8")).trim();
    errors.push(...validatePythonSetup(ci, pythonPin));
    errors.push(...validateRuleset(workflow, await readJson(root, "config/github-ruleset.json")));
    const pkg = await readJson(root, "package.json");
    const lock = await readJson(root, "package-lock.json");
    const version = (await readFile(path.join(root, ".node-version"), "utf8")).trim();
    errors.push(...validateRuntime(pkg, version));
    if (pkg.scripts?.["generate:ogp"] !== "node tools/run-ogp.mjs" || pkg.scripts?.["check:ogp"] !== "node tools/run-ogp.mjs --check") {
      errors.push("OGP scripts must require the isolated Python environment");
    }
    const ogpRequirements = await readFile(path.join(root, "tools/requirements-ogp.txt"), "utf8");
    if (!/^--require-hashes$/mu.test(ogpRequirements) || [...ogpRequirements.matchAll(/--hash=sha256:[0-9a-f]{64}/gu)].length < 2) {
      errors.push("OGP Python dependencies must use verified hashes for macOS and Linux");
    }
    if (lock.packages?.[""]?.engines?.node !== pkg.engines?.node || lock.packages?.[""]?.engines?.npm !== pkg.engines?.npm) errors.push("Lockfile runtime ranges disagree");
    for (const [name, value] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
      if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/u.test(value)) errors.push(`Unpinned dependency: ${name}`);
      if (name.startsWith("@supabase/") || name === "supabase") errors.push(`Static site must not depend on ${name}`);
    }
    if (pkg.dependencies.next !== pkg.devDependencies["eslint-config-next"]) errors.push("Next and eslint-config-next versions disagree");
    const npmrc = await readFile(path.join(root, ".npmrc"), "utf8");
    if (!/^engine-strict=true$/mu.test(npmrc) || !/^save-exact=true$/mu.test(npmrc)) errors.push("npm must enforce runtime and exact versions");
    const next = (await import(pathToFileURL(path.join(root, "next.config.mjs")).href)).default;
    if (next.output !== "export" || next.trailingSlash !== true || next.images?.unoptimized !== true || next.basePath) errors.push("Next must retain root-only static export");
    const files = await readdir(root);
    for (const obsolete of ["assets", "apps", "index.html", "_headers", ".nojekyll", "wrangler.toml", "wrangler.jsonc", "vercel.json", "supabase"]) {
      if (files.includes(obsolete)) errors.push(`Obsolete/unsupported root path: ${obsolete}`);
    }
  } catch (error) {
    errors.push(error.message);
  }
  return errors;
}

export function validateCheckNames(workflow, yaml) {
  const jobs = [...yaml.matchAll(/^    name: ([^\r\n]+)$/gmu)].map((match) => match[1].trim());
  return workflow.requiredChecks.filter((name) => !jobs.includes(name)).map((name) => `Required check has no CI job: ${name}`);
}

export function validatePythonSetup(yaml, pythonPin) {
  const errors = [];
  if (!/^\d+\.\d+\.\d+$/u.test(pythonPin)) errors.push("Exact local Python pin is required");
  if (!/uses: actions\/setup-python@[0-9a-f]{40} # v\d+$/mu.test(yaml)) errors.push("CI setup-python action must use an immutable commit");
  if (!/^          python-version-file: \.python-version$/mu.test(yaml)) errors.push("CI must use the repository Python pin");
  if (
    !/^          python -m venv \.venv-ogp$/mu.test(yaml) ||
    !/^          \.venv-ogp\/bin\/python -m pip install --disable-pip-version-check --no-deps --require-hashes -r tools\/requirements-ogp\.txt$/mu.test(yaml) ||
    !/^          echo "\$GITHUB_WORKSPACE\/\.venv-ogp\/bin" >> "\$GITHUB_PATH"$/mu.test(yaml)
  ) {
    errors.push("CI must install OGP dependencies in an isolated virtual environment");
  }
  return errors;
}

export function validateRuleset(workflow, ruleset) {
  const errors = [];
  const rules = Array.isArray(ruleset.rules) ? ruleset.rules : [];
  const pullRequest = rules.find((rule) => rule.type === "pull_request");
  const statusChecks = rules.find((rule) => rule.type === "required_status_checks");
  const expectedChecks = workflow.requiredChecks.map((context) => ({ context, integration_id: GITHUB_ACTIONS_APP_ID }));
  const ruleTypes = rules.map((rule) => rule.type).sort();
  const normalizedShape =
    hasExactKeys(ruleset, ["name", "target", "enforcement", "bypass_actors", "conditions", "rules"]) &&
    hasExactKeys(ruleset.conditions, ["ref_name"]) &&
    hasExactKeys(ruleset.conditions?.ref_name, ["include", "exclude"]) &&
    rules.every((rule) => {
      if (["deletion", "non_fast_forward"].includes(rule.type)) return hasExactKeys(rule, ["type"]);
      if (!hasExactKeys(rule, ["type", "parameters"])) return false;
      if (rule.type === "pull_request") return hasExactKeys(rule.parameters, [
        "allowed_merge_methods", "dismiss_stale_reviews_on_push", "require_code_owner_review",
        "require_extra_approval_for_unattributed_changes", "require_last_push_approval",
        "required_approving_review_count", "required_reviewers", "required_review_thread_resolution",
      ]);
      if (rule.type === "required_status_checks") return hasExactKeys(rule.parameters, [
        "do_not_enforce_on_create", "required_status_checks", "strict_required_status_checks_policy",
      ]);
      return false;
    });

  if (JSON.stringify(ruleTypes) !== JSON.stringify(EXPECTED_RULE_TYPES)) {
    errors.push("GitHub ruleset must contain each expected rule exactly once and no unexpected rules");
  }
  if (!normalizedShape) errors.push("GitHub ruleset export must retain its normalized key structure");

  if (
    ruleset.name !== "main required checks" ||
    ruleset.target !== "branch" ||
    ruleset.enforcement !== "active" ||
    !Array.isArray(ruleset.bypass_actors) || ruleset.bypass_actors.length !== 0 ||
    !sameStringSet(ruleset.conditions?.ref_name?.include, ["~DEFAULT_BRANCH"]) ||
    !sameStringSet(ruleset.conditions?.ref_name?.exclude, [])
  ) errors.push("GitHub ruleset must actively protect only the default branch without bypass actors");

  if (
    !sameStringSet(pullRequest?.parameters?.allowed_merge_methods, ["squash"]) ||
    pullRequest?.parameters?.required_approving_review_count !== 0 ||
    pullRequest?.parameters?.dismiss_stale_reviews_on_push !== true ||
    pullRequest?.parameters?.require_code_owner_review !== false ||
    pullRequest?.parameters?.require_extra_approval_for_unattributed_changes !== true ||
    pullRequest?.parameters?.require_last_push_approval !== false ||
    !Array.isArray(pullRequest?.parameters?.required_reviewers) ||
    pullRequest.parameters.required_reviewers.length !== 0 ||
    pullRequest?.parameters?.required_review_thread_resolution !== true
  ) errors.push("GitHub ruleset must require squash pull requests and resolved review threads");

  if (
    statusChecks?.parameters?.strict_required_status_checks_policy !== true ||
    statusChecks?.parameters?.do_not_enforce_on_create !== false ||
    !sameRequiredChecks(statusChecks?.parameters?.required_status_checks, expectedChecks)
  ) errors.push("GitHub ruleset required checks disagree with workflow configuration");
  return errors;
}

// Local verification is exact; the hosted build uses compatible engines ranges.
export function validateRuntime(pkg, nodePin, actualNode = process.versions.node, npmAgent = process.env.npm_config_user_agent) {
  const errors = [];
  const npmPin = /^npm@(\d+\.\d+\.\d+)$/u.exec(pkg.packageManager ?? "")?.[1];
  if (!/^\d+\.\d+\.\d+$/u.test(nodePin) || !npmPin) return ["Exact local Node/npm pins are required"];
  if (pkg.engines?.node !== `${nodePin.split(".")[0]}.x` || pkg.engines?.npm !== `${npmPin.split(".")[0]}.x`) errors.push("Hosted runtime ranges disagree with local pins");
  if (actualNode !== nodePin) errors.push(`Local checks require Node ${nodePin}; received ${actualNode}`);
  if (npmAgent && /^npm\/([^\s]+)/u.exec(npmAgent)?.[1] !== npmPin) errors.push(`Local checks require npm ${npmPin}`);
  return errors;
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const errors = await checkRepository(process.cwd());
  if (errors.length) { errors.forEach((error) => console.error(error)); process.exitCode = 1; }
  else process.stdout.write("Repository policy passed\n");
}
