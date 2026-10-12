import { readFileSync } from "node:fs";
import path from "node:path";
import { bilingualLegalHtml } from "@/lib/legal-markdown";

/**
 * iOS-Flower Issue #428 で所有者が承認した日英の法務原文（Issue #92）。
 * flower/<言語>/<種類>.md は承認時のファイルをそのまま置き、digest はテストで照合する。
 */
export const flowerLegalSource = {
  repository: "yuto1201/iOS-Flower",
  commit: "cb730b3bfda2a89f43b7c37f254b44b3fa8d2332",
  approval: "https://github.com/yuto1201/iOS-Flower/issues/428#issuecomment-6117202929",
  digests: {
    support: {
      ja: "f5017eb71b5b0b256130bef523e35cc4db6740b2724d8afedd8b1dba706aada8",
      "en-US": "8fc104df10e0f56260cd2cc2a785aa0b594f19fbed62b029ddc87d50c4035c46",
    },
    privacy: {
      ja: "aa6539983c44ffb038c11dce0c2f09a326c2019731cd56573af21772c2fd6697",
      "en-US": "0775a3bd612d7d398282d3f50d8a714cf7c32be14338469816da7c81eb7c4429",
    },
    terms: {
      ja: "842075cea4a926cb7fe3f2da9ee27a8ad6309ba7e8070392856ed05039a6ef95",
      "en-US": "509df59b1ffa4527dbc384a9bcc9bf6a322f0bf32f88e19b31c90d17a11edc7a",
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
    appName: "花の島 — Flower",
    ja: readFlowerLegalSource(kind, "ja"),
    en: readFlowerLegalSource(kind, "en-US"),
  });
}
