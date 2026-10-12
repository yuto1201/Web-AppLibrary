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
  it("v2 の名前（花島 / Flower Island: Living Sky）だけを使い、旧名を残さない", () => {
    for (const kind of kinds) {
      const page = pages[kind]!;
      expect(page).toContain(`<h1>花島 `);
      expect(page).toContain(`<span lang="en">Flower Island: Living Sky `);
      expect(page).not.toContain("花の島");
      expect(page).not.toMatch(/Flower Island(?!: Living Sky)/u);
    }
  });

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
    expect(renderLegalMarkdown(`${confirmed}## 見出し\n\n**質問 & 答え**\n\n本文 3 > 2、@Yuto_Program\n`)).toEqual({
      title: "Title",
      body: "<h3>見出し</h3>\n<p><strong>質問 &amp; 答え</strong></p>\n<p>本文 3 &gt; 2、@Yuto_Program</p>",
    });
  });

  it("Status: Confirmed でない原文は公開しない", () => {
    expect(() => renderLegalMarkdown("# Title\n\nStatus: Draft\n\n本文\n")).toThrow(/Status: Confirmed/u);
    expect(() => renderLegalMarkdown("# Title\n\n本文\n")).toThrow(/Status: Confirmed/u);
  });

  it("対応していない書式は推測で描かずに失敗する", () => {
    for (const block of [
      "- 箇条書き", "1. 番号", "> 引用", "### 小見出し", "[リンク](https://example.net/)", "`code`", "一部だけ **太字**", "1 行目\n2 行目",
      "---", "___", "    字下げのコード", "\t字下げのコード", "_強調_ の文", "文の __強調__", "~~打ち消し~~", "1\\. エスケープ", "&copy; 実体参照",
      "<https://example.net/>", "<b>HTML</b>", "http://example.net/", "https://example.net/a(b) の URL",
      "  # 字下げの見出し", "   - 字下げの箇条書き", "  > 字下げの引用", "  ---", " \t混ざった字下げ", "## 閉じの記号 ##",
      "~打ち消し~", "** 太字**", "https://example.net/a)b の URL", "https://example.net/a'b の URL",
      "##\tタブの見出し", "#", "##", "-", "+", "1.", "# 本文中の大見出し", "##  ", "(https://example.net/x)b の URL",
      "https://example.net/?q=end! の URL", "https://example.net/café の URL", "https://example.net/a. の URL",
    ]) {
      expect(() => renderLegalMarkdown(`${confirmed}${block}\n`), block).toThrow();
    }
    expect(() => renderLegalMarkdown("# Title\r\n\r\nStatus: Confirmed\r\n")).toThrow(/LF/u);
    for (const title of ["# Title #", "# Title ##", "#\tTitle", "#  "]) {
      expect(() => renderLegalMarkdown(`${title}\n\nStatus: Confirmed\n`), title).toThrow();
    }
  });

  it("URL は文の区切りや対になる括弧の手前で終わる", () => {
    const external = (url: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    expect(renderLegalMarkdown(`${confirmed}(https://example.net/x).\n`).body).toBe(`<p>(${external("https://example.net/x")}).</p>`);
    expect(renderLegalMarkdown(`${confirmed}（https://example.net/x）\n`).body).toBe(`<p>（${external("https://example.net/x")}）</p>`);
    expect(renderLegalMarkdown(`${confirmed}https://example.net/x、続き\n`).body).toBe(`<p>${external("https://example.net/x")}、続き</p>`);
  });

  it("リンク先は表示した URL の検索部分と断片まで保ち、属性値をエスケープする", () => {
    expect(renderLegalMarkdown(`${confirmed}https://app.yutodev.com/apps/flower/support/?topic=weather#contact\n`).body)
      .toBe('<p><a href="/apps/flower/support/?topic=weather#contact">https://app.yutodev.com/apps/flower/support/?topic=weather#contact</a></p>');
    expect(renderLegalMarkdown(`${confirmed}https://example.net/?q=1&amp=2\n`).body)
      .toBe('<p><a href="https://example.net/?q=1&amp;amp=2" target="_blank" rel="noopener noreferrer">https://example.net/?q=1&amp;amp=2</a></p>');
  });

  it("日英を 1 ページに並べて言語切替を付ける", () => {
    const html = bilingualLegalHtml({ id: "app-terms", appName: { ja: "アプリ", en: "App" }, ja: `# 規約\n\nStatus: Confirmed\n\n本文\n`, en: `# Terms\n\nStatus: Confirmed\n\nBody\n` });
    expect(html).toContain('<h1>アプリ 規約 / <span lang="en">App Terms</span></h1>');
    expect(section(html, "app-terms-ja")).toContain("<p>本文</p>");
    expect(section(html, "app-terms-en")).toContain("<p>Body</p>");
  });
});
