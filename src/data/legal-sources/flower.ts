import { readFileSync } from "node:fs";
import path from "node:path";
import { FLOWER_NAME } from "@/data/flower-name";
import { bilingualLegalHtml } from "@/lib/legal-markdown";

/**
 * iOS-Flower Issue #428 で所有者が承認した日英の法務原文（handoff flower-legal-v2、Issue #92 / #96）。
 * flower/<言語>/<種類>.md は承認時のファイルをそのまま置き、digest はテストで照合する。
 * v1 から変わったのはアプリ名（花島 / Flower Island: Living Sky）だけ。
 */
export const flowerLegalSource = {
  repository: "yuto1201/iOS-Flower",
  commit: "99f660f2351e33b3ccd241ac0f9bdcb2011e43f9",
  approval: "https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117202929",
  renameApproval: "https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117745418",
  digests: {
    support: {
      ja: "e90610b04b7ab58c7a379aeb074b5bbafb8651debebe20729cb9787352b876e8",
      "en-US": "25cba3092770f3cebe0f31a8134dc08fa865995e7f4e74d364a19d8b61224755",
    },
    privacy: {
      ja: "a00c9a58760c3c68079028912b3390ff1146d769496ad6eb5ee2a2db05e20339",
      "en-US": "834c35d1ddfa041c0177caa89ce1ef955ae9f1274c385321fbd1b4495d1e5c3b",
    },
    terms: {
      ja: "bc2720e5f049dfe15e232fb6f75867f36348681eaf2664cc536f13a1915f85ed",
      "en-US": "6965c9cbd86739548a3f5eb95f689c0d214b70e71d302a304b43b9010822c4c1",
    },
  },
} as const;

export type FlowerLegalKind = keyof typeof flowerLegalSource.digests;
export type FlowerLegalLanguage = keyof (typeof flowerLegalSource.digests)[FlowerLegalKind];

export function readFlowerLegalSource(kind: FlowerLegalKind, language: FlowerLegalLanguage): string {
  return readFileSync(path.join(process.cwd(), "src/data/legal-sources/flower", language, `${kind}.md`), "utf8");
}

export function flowerLegalHtml(kind: FlowerLegalKind): string {
  return bilingualLegalHtml({
    id: `flower-${kind}`,
    appName: FLOWER_NAME,
    ja: readFlowerLegalSource(kind, "ja"),
    en: readFlowerLegalSource(kind, "en-US"),
  });
}
