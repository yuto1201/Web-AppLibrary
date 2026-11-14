# yutodev.com へ移す 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 今のトップを `/apps/` に移し、`/` を `/apps/` へのリンクだけのページにし、サイトの正式な URL を `https://yutodev.com/` にする。

**Architecture:** Next.js の静的出力のまま、ページの置き場所と `config/project.json` の `productionUrl` を変える。`app.yutodev.com` からの転送は Cloudflare の Redirect Rules で行い、このコード変更には入れない（設計 7 章、別の承認）。承認済みの法務本文は変えず、古いオリジンの URL をサイト内のリンクとして読み替える。

**Tech Stack:** Next.js 16（`output: "export"`）、TypeScript、Vitest、Playwright、Cloudflare Pages。

**Spec:** `docs/superpowers/specs/2026-11-14-yutodev-domain-move-design.md`

## Global Constraints

- ブランチ `claude/145-yutodev-domain`、Issue #145。コミットは Issue 番号を付け、末尾に `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。
- 検証は `fnm exec --using=v24.20.0 npm run verify`（既定の Node 24.13.0 は拒まれる）。絞った実行は `fnm exec --using=v24.20.0 npx vitest run <file>`、`fnm exec --using=v24.20.0 npx playwright test <file> -g "<name>" --project=chromium`（Playwright はビルド済みの `out/` を配信するので、先に `npm run build`）。
- 新しい正式 URL は `https://yutodev.com/`。古いオリジンは `https://app.yutodev.com`。
- 法務本文（`src/data/privacy/*`、`src/data/terms/*`、`src/data/legal-sources/*`、`src/data/support/*`）の文言は 1 文字も変えない。
- 表示名「AppLibrary」、localStorage / sessionStorage のキー、`public/` のファイルの置き場所は変えない。
- 静的出力は絶対パス。`basePath` は使わない。
- `.reveal` / `useReveal` を使わない。className を DOM に直接書かない（CLAUDE.md）。

## Review Focus

- `app.yutodev.com/#contact` が法務本文から辿られる: 本文のリンクは描画時に `/apps/#contact` へ向くこと（Task 1 のテスト）。
- 古い URL `/`・`/#contact` を相対にしただけだと `/`（リンクだけのページ）に着いてしまう: `/apps/` へ読み替えること（Task 1）。
- 一度公開したパスが消える: 残す URL の一覧がすべて 200 を返すこと（Task 4）。
- `/apps/` の canonical と og:url が `/` のままになる: `/apps/` は `https://yutodev.com/apps/` を指すこと（Task 3）。
- アプリのページの「← AppLibrary」と support の代わりの `#contact` が `/` に向いたまま: `/apps/`・`/apps/#contact` に向くこと（Task 2）。

---

### Task 1: 法務本文の古いオリジンをサイト内のリンクとして読み替える

**Files:**
- Modify: `src/lib/legal-markdown.ts`（`productionOrigin` と `link()`）
- Test: `tests/legal-sources.test.ts`

**Interfaces:**
- Produces: `export function siteLocalPath(url: URL): string | null`（`src/lib/legal-markdown.ts`）。自サイト（`https://yutodev.com` か `https://app.yutodev.com`）なら相対パス（search と hash を含む）を、そうでなければ `null` を返す。古いオリジンの `pathname === "/"` は `/apps/` に読み替える。

- [ ] **Step 1: 失敗するテストを書く**（`tests/legal-sources.test.ts` の `renderLegalMarkdown` の describe に追加）

```ts
it("古いオリジンのトップと連絡先は /apps/ に向ける", () => {
  expect(renderLegalMarkdown(`${confirmed}https://app.yutodev.com/#contact\n`).body)
    .toBe('<p><a href="/apps/#contact">https://app.yutodev.com/#contact</a></p>');
  expect(renderLegalMarkdown(`${confirmed}https://app.yutodev.com/\n`).body)
    .toBe('<p><a href="/apps/">https://app.yutodev.com/</a></p>');
});
it("新しいオリジンの URL もサイト内のリンクにする", () => {
  expect(renderLegalMarkdown(`${confirmed}https://yutodev.com/apps/flower/support/\n`).body)
    .toBe('<p><a href="/apps/flower/support/">https://yutodev.com/apps/flower/support/</a></p>');
});
it("ほかのサブドメインは外部リンクのまま", () => {
  expect(renderLegalMarkdown(`${confirmed}https://web-template.yutodev.com/\n`).body)
    .toContain('target="_blank"');
});
```

既存の `https://app.yutodev.com/apps/flower/...` の期待値（76〜79 行、123〜124 行）は変えない。

- [ ] **Step 2: 失敗を確かめる** — `fnm exec --using=v24.20.0 npx vitest run tests/legal-sources.test.ts`。期待: 新しい 3 件のうち少なくとも最初の 2 件が FAIL。

