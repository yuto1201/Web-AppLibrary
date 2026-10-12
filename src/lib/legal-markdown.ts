import project from "../../config/project.json";

/**
 * アプリ側で承認された法務 Markdown を、文言を変えずに HTML へ写す。
 * 使える書式は見出し（# / ##）、1 行の段落、段落全体の太字、裸の https URL だけ。
 * 箇条書き・引用・コード・罫線・強調・リンク記法・HTML・実体参照・エスケープ・http URL が来たら
 * 推測で描かずに失敗させ、原文と表示がずれないようにする。
 */

const CONFIRMED = "Status: Confirmed";
const UNSUPPORTED_BLOCK = /^(?:#\s|#{3,}|[-*+]\s|\d+[.)]\s|>|\||```|~~~|<| {4}|\t|[-_=*]{3,}\s*$)/u;
/** 単語の中の `_`（@Yuto_Program）は文字として許し、単語の端の `_` は強調とみなして拒む。 */
const UNSUPPORTED_INLINE = /[*`[\]\\<]|~~|&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);|(?:^|[^\p{L}\p{N}])_|_(?:[^\p{L}\p{N}]|$)|http:\/\//iu;
const URL_PATTERN = /https:\/\/[A-Za-z0-9\-._~:/?#@!$&+,;=%]+/gu;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/u;
const productionOrigin = new URL(project.productionUrl).origin;

export type RenderedLegalMarkdown = { title: string; body: string };

function escapeText(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', "&quot;");
}

function link(url: string): string {
  const parsed = new URL(url);
  // 自サイトの URL は表示を原文のまま保ち、遷移先だけ相対にしてプレビューでも辿れるようにする。
  if (parsed.origin === productionOrigin) {
    return `<a href="${escapeAttribute(parsed.pathname + parsed.search + parsed.hash)}">${escapeText(url)}</a>`;
  }
  return `<a href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeText(url)}</a>`;
}

function inline(text: string): string {
  if (UNSUPPORTED_INLINE.test(text)) throw new Error(`未対応のインライン書式: ${text}`);
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    // 括弧を含む URL は途中で切れて別の行き先になるため、描かずに失敗させる。
    if (text[match.index + match[0].length] === "(") throw new Error(`括弧を含む URL は未対応: ${text}`);
    const url = match[0].replace(TRAILING_PUNCTUATION, "");
    html += escapeText(text.slice(cursor, match.index)) + link(url);
    cursor = match.index + url.length;
  }
  return html + escapeText(text.slice(cursor));
}

/** `# 見出し` / `Status: Confirmed` で始まる承認済みの原文だけを受け付ける。 */
export function renderLegalMarkdown(source: string): RenderedLegalMarkdown {
  if (source.includes("\r")) throw new Error("改行は LF に限る");
  const [titleBlock, statusBlock, ...blocks] = source.replace(/\n+$/u, "").split(/\n{2,}/u);
  if (!titleBlock?.startsWith("# ") || titleBlock.includes("\n")) throw new Error("先頭は 1 行の # 見出しにする");
  // Status 行は文書管理の印として表示しない（Issue #92 で所有者が決定）。未確定の原文は公開しない。
  if (statusBlock !== CONFIRMED) throw new Error(`${CONFIRMED} の原文だけを公開する`);

  const body = blocks.map((block) => {
    if (block.includes("\n")) throw new Error(`段落内の改行は未対応: ${block}`);
    if (block.startsWith("## ")) return `<h3>${inline(block.slice(3))}</h3>`;
    if (UNSUPPORTED_BLOCK.test(block)) throw new Error(`未対応のブロック書式: ${block}`);
    const strong = /^\*\*([^*]+)\*\*$/u.exec(block);
    if (strong) return `<p><strong>${inline(strong[1]!)}</strong></p>`;
    return `<p>${inline(block)}</p>`;
  });

  return { title: inline(titleBlock.slice(2)), body: body.join("\n") };
}

/** 日英の原文を 1 ページに並べ、ページ内の言語切替を付ける。 */
export function bilingualLegalHtml({ id, appName, ja, en }: { id: string; appName: string; ja: string; en: string }): string {
  const japanese = renderLegalMarkdown(ja);
  const english = renderLegalMarkdown(en);
  return `
<h1>${escapeText(appName)} ${japanese.title} / <span lang="en">${english.title}</span></h1>
<p class="legal-language">本ページは日本語と英語で提供しています。 <span lang="en">This page is available in Japanese and English.</span></p>
<nav class="legal-language-switch" aria-label="言語 / Language"><a href="#${id}-ja">日本語</a><span> · </span><a href="#${id}-en" lang="en">English</a></nav>

<section id="${id}-ja" lang="ja">
<h2>${japanese.title}</h2>
${japanese.body}
</section>

<section id="${id}-en" lang="en">
<h2>${english.title}</h2>
${english.body}
</section>
`;
}
