// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { findBrokenMarkdownLinks } from "../tools/verify-links.mjs";
import { generateAgents } from "../tools/generate-agent-wrappers.mjs";
import { verifyAcceptance } from "../tools/verify-acceptance-trace.mjs";
import { checkRepository, validateCheckNames, validatePythonSetup, validateRuleset, validateRuntime } from "../tools/repository-policy.mjs";
import { workflowSchema } from "../tools/project-config.mjs";
import { resolveOgpPython } from "../tools/run-ogp.mjs";

const roots = [];
const rulesetUrl = new URL("../config/github-ruleset.json", import.meta.url);
const rulesetMessage = "GitHub ruleset must require squash pull requests and resolved review threads";
const statusMessage = "GitHub ruleset required checks disagree with workflow configuration";
const shapeMessage = "GitHub ruleset export must retain its normalized key structure";
async function fixture() { const root = await mkdtemp(path.join(os.tmpdir(), "applibrary-policy-")); roots.push(root); return root; }
async function loadRuleset() { return JSON.parse(await readFile(rulesetUrl, "utf8")); }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("development checks", () => {
  it("pins local verification while allowing compatible hosted runtime updates", () => {
    const pkg = { packageManager: "npm@11.6.2", engines: { node: "24.x", npm: "11.x" } };
    expect(validateRuntime(pkg, "24.20.0", "24.20.0", "npm/11.6.2 node/v24.20.0")).toEqual([]);
    expect(validateRuntime(pkg, "24.20.0", "24.21.0", "npm/11.6.2")).toHaveLength(1);
    expect(validateRuntime(pkg, "24.20.0", "24.20.0", "npm/11.12.1")).toHaveLength(1);
    expect(validateRuntime({ ...pkg, engines: { node: "24.20.0", npm: "11.x" } }, "24.20.0", "24.20.0", "npm/11.6.2")).toContain("Hosted runtime ranges disagree with local pins");
  });
  it("detects a renamed or missing required CI check", () => {
    expect(validateCheckNames({ requiredChecks: ["Browser checks"] }, "jobs:\n  browser:\n    name: Browser checks\n")).toEqual([]);
    expect(validateCheckNames({ requiredChecks: ["Browser checks"] }, "jobs:\n  browser:\n    name: Renamed\n")).toEqual(["Required check has no CI job: Browser checks"]);
  });
  it("pins and isolates the Python environment used for generated images", () => {
    const setup = [
      "      - uses: actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1 # v6",
      "        with:",
      "          python-version-file: .python-version",
      "        run: |",
      "          python -m venv .venv-ogp",
      "          .venv-ogp/bin/python -m pip install --disable-pip-version-check --no-deps --require-hashes -r tools/requirements-ogp.txt",
      "          echo \"$GITHUB_WORKSPACE/.venv-ogp/bin\" >> \"$GITHUB_PATH\"",
    ].join("\n");
    expect(validatePythonSetup(setup, "3.13.3")).toEqual([]);
    expect(validatePythonSetup(setup.replace(/@[0-9a-f]{40}/u, "@v6"), "3.13.3")).toContain("CI setup-python action must use an immutable commit");
    expect(validatePythonSetup(setup.replace(".python-version", "3.13"), "3.13.3")).toContain("CI must use the repository Python pin");
    expect(validatePythonSetup(setup.replace("python -m venv .venv-ogp", "python -m pip install Pillow"), "3.13.3")).toContain("CI must install OGP dependencies in an isolated virtual environment");
    expect(validatePythonSetup(setup.replace(".venv-ogp/bin/python -m pip install", "python -m pip install"), "3.13.3")).toContain("CI must install OGP dependencies in an isolated virtual environment");
    expect(validatePythonSetup(setup, "3.13")).toContain("Exact local Python pin is required");
  });
  it("requires the isolated OGP Python and fails closed when it is absent", async () => {
    const root = await fixture();
    expect(() => resolveOgpPython(root)).toThrow(/Missing \.venv-ogp\/bin\/python/u);
    const isolated = path.join(root, ".venv-ogp/bin/python");
    await mkdir(path.dirname(isolated), { recursive: true });
    await writeFile(isolated, "");
    expect(resolveOgpPython(root)).toBe(isolated);
  });
  it("keeps Pages security headers and immutable caching on hashed assets only", async () => {
    const source = await readFile("public/_headers", "utf8");
    const blocks = new Map(source.trim().split(/\n\s*\n/u).map((block) => {
      const [route, ...lines] = block.split("\n");
      return [route, new Map(lines.map((line) => {
        const match = /^\s+([^:]+):\s*(.+)$/u.exec(line);
        if (!match) throw new Error(`Invalid Pages header: ${line}`);
        return [match[1], match[2]];
      }))];
    }));
    expect(blocks.get("/*")?.get("Content-Security-Policy")).toBe("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    expect(blocks.get("/*")?.get("X-Frame-Options")).toBe("DENY");
    expect(blocks.get("/*")?.get("X-Content-Type-Options")).toBe("nosniff");
    expect(blocks.get("/*")?.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(blocks.get("/*")?.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=(), interest-cohort=()");
    expect(blocks.get("/_next/static/*")?.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(blocks.get("/apps/*")?.get("Cache-Control")).toBe("public, max-age=0, must-revalidate");
    expect(blocks.get("/*")?.has("Cache-Control")).toBe(false);
  });
  it("keeps the exported ruleset aligned with required GitHub Actions checks regardless of order", async () => {
    const ruleset = await loadRuleset();
    const workflow = { requiredChecks: ["Repository checks", "Browser checks"] };
    expect(validateRuleset(workflow, ruleset)).toEqual([]);
    ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.required_status_checks.reverse();
    ruleset.rules.reverse();
    expect(validateRuleset(workflow, ruleset)).toEqual([]);
  });
  it.each([
    ["inactive enforcement", (ruleset) => { ruleset.enforcement = "evaluate"; }, "GitHub ruleset must actively protect only the default branch without bypass actors"],
    ["a bypass actor", (ruleset) => { ruleset.bypass_actors.push({ actor_id: 1 }); }, "GitHub ruleset must actively protect only the default branch without bypass actors"],
    ["a renamed check", (ruleset) => { ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.required_status_checks[1].context = "Renamed"; }, statusMessage],
    ["a different check provider", (ruleset) => { ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.required_status_checks[1].integration_id = 1; }, statusMessage],
    ["a string check provider", (ruleset) => { ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.required_status_checks[1].integration_id = "15368"; }, statusMessage],
    ["non-strict checks", (ruleset) => { ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.strict_required_status_checks_policy = false; }, statusMessage],
    ["checks ignored on create", (ruleset) => { ruleset.rules.find((rule) => rule.type === "required_status_checks").parameters.do_not_enforce_on_create = true; }, statusMessage],
    ["merge commits allowed", (ruleset) => { ruleset.rules.find((rule) => rule.type === "pull_request").parameters.allowed_merge_methods.push("merge"); }, rulesetMessage],
    ["unattributed changes without extra approval", (ruleset) => { ruleset.rules.find((rule) => rule.type === "pull_request").parameters.require_extra_approval_for_unattributed_changes = false; }, rulesetMessage],
    ["an unexpected required reviewer", (ruleset) => { ruleset.rules.find((rule) => rule.type === "pull_request").parameters.required_reviewers.push({ file_patterns: ["**/*"] }); }, rulesetMessage],
    ["unresolved review threads", (ruleset) => { ruleset.rules.find((rule) => rule.type === "pull_request").parameters.required_review_thread_resolution = false; }, rulesetMessage],
    ["a missing deletion rule", (ruleset) => { ruleset.rules = ruleset.rules.filter((rule) => rule.type !== "deletion"); }, "GitHub ruleset must contain each expected rule exactly once and no unexpected rules"],
    ["an unexpected rule", (ruleset) => { ruleset.rules.push({ type: "required_signatures" }); }, "GitHub ruleset must contain each expected rule exactly once and no unexpected rules"],
    ["a duplicate rule", (ruleset) => { ruleset.rules.push(structuredClone(ruleset.rules[0])); }, "GitHub ruleset must contain each expected rule exactly once and no unexpected rules"],
    ["an unexpected parameter", (ruleset) => { ruleset.rules.find((rule) => rule.type === "pull_request").parameters.unexpected = true; }, shapeMessage],
    ["an unexpected top-level key", (ruleset) => { ruleset.id = 1; }, shapeMessage],
  ])("rejects ruleset drift with %s", async (_label, mutate, message) => {
    const ruleset = await loadRuleset();
    mutate(ruleset);
    expect(validateRuleset({ requiredChecks: ["Repository checks", "Browser checks"] }, ruleset)).toContain(message);
  });
  it("rejects duplicate required workflow checks", () => {
    const workflow = {
      schemaVersion: 1, baseBranch: "main", branchPrefixes: ["codex"], highRiskPaths: ["tools/"],
      review: { normal: "independent-opposite-family", high: ["openai", "anthropic"], bindToHead: true, enforcement: "owner-reviewed" },
      requiredChecks: ["Repository checks", "Repository checks"],
    };
    expect(() => workflowSchema.parse(workflow)).toThrow("Duplicate required check");
  });
  it("detects missing and escaping links but retains historical documents", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "docs/decisions"), { recursive: true });
    await mkdir(path.join(root, ".venv-ogp/package"), { recursive: true });
    await writeFile(path.join(root, "README.md"), "[missing](missing.md)\n[escape](../outside.md)\n[web](https://example.com)\n[bad](%ZZ)\n");
    await writeFile(path.join(root, "docs/decisions/old.md"), "[old](gone.md)");
    await writeFile(path.join(root, ".venv-ogp/package/README.md"), "[third party](missing.md)");
    const errors = await findBrokenMarkdownLinks(root);
    expect(errors).toHaveLength(3);
    expect(errors.join("\n")).toContain("escapes");
    expect(errors.join("\n")).toContain("missing.md");
    expect(errors.join("\n")).not.toContain("gone.md");
  });

  it("fails generated drift and repairs it only on explicit generation", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "docs/agent-contracts"), { recursive: true });
    await cp("docs/agent-contracts/change-evaluator.md", path.join(root, "docs/agent-contracts/change-evaluator.md"));
    expect(await generateAgents(root, true)).toHaveLength(2);
    await generateAgents(root);
    expect(await generateAgents(root, true)).toEqual([]);
    const file = path.join(root, ".codex/agents/change-evaluator.toml");
    await writeFile(file, "unsafe drift");
    expect(await generateAgents(root, true)).toHaveLength(1);
    expect(await readFile(file, "utf8")).toBe("unsafe drift");
  });

  it("rejects missing acceptance tests and duplicate IDs", async () => {
    const root = await fixture();
    await mkdir(path.join(root, "config"));
    await mkdir(path.join(root, "specs"));
    const criterion = { id: "AC-1", description: "test", tests: ["tests/missing.test.ts"] };
    await writeFile(path.join(root, "specs/acceptance.md"), "AC-1: example");
    const file = path.join(root, "config/acceptance.json");
    await writeFile(file, JSON.stringify({ schemaVersion: 1, criteria: [criterion] }));
    expect(await verifyAcceptance(root)).toEqual(["AC-1: missing tests/missing.test.ts"]);
    await writeFile(file, JSON.stringify({ schemaVersion: 1, criteria: [criterion, criterion] }));
    await expect(verifyAcceptance(root)).rejects.toThrow("Duplicate acceptance ID");
  });

  it("rejects missing repository contracts", async () => {
    const errors = await checkRepository(await fixture());
    expect(errors).toContain("Missing AGENTS.md");
    expect(errors).toContain("Missing tests/e2e/site.spec.ts");
  });
});