- [ ] **Step 3: `siteLocalPath` を実装し、`link()` から使う。** 自サイトのオリジンは `productionUrl` に依らず固定の 2 つ `["https://yutodev.com", "https://app.yutodev.com"]`。古いオリジンで `pathname === "/"` のときだけ `/apps/` に置き換える。使わなくなる `productionOrigin` と `project` の import は消す。

- [ ] **Step 4: 通ることを確かめる** — 同じコマンドで PASS（既存の期待値も含めて）。

- [ ] **Step 5: コミット** — `git add src/lib/legal-markdown.ts tests/legal-sources.test.ts`、「法務本文の古いオリジンをサイト内のリンクとして読み替える (#145)」。

### Task 2: トップを /apps/ に移し、/ をリンクだけのページにする

**Files:**
- Create: `src/app/apps/page.tsx`（今の `src/app/page.tsx` の中身をそのまま移す。関数名 `AppsHomePage`）
- Modify: `src/app/page.tsx`（リンクだけのページ `RootPage`）、`src/app/globals.css`（`/` のページの見た目、数行）
- Modify: `src/components/AppFrameClient.tsx:23`、`src/app/privacy/page.tsx:25,83`、`src/app/terms/page.tsx:25,77` の `href="/"` → `"/apps/"`
- Modify: `src/lib/app-links.ts:15` の `"/#contact"` → `"/apps/#contact"`
- Test: `tests/app-links.test.ts:8`、`tests/e2e/site.spec.ts`、`tests/e2e/flower.spec.ts:155`、`tests/e2e/simplepomo.spec.ts:61`

**Interfaces:**
- Produces: `/apps/` が今のトップ（`Nav`・`Stickers`・`Hero`・`AppsSection`・`Workshop`・`Posts`・`Contact`・`FallingFooter`）を持つ。`/` は `a[href="/apps/"]` を 1 つだけ持つ。

- [ ] **Step 1: テストを先に直す。**
  - `tests/app-links.test.ts:8` の期待値を `"/apps/#contact"` に。
  - `tests/e2e/site.spec.ts` のトップを開く `page.goto("/")` を `page.goto("/apps/")` に、`page.goto("/#contact")` を `page.goto("/apps/#contact")` に、トップに戻ったことを見る `toHaveURL("/")` を `toHaveURL("/apps/")` に、`a[href="/#contact"]` を `a[href="/apps/#contact"]` に。`tests/e2e/flower.spec.ts:155` と `tests/e2e/simplepomo.spec.ts:61` の `toHaveURL("/")` も `"/apps/"` に。
  - `tests/e2e/site.spec.ts` に追加:

```ts
test("/ は /apps/ へのリンクだけを置く", async ({ page }) => {
  await page.goto("/");
  const links = page.locator("a[href]");
  await expect(links).toHaveCount(1);
  await expect(links.first()).toHaveAttribute("href", "/apps/");
  await links.first().click();
  await expect(page).toHaveURL("/apps/");
  await expect(page.locator("#contact")).toBeVisible();
});
```

- [ ] **Step 2: 失敗を確かめる** — `fnm exec --using=v24.20.0 npm run build` の後、`npx playwright test tests/e2e/site.spec.ts -g "/ は /apps/" --project=chromium` と `npx vitest run tests/app-links.test.ts`。期待: FAIL。

- [ ] **Step 3: 実装する。** `src/app/page.tsx` を `src/app/apps/page.tsx` へ `git mv` してから、新しい `src/app/page.tsx` を書く。文言は日本語「アプリの一覧へ」＋英語「Apps」の 1 つのリンク（`lang` 切替の仕組みは使わない）、地は机の空色のトークン（`--desk` 系。`globals.css` の既存トークンを使い、新しい色は足さない）、`<main>` の中に `<a href="/apps/">` 1 つ。`Nav` やフッターは置かない。上の「トップへ」リンクの書き換え 5 か所と `app-links.ts` を直す。

- [ ] **Step 4: 通ることを確かめる** — Step 2 と同じコマンドで PASS。続けて `npx playwright test --project=chromium` 全体（不安定な「積もる板の描画ループ」以外が通る。落ちたらそのテストだけ `--repeat-each=3` で再確認）。ローカル配信で `/` と `/apps/` をブラウザで見て、light / dark とスマホ幅（375px）で崩れがないことを確かめる。

- [ ] **Step 5: コミット** — 「トップを /apps/ に移し、/ をリンクだけのページにする (#145)」。

### Task 3: 正式な URL を https://yutodev.com/ にする

**Files:**
- Modify: `config/project.json`（`productionUrl`）、`tools/project-config.mjs:15`（`z.literal("https://yutodev.com/")`）
- Modify: `src/app/sitemap.ts`（`"apps/"` を `""` の次に足す）
- Modify: `src/app/apps/page.tsx`（`export const metadata` で `alternates: { canonical: "/apps/" }` と `openGraph.url: "/apps/"`）
- Modify: `src/app/page.tsx`（`metadata` の `title: "yutodev.com"`、`alternates.canonical: "/"`）
- Test: `tests/e2e/site.spec.ts`（1010 行の robots・sitemap のテスト）

**Interfaces:**
- Consumes: Task 2 のページの置き場所。

- [ ] **Step 1: テストを直す。** robots の期待値を `"Sitemap: https://yutodev.com/sitemap.xml"` に、sitemap の期待する一覧に `https://yutodev.com/apps/` を足し、ほかの URL も `https://yutodev.com/...` に。追加:

```ts
test("/apps/ の canonical と og:url は /apps/ を指す", async ({ page }) => {
  await page.goto("/apps/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://yutodev.com/apps/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://yutodev.com/apps/");
});
```

- [ ] **Step 2: 失敗を確かめる** — ビルドして 2 つのテストを流す。FAIL。
- [ ] **Step 3: 実装する。** 上のファイルを変える。`npm run policy`（`tools/project-config.mjs`）が通ること。
- [ ] **Step 4: 通ることを確かめる** — ビルドして 2 つのテストと `npx vitest run` 全体が PASS。
- [ ] **Step 5: コミット** — 「正式な URL を https://yutodev.com/ にする (#145)」。

### Task 4: 残す URL の一覧をテストで守る

**Files:**
- Create: `config/kept-urls.json`
- Modify: `config/acceptance.json`（AC-7 を足す）
- Test: `tests/e2e/site.spec.ts`

**Interfaces:**
- Produces: `config/kept-urls.json` = `{ "schemaVersion": 1, "note": "一度公開した URL。消さない。app.yutodev.com からは同じパスへ転送する（/ だけ /apps/）。", "paths": string[] }`。

- [ ] **Step 1: 一覧を作る。** `paths` は 2026-11-14 の本番 sitemap の 20 件（`/`、`/privacy/`、`/terms/`、6 アプリの `/apps/<slug>/` と `/apps/<slug>/privacy/`、`/apps/{caflog,pay-cycle,simple-pomo,flower}/terms/`、`/apps/flower/support/`）に、`/apps/`、`/app-ads.txt`、`/robots.txt`、`/sitemap.xml`、`/ogp.png`、`/favicon.svg` を足して並べ替えたもの。
- [ ] **Step 2: テストを書く**

```ts
import keptUrls from "../../config/kept-urls.json" with { type: "json" };
test("一度公開した URL はすべて 200 で返る", async ({ request }) => {
  for (const path of keptUrls.paths) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
  }
});
```

（import の書き方は `site.spec.ts` の既存の JSON の読み方に合わせる。）
- [ ] **Step 3: 通ることを確かめる** — ビルドしてこのテストを流す。PASS（Task 2・3 の後なので `/apps/` もある）。試しに一覧に `/no-such-page/` を足して FAIL を見てから戻す。
- [ ] **Step 4: `config/acceptance.json` に AC-7「一度公開した URL を残す」→ `tests/e2e/site.spec.ts` を足し、`npm run policy` が通ることを確かめる。**
- [ ] **Step 5: コミット** — 「残す URL の一覧をテストで守る (#145)」。

### Task 5: 文書を新しいドメインとリポジトリの役割に合わせる

**Files:**
- Create: `docs/decisions/2026-11-14-yutodev-domain.md`（ADR。形は `docs/decisions/2026-11-14-desk-workshop.md` に合わせる。決定: 設計 4・5 章。代替案: 設計 5 章。影響: 設計 8 章。「このリポジトリを yutodev.com のサイトのリポジトリとする」「一度公開した URL は壊さず、`config/kept-urls.json` で守る」を含める）
- Modify: `docs/decisions/README.md`（一覧に追加）
- Modify: `AGENTS.md`（見出しと概要を「yutodev.com のサイト。アプリの紹介は /apps/（AppLibrary）」に、公開 URL を `https://yutodev.com/`、DNS の行を設計 7 章の形に）、`CLAUDE.md:1` の見出し、`README.md` の見出しと URL
- Modify: `docs/deploy/README.md`（設定の表を新しい形に、「yutodev.com への切り替え（Issue #145）」の手順として設計 7 章を書く）

- [ ] **Step 1: 書く。** 事実は設計の文書から写し、まだ実施していない外部変更は「予定・要承認」と書く。
- [ ] **Step 2: 確かめる** — `fnm exec --using=v24.20.0 npm run check:docs`（文書リンクと policy）が通る。
- [ ] **Step 3: コミット** — 「yutodev.com をこのリポジトリのサイトとして文書に書く (#145)」。

### 最後に

- [ ] `fnm exec --using=v24.20.0 npm run verify` を通す（既知の不安定なテストが落ちたら単独で再確認し、PR に書く）。
- [ ] 高リスクのパス（`AGENTS.md`、`CLAUDE.md`、`config/`、`tools/`、`docs/deploy/`）に触れるので、独立したレビューを得る。結果は PR に書く。
- [ ] 下書きの PR を出し、Cloudflare Pages のプレビューで `/`、`/apps/`、`/apps/flower/support/`、`/privacy/` を見る。
