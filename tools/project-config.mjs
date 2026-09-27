import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const repositoryPath = z.string().min(1).refine((value) =>
  !value.includes("\\") && !value.startsWith("/") && !value.includes(":") &&
  value.split("/").every((part, index, parts) =>
    (part !== "" || index === parts.length - 1) && part !== "." && part !== ".."),
"Expected a repository-relative path");

export const projectSchema = z.strictObject({
  schemaVersion: z.literal(1),
  name: z.literal("AppLibrary"),
  repository: z.literal("yuto1201/Web-AppLibrary"),
  productionUrl: z.literal("https://app.yutodev.com/"),
  profile: z.literal("static-site"),
  hosting: z.literal("cloudflare-pages"),
  dns: z.strictObject({ provider: z.literal("cloudflare") }),
  templateSource: z.strictObject({ repository: z.literal("yuto1201/Web-Template"), commit: z.string().regex(/^[a-f0-9]{40}$/u) }),
});

export const workflowSchema = z.strictObject({
  schemaVersion: z.literal(1),
  baseBranch: z.literal("main"),
  branchPrefixes: z.array(z.enum(["codex", "claude"])).min(1),
  highRiskPaths: z.array(repositoryPath).min(1),
  review: z.strictObject({
    normal: z.literal("independent-opposite-family"),
    high: z.tuple([z.literal("openai"), z.literal("anthropic")]),
    bindToHead: z.literal(true),
    enforcement: z.literal("owner-reviewed"),
  }),
  requiredChecks: z.array(z.string().min(1)).min(1)
    .refine((items) => new Set(items).size === items.length, "Duplicate required check"),
});

export const acceptanceSchema = z.strictObject({
  schemaVersion: z.literal(1),
  criteria: z.array(z.strictObject({
    id: z.string().regex(/^AC-[1-9][0-9]*$/u),
    description: z.string().min(1),
    tests: z.array(repositoryPath.refine((value) => /^tests\/.+\.(?:test|spec)\.(?:mjs|ts|tsx)$/u.test(value))).min(1),
  })).min(1).refine((items) => new Set(items.map((item) => item.id)).size === items.length, "Duplicate acceptance ID"),
});

export async function readJson(root, relative) {
  return JSON.parse(await readFile(path.join(root, relative), "utf8"));
}
