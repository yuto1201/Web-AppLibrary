import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  flowerLegalSource,
  readFlowerLegalSource,
  type FlowerLegalKind,
  type FlowerLegalLanguage,
} from "@/data/legal-sources/flower";
import { privacyDocuments } from "@/data/privacy/registry";
import { supportDocuments } from "@/data/support/registry";
import { termsDocuments } from "@/data/terms/registry";
import { bilingualLegalHtml, renderLegalMarkdown } from "@/lib/legal-markdown";

const pages: Record<FlowerLegalKind, string | undefined> = {
  support: supportDocuments.flower,
  privacy: privacyDocuments.flower,
  terms: termsDocuments.flower,
};
const kinds = Object.keys(flowerLegalSource.digests) as FlowerLegalKind[];
const languages: Record<FlowerLegalLanguage, string> = { ja: "ja", "en-US": "en" };

function section(html: string, id: string): string {
  return html.match(new RegExp(`<section id="${id}" lang="[a-z]+">([\\s\\S]*?)</section>`, "u"))?.[1] ?? "";
}

function visibleText(html: string): string {
  return html.replace(/<[^>]+>/gu, "").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");
}

/** 原文の各ブロックから Markdown の記号だけを外した、読者に見える文。 */
function sourceBlocks(source: string): string[] {
  return source
    .split(/\n{2,}/u)
    .map((block) => block.trim())
    .filter((block) => block !== "" && block !== "Status: Confirmed")
    .map((block) => block.replace(/^#{1,2} /u, "").replace(/^\*\*(.*)\*\*$/u, "$1"));
}

const confirmed = "# Title\n\nStatus: Confirmed\n\n";

describe("Flower の承認済み法務原文", () => {
  it("iOS-Flower #428 で承認されたファイルを digest どおりに保持する", () => {
    for (const kind of kinds) {
      for (const language of Object.keys(languages) as FlowerLegalLanguage[]) {
        const digest = createHash("sha256").update(readFlowerLegalSource(kind, language)).digest("hex");
        expect(digest, `${language}/${kind}.md`).toBe(flowerLegalSource.digests[kind][language]);
      }
    }
  });

  it("support・privacy・terms の各ページに日英の原文を全文載せ、Status 行は出さない", () => {
    for (const kind of kinds) {
      const page = pages[kind]!;
      expect(page).toBeDefined();
      expect(page).not.toContain("Status:");
      for (const [language, lang] of Object.entries(languages) as [FlowerLegalLanguage, string][]) {
        const text = visibleText(section(page, `flower-${kind}-${lang}`));
        for (const block of sourceBlocks(readFlowerLegalSource(kind, language))) expect(text).toContain(block);
      }
      expect(page).toContain(`<a href="#flower-${kind}-ja">日本語</a>`);
      expect(page).toContain(`<a href="#flower-${kind}-en" lang="en">English</a>`);
    }
  });

  it("自サイトの URL は原文の表示のまま相対リンクにし、外部 URL は別タブで開く", () => {
    expect(pages.support).toContain('<a href="/apps/flower/terms/">https://app.yutodev.com/apps/flower/terms/</a>');
    expect(pages.support).toContain('<a href="/apps/flower/privacy/">https://app.yutodev.com/apps/flower/privacy/</a>');
    expect(pages.privacy).toContain('（<a href="/apps/flower/support/">https://app.yutodev.com/apps/flower/support/</a>）');
    expect(pages.privacy).toContain('(<a href="/apps/flower/support/">https://app.yutodev.com/apps/flower/support/</a>).');
    expect(pages.support).toContain('<a href="https://x.com/Yuto_Program" target="_blank" rel="noopener noreferrer">https://x.com/Yuto_Program</a>');
  });
});

describe("法務 Markdown の描画", () => {
  it("見出し・太字の段落・本文を、文言を変えずに描く", () => {
    expect(renderLegalMarkdown(`${confirmed}## 見出し\n\n**質問 & 答え**\n\n本文 <b>\n`)).toEqual({
      title: "Title",
      body: "<h3>見出し</h3>\n<p><strong>質問 &amp; 答え</strong></p>\n<p>本文 &lt;b&gt;</p>",
    });
  });

  it("Status: Confirmed でない原文は公開しない", () => {
    expect(() => renderLegalMarkdown("# Title\n\nStatus: Draft\n\n本文\n")).toThrow(/Status: Confirmed/u);
    expect(() => renderLegalMarkdown("# Title\n\n本文\n")).toThrow(/Status: Confirmed/u);
  });

  it("対応していない書式は推測で描かずに失敗する", () => {
    for (const block of ["- 箇条書き", "1. 番号", "> 引用", "### 小見出し", "[リンク](https://example.net/)", "`code`", "一部だけ **太字**", "1 行目\n2 行目"]) {
      expect(() => renderLegalMarkdown(`${confirmed}${block}\n`), block).toThrow();
    }
    expect(() => renderLegalMarkdown("# Title\r\n\r\nStatus: Confirmed\r\n")).toThrow(/LF/u);
  });

  it("日英を 1 ページに並べて言語切替を付ける", () => {
    const html = bilingualLegalHtml({ id: "app-terms", appName: "App", ja: `# 規約\n\nStatus: Confirmed\n\n本文\n`, en: `# Terms\n\nStatus: Confirmed\n\nBody\n` });
    expect(html).toContain('<h1>App 規約 / <span lang="en">Terms</span></h1>');
    expect(section(html, "app-terms-ja")).toContain("<p>本文</p>");
    expect(section(html, "app-terms-en")).toContain("<p>Body</p>");
  });
});
