import { readFileSync } from "node:fs";
import path from "node:path";
import { bilingualLegalHtml } from "@/lib/legal-markdown";

/**
 * iOS-SubLog Issue #250 で所有者が承認した、SubLog 2.0 の日英の法務原文（handoff sublog-v2-legal-pages、Issue #141）。
 * sublog/<言語>/<種類>.md は iOS-SubLog `af754bd` の `App Store/legal/` のファイルをそのまま置き、digest はテストで照合する。
 * 原文の題はアプリ名から始まり、1 行目が Status 行になっている。
 */
export const sublogLegalSource = {
  repository: "yuto1201/iOS-SubLog",
  commit: "af754bdeaf2e5e01befcdb9c1e3e49954c426a4a",
  approval: "https://github.com/yuto1201/iOS-SubLog/issues/250#issuecomment-6874044937",
  digests: {
    support: {
      ja: "1822b34c31fb5ee756116a02907e0f8bcaf810d88e8dbc36e0f28f18b69657f8",
      "en-US": "486b81ea1797fffd058626d752fc77a379d76069bb9bbface1eaf871aa9581c1",
    },
    privacy: {
      ja: "5a3897d646103455de076ac5049ebc8701c7459c64c43a125dfb69c2dab42e31",
      "en-US": "34e22f32ba7fb50e80a39edaf7b9f08993f09fc94ec1d4e967cd617c37b512a6",
    },
    terms: {
      ja: "58635cc43f21287461bb1e3600ebc31f950f1d87f1efe03a91b065df98f84d76",
      "en-US": "820b316b2aa9628af79e6ac90877bbab59b20aef89feb7bcd0790c7d8c7b8834",
    },
  },
} as const;

export type SublogLegalKind = keyof typeof sublogLegalSource.digests;
export type SublogLegalLanguage = keyof (typeof sublogLegalSource.digests)[SublogLegalKind];

export function readSublogLegalSource(kind: SublogLegalKind, language: SublogLegalLanguage): string {
  return readFileSync(path.join(process.cwd(), "src/data/legal-sources/sublog", language, `${kind}.md`), "utf8");
}

export function sublogLegalHtml(kind: SublogLegalKind): string {
  return bilingualLegalHtml({
    id: `sublog-${kind}`,
    appName: { ja: "SubLog", en: "SubLog" },
    ja: readSublogLegalSource(kind, "ja"),
    en: readSublogLegalSource(kind, "en-US"),
  });
}
