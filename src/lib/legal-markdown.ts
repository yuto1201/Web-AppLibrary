import project from "../../config/project.json";

/**
 * アプリ側で承認された法務 Markdown を、文言を変えずに HTML へ写す。
 * 使える書式は見出し（# / ##）、1 行の段落、段落全体の太字、裸の https URL だけ。
 * 字下げ・箇条書き・引用・コード・罫線・強調・打ち消し線・リンク記法・HTML・実体参照・エスケープ・http URL が来たら
 * 推測で描かずに失敗させ、原文と表示がずれないようにする。
 */

const CONFIRMED = "Status: Confirmed";
/** 対応する `## ` 見出しを先に取り出した後に、# で始まるものはすべて拒む。 */
const UNSUPPORTED_BLOCK = /^(?:\s|#|[-*+](?:\s|$)|\d+[.)](?:\s|$)|>|\||```|~~~|<|[-_=*]{3,}\s*$)/u;
const CLOSING_HASHES = /\s#+\s*$/u;
/** 単語の中の `_`（@Yuto_Program）は文字として許し、単語の端の `_` は強調とみなして拒む。 */
const UNSUPPORTED_INLINE = /[*`[\]\\<~]|&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);|(?:^|[^\p{L}\p{N}])_|_(?:[^\p{L}\p{N}]|$)|http:\/\//iu;
const URL_PATTERN = /https:\/\/[A-Za-z0-9\-._~:/?#@!$&+,;=%]+/gu;
/** 句読点で終わる URL は、その記号が URL の一部か文の区切りかが曖昧になる。 */
const AMBIGUOUS_URL_END = /[.,;:!?]$/u;
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

const isBreak = (char: string | undefined) => char === undefined || /\s/u.test(char);

/**
 * URL の直後に続いてよいのは、文の終わり・空白・全角の句読点だけ。
 * ASCII の記号や文字が続くと、どこまでが URL かが曖昧になり、表示と行き先がずれる。
 * 「(https://…/).」のように前の ( と対になる ) は、その後ろが区切りなら URL の外とみなす。
 */
function urlEndsAt(text: string, start: number, end: number): boolean {
  const next = text[end];
  if (isBreak(next) || (/\p{P}/u.test(next!) && !/[!-~]/u.test(next!))) return true;
  const after = text[end + 1];
  return next === ")" && text[start - 1] === "(" && (isBreak(after) || /\p{P}/u.test(after!));
}

function inline(text: string): string {
  if (UNSUPPORTED_INLINE.test(text)) throw new Error(`未対応のインライン書式: ${text}`);
  let html = "";
  let cursor = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0];
    const end = match.index + url.length;
    if (AMBIGUOUS_URL_END.test(url) || !urlEndsAt(text, match.index, end)) throw new Error(`URL の終わりが曖昧: ${text}`);
    html += escapeText(text.slice(cursor, match.index)) + link(url);
    cursor = end;
  }
  return html + escapeText(text.slice(cursor));
}

/** `# ` / `## ` の後に本文が続き、閉じの # を持たない見出しだけを受け付ける。 */
function heading(block: string, marker: "# " | "## "): string {
  const text = block.slice(marker.length);
  if (!/^\S/u.test(text) || CLOSING_HASHES.test(block)) throw new Error(`未対応の見出し: ${block}`);
  return inline(text);
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
    if (block.startsWith("## ")) return `<h3>${heading(block, "## ")}</h3>`;
    if (UNSUPPORTED_BLOCK.test(block)) throw new Error(`未対応のブロック書式: ${block}`);
    const strong = /^\*\*([^*\s](?:[^*]*[^*\s])?)\*\*$/u.exec(block);
    if (strong) return `<p><strong>${inline(strong[1]!)}</strong></p>`;
    return `<p>${inline(block)}</p>`;
  });

  return { title: heading(titleBlock, "# "), body: body.join("\n") };
}

/** 日英の原文を 1 ページに並べ、ページ内の言語切替を付ける。題には各言語のアプリ名を添える。 */
export function bilingualLegalHtml({ id, appName, ja, en }: { id: string; appName: { ja: string; en: string }; ja: string; en: string }): string {
  const japanese = renderLegalMarkdown(ja);
  const english = renderLegalMarkdown(en);
  return `
<h1>${escapeText(appName.ja)} ${japanese.title} / <span lang="en">${escapeText(appName.en)} ${english.title}</span></h1>
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
