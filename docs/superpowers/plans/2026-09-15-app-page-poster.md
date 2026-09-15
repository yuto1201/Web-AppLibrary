# App-page poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/apps/<slug>/` and app legal pages use the same cream poster paper as home, without turning them into a second desk.

**Architecture:** Keep the existing `.app-shell` isolation and `--app-*` token names. Point those tokens at `--paper` / `--ink` / `--accent`, drop the studio gradient chrome, and restyle type, CTAs, features, and screenshots in `app-page.css`. Markup in `page.tsx` stays unless a class is missing. Specimen vinyl is unchanged.

**Tech Stack:** Next.js static export, `tokens.css` paper tokens, Playwright e2e, existing `PAPER` / `INK` constants in `tests/e2e/site.spec.ts`.

## Global Constraints

- `--paper` light `#fff8f1`; `--ink` light `#000000`; `--ink-2` light `#3f3b36`; `--accent` light `#0066ee` / dark `#6eb3ff`
- Display Latin: Newsreader 400. UI: Inter 300/400. No Bricolage. No weight 600+ on app-page UI
- CTA is outlined pill (home `.cta-btn` shape). App name stays ink, not accent
- Specimen: one vinyl on the detail hero, not a link, `shellBounds`, none on legal pages
- Do not mount home `<Nav />`, `ActivateProvider`, tape, `TOKYO '26`, or handwritten hints
- No search/filter/modal, no glass, no new illustrations, no paper noise, no OGP/`tools/` changes
- Site `/privacy/` `/terms/` and `src/styles/legal.css` are out of scope
- `npm run verify` must pass; axe `color-contrast` on real colors (no `FLATTEN_APP_SHELL`)
- Touching `specs/product.md` and `docs/verification.md` makes the PR high-risk: OpenAI and Anthropic independent read-only reviews
- 1 Issue / 1 branch / 1 PR (`cursor/app-page-poster-03db`, Issue #38)
- Do not merge to `main` without explicit user approval of that exact target
- This branch sits on the desk-play Head. Do not re-implement desk-play

---

## File map

| File | Role |
|---|---|
| `src/styles/app-page.css` | Paper tokens, type, CTA, features, screenshots, legal chrome |
| `src/app/apps/[slug]/page.tsx` | Leave markup unless a class is missing |
| `src/app/apps/[slug]/privacy/page.tsx` | Token follower only (no markup change) |
| `src/app/apps/[slug]/terms/page.tsx` | Token follower only (no markup change) |
| `tests/e2e/site.spec.ts` | Paper canvas, dark ink, remove flatten, type/CTA checks |
| `docs/design/app-page.md` | Current contract |
| `docs/verification.md` | Real-color contrast for app pages |
| `specs/product.md` | Same paper; scatter stays on home |
| `docs/TODO.md` | Link this plan |
| `docs/superpowers/specs/2026-09-15-app-page-poster-design.md` | Already 採択 |

Do not edit `src/styles/tokens.css` names, `src/styles/legal.css`, `tools/`, or `public/ogp.png`.

This environment needs Node from nvm, not `/exec-daemon/node`:

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
```

E2E serves `out/` via `npm run start`. Build before Playwright.

---

### Task 1: Paper canvas and theme

**Files:**
- Modify: `tests/e2e/site.spec.ts:27-40`
- Modify: `tests/e2e/site.spec.ts:829-832`
- Modify: `tests/e2e/site.spec.ts:951-958`
- Modify: `src/styles/app-page.css:12-35`

**Interfaces:**
- Consumes: existing `PAPER` / `INK` in `tests/e2e/site.spec.ts`; `--paper` / `--ink` / `--ink-2` / `--accent` in `tokens.css`
- Produces: `--app-*` aliases to paper tokens; `body:has(.app-shell)` and `.app-shell` paint `--paper`; dark headings use `INK.dark`

- [ ] **Step 1: Write the failing e2e assertions**

In `tests/e2e/site.spec.ts`, keep `FLATTEN_APP_SHELL` for this task (gradient text is still there). Change the detail-page body color and the dark heading test.

Replace the body assertion inside the per-app loop (`${app.slug}: 詳細とプライバシー…`):

```ts
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.light);
```

Replace the whole dark test:

```ts
test("保存した dark でも個別ページの見出しが電圧ブルーに飲み込まれない", async ({ page }) => {
  await page.goto("/apps/sublog/");
  await setStoredState(page, { theme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell .section-title").first()).toHaveCSS("color", INK.dark);
  await expect(page.locator(".app-shell .hero-title")).toHaveCSS("color", INK.dark);
});
```

- [ ] **Step 2: Run the dark test to verify it fails**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run build
npx playwright test tests/e2e/site.spec.ts -g "電圧ブルーに飲み込まれない" --project=chromium
```

Expected: FAIL. Current `.section-title` is `rgb(22, 24, 29)` (`#16181d`) and `body:has(.app-shell)` is `rgb(248, 250, 252)`.

- [ ] **Step 3: Point app tokens at paper**

In `src/styles/app-page.css`, replace the header comment’s “背景グラデーション色” wording and the canvas rules. Keep the rest of the file for this task.

```css
/* ============================================================
   App Page — 個別アプリ紹介ページの共通骨格
   App Router の client-side navigation 後にも CSS は残るため、
   全規則を .app-shell 配下へ閉じ込める。
   --app-* の名前は維持し、値は紙面トークンへ寄せる。
   --app-bg-1, --app-bg-2, --app-bg-base → --paper
   --app-ink / --app-ink-2 → --ink / --ink-2
   --app-accent / --app-accent-2 → --accent
   ============================================================ */

/* 詳細ページの余白・オーバースクロールにも同じ紙を適用する。 */
body:has(.app-shell) {
  background: var(--paper);
}

.app-shell {
  --app-bg-1: var(--paper);
  --app-bg-2: var(--paper);
  --app-ink: var(--ink);
  --app-ink-2: var(--ink-2);
  --app-accent: var(--accent);
  --app-accent-2: var(--accent);
  --app-bg-base: var(--paper);
  font-family: var(--font-sans);
  color: var(--app-ink);
  background: var(--paper);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  line-height: 1.7;
}
```

Delete `color-scheme: light` and both `radial-gradient` layers. Do not restyle buttons or type yet.

- [ ] **Step 4: Rebuild and confirm the new assertions pass**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run build
npx playwright test tests/e2e/site.spec.ts -g "電圧ブルーに飲み込まれない" --project=chromium
npx playwright test tests/e2e/site.spec.ts -g "sublog: 詳細とプライバシー" --project=chromium
```

Expected: PASS. Flatten is still applied later in the sublog test; that is OK until Task 2.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/site.spec.ts src/styles/app-page.css
git commit -m "個別ページのキャンバスを紙面トークンへ寄せる"
```

---

### Task 2: Type, CTA, features, screenshots, real contrast

**Files:**
- Modify: `tests/e2e/site.spec.ts:32-40`
- Modify: `tests/e2e/site.spec.ts:847-850`
- Modify: `tests/e2e/site.spec.ts:907-908`
- Modify: `tests/e2e/site.spec.ts:934-935`
- Modify: `src/styles/app-page.css` (from `.app-shell *` through the end)
- Do not modify: `src/app/apps/[slug]/page.tsx` (classes `btn btn-primary` / `btn btn-ghost` stay)

**Interfaces:**
- Consumes: `--app-*` aliases from Task 1; `--measure` on `:root` from `standard.css`; `--shadow-sticker` / `--rule` from `tokens.css`
- Produces: left-aligned measure column; Newsreader section titles; outlined pills; feature rules without card shadow; screenshot sticker shadow; no `FLATTEN_APP_SHELL`

- [ ] **Step 1: Write the failing type / CTA / flatten-removal assertions**

Add next to `INK`:

```ts
const INK_2 = { light: "rgb(63, 59, 54)", dark: "rgb(200, 194, 184)" } as const;
```

Delete the `FLATTEN_APP_SHELL` constant and its three `page.addStyleTag({ content: FLATTEN_APP_SHELL })` calls. Delete the two comments that say 個別ページは再設計の対象外.

In the per-app loop, immediately after the paper background assertions, add:

```ts
    await expect(page.locator(".hero-title")).toHaveCSS("font-weight", "400");
    await expect(page.locator(".hero-title")).toHaveCSS("color", INK.light);
    await expect(page.locator(".hero-tagline")).toHaveCSS("color", INK_2.light);
    await expect(page.locator(".section-title").first()).toHaveCSS("font-family", /Newsreader/i);
    await expect(page.locator(".feature-card").first()).toHaveCSS("box-shadow", "none");
    const primary = page.locator(".btn-primary").first();
    if (await primary.count()) {
      await expect(primary).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      .toBe(true);
```

Keep `await expectColorContrast(page)` on the detail page, pay-cycle terms, and privacy — now without flatten.

- [ ] **Step 2: Run one detail test to verify it fails**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run build
npx playwright test tests/e2e/site.spec.ts -g "sublog: 詳細とプライバシー" --project=chromium
```

Expected: FAIL on `font-weight` (still 800) and/or tagline color (still transparent / gradient) and/or `box-shadow`.

- [ ] **Step 3: Restyle the isolated chrome**

Replace everything in `src/styles/app-page.css` from `.app-shell *,` through the final `@media` with:

```css
.app-shell *,
.app-shell *::before,
.app-shell *::after { box-sizing: border-box; margin: 0; padding: 0; }
.app-shell img { max-width: 100%; display: block; }
.app-shell a { color: var(--app-accent); text-decoration: none; }
.app-shell a:hover { text-decoration: underline; }

/* ═══ Hero ═══ */
.app-shell .hero {
  position: relative;
  max-width: none;
  padding: var(--space-6) 0 var(--space-12);
}
.app-shell .specimen-slot {
  position: absolute;
  right: clamp(8px, 6vw, 48px);
  top: 72px;
  width: 96px;
  z-index: 3;
  pointer-events: none;
}
.app-shell .specimen-slot .sticker-slot {
  position: relative;
  inset: auto;
  left: auto;
  right: auto;
  top: auto;
  bottom: auto;
  width: 96px;
}
.app-shell .specimen-slot .sticker {
  pointer-events: auto;
  /* .app-shell * { padding:0 } がビニールの白フチを潰すので戻す */
  padding: 7px;
}
.app-shell .specimen-slot .sticker[data-shape="circle"] { padding: 6px; }
.app-shell .hero-nav,
.app-shell .hero-inner,
.app-shell .page,
.app-shell .page-footer,
.app-shell .privacy-nav {
  width: min(var(--measure), calc(100% - var(--space-10)));
  max-width: none;
  margin-inline: auto;
  text-align: left;
}
.app-shell .hero-nav { margin-bottom: var(--space-8); }
.app-shell .nav-back { font-size: 14px; color: var(--app-ink-2); font-weight: 400; }
.app-shell .hero-inner { padding: var(--space-8) 0; }
.app-shell .hero-icon {
  width: 120px;
  height: 120px;
  margin: 0 0 var(--space-6);
  border-radius: 28px;
  box-shadow: none;
}
.app-shell .hero-title {
  font-family: var(--font-sans);
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--app-ink);
  max-width: none;
  margin: 0;
  text-shadow: none;
}
.app-shell .hero-tagline {
  margin-top: var(--space-3);
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 400;
  color: var(--app-ink-2);
  background: none;
  -webkit-background-clip: border-box;
  background-clip: border-box;
  -webkit-text-fill-color: currentColor;
}
.app-shell .hero-desc { margin-top: var(--space-5); font-size: 16px; color: var(--app-ink-2); }
.app-shell .hero-meta-row {
  display: flex;
  justify-content: flex-start;
  gap: var(--space-2);
  margin-top: var(--space-4);
  flex-wrap: wrap;
}
.app-shell .hero-badge {
  padding: 5px 12px;
  border: 1px solid var(--rule);
  border-radius: var(--radius-full);
  color: var(--app-ink-2);
  background: transparent;
  font-size: 13px;
  font-weight: 400;
}
.app-shell .hero-actions {
  margin-top: var(--space-8);
  display: flex;
  gap: var(--space-3);
  justify-content: flex-start;
  flex-wrap: wrap;
}

/* ═══ Buttons — ホームの outlined pill と同じ役割 ═══ */
.app-shell .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 43px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 16px;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  border: 1.5px solid var(--app-accent);
  transition: color 0.15s, border-color 0.15s;
}
.app-shell .btn:hover { text-decoration: none; }
.app-shell .btn-primary {
  color: var(--app-accent);
  border-color: var(--app-accent);
}
.app-shell .btn-primary:hover {
  color: var(--app-ink);
  border-color: var(--app-ink);
}
.app-shell .btn-primary[aria-disabled="true"] { opacity: 0.55; cursor: not-allowed; }
.app-shell .btn-ghost {
  color: var(--app-ink);
  border-color: var(--app-ink);
}
.app-shell .btn-ghost:hover {
  color: var(--app-ink-2);
  border-color: var(--app-ink-2);
}

/* ═══ Main ═══ */
.app-shell .page { padding: 0; }
.app-shell .section-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 400;
  letter-spacing: -0.02em;
  text-align: left;
  margin-bottom: var(--space-8);
  text-shadow: none;
  color: var(--app-ink);
}

/* ═══ Features ═══ */
.app-shell .features { padding: var(--space-12) 0; }
.app-shell .feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-5);
}
.app-shell .feature-card {
  padding: var(--space-6);
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  border: 1px solid var(--rule);
}
.app-shell .feature-icon { font-size: 32px; margin-bottom: var(--space-3); }
.app-shell .feature-card h3 { font-size: 18px; font-weight: 400; margin-bottom: var(--space-2); }
.app-shell .feature-card p { font-size: 14px; color: var(--app-ink-2); }

/* ═══ Screenshots ═══ */
.app-shell .screenshots { padding: var(--space-12) 0; }
.app-shell .shot-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-5);
}
.app-shell .shot-row img {
  width: min(280px, 100%);
  flex: 0 1 280px;
  aspect-ratio: 9 / 19.5;
  object-fit: cover;
  border: 1px solid var(--rule);
  border-radius: 28px;
  background: var(--paper);
  box-shadow: var(--shadow-sticker);
}

/* ═══ Footer / アプリ法務 ═══ */
.app-shell .page-footer {
  padding: var(--space-10) 0;
  color: var(--app-ink-2);
  font-size: 14px;
}
.app-shell .page-footer a { color: var(--app-ink); font-weight: 400; }
.app-shell .privacy-page a {
  font-weight: 400;
  text-decoration: underline;
  text-underline-offset: 0.15em;
}
.app-shell .privacy-nav {
  padding: var(--space-6) 0 0;
  font-size: 14px;
}
.app-shell .privacy-nav a { color: var(--app-ink-2); font-weight: 400; }
.app-shell .privacy-page { padding-block: var(--space-10) var(--space-8); }
.app-shell .privacy-page h1 {
  margin-bottom: var(--space-2);
  font-size: clamp(30px, 5vw, 44px);
  font-weight: 400;
  line-height: 1.25;
  color: var(--app-ink);
}
.app-shell .privacy-page .meta { margin-bottom: 0; color: var(--app-ink-2); }
.app-shell .privacy-page .legal-language { margin-top: var(--space-2); margin-bottom: var(--space-8); font-size: 14px; }
.app-shell .privacy-page h2 { margin: var(--space-8) 0 var(--space-3); font-size: 20px; font-weight: 400; color: var(--app-ink); }
.app-shell .privacy-page p,
.app-shell .privacy-page ul { margin-top: var(--space-3); }
.app-shell .privacy-page ul { padding-left: 1.4em; }
.app-shell .privacy-page p,
.app-shell .privacy-page li {
  color: var(--app-ink-2);
  overflow-wrap: anywhere;
}

@media (max-width: 479px) {
  .app-shell .hero { padding: var(--space-4) 0; }
  .app-shell .hero-inner { padding: var(--space-4) 0; }
  .app-shell .features { padding: var(--space-8) 0; }
  .app-shell .privacy-page { padding-top: var(--space-8); }
}
```

Keep the Task 1 token block above this. Do not add desk tape, stamps, or Klee.

- [ ] **Step 4: Rebuild and confirm the sublog detail test passes**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run build
npx playwright test tests/e2e/site.spec.ts -g "sublog: 詳細とプライバシー" --project=chromium
npx playwright test tests/e2e/site.spec.ts -g "標本シール" --project=chromium
npx playwright test tests/e2e/site.spec.ts -g "電圧ブルーに飲み込まれない" --project=chromium
```

Expected: PASS. Specimen count stays 1 on detail / 0 on privacy. If axe `color-contrast` fails, fix the failing selector’s color in `app-page.css` (do not bring flatten back).

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/site.spec.ts src/styles/app-page.css
git commit -m "個別ページの組版と CTA をポスター紙面へ揃える"
```

---

### Task 3: Contracts

**Files:**
- Modify: `docs/design/app-page.md`
- Modify: `docs/verification.md:21`
- Modify: `specs/product.md`
- Modify: `docs/TODO.md`

**Interfaces:**
- Consumes: behavior shipped in Tasks 1–2
- Produces: design / product / verification text that matches the paper app pages

- [ ] **Step 1: Replace the live app-page contract**

`docs/design/app-page.md` — keep the registry / privacy / `.app-shell` isolation paragraphs. Replace the feature bullets and the `body:has` sentence:

```md
# アプリ詳細ページのデザイン

ステータス: 確定
最終更新日: 2026-09-15

`src/app/apps/[slug]/page.tsx` が registry から `/apps/<slug>/` を静的生成する。HTML やアプリ別の script/style ファイルをコピーしない。

- キャンバス: `.app-shell` と `body:has(.app-shell)` は `--paper` / `--ink`。`--app-*` の名前は残し、値は紙面トークンへ寄せる。紫ピンクの放射グラデと `color-scheme: light` 固定は持たない。`[data-theme="dark"]` は `tokens.css` に従う。
- Hero: 戻るリンク、120px アイコン（グローなし）、名前（インク・字重 400）、タグライン（`--ink-2`、グラデ文字なし）、紹介、プラットフォーム、outlined pill の CTA。行長は `--measure`。左揃え。ホームの `<Nav />` は載せない。Hero 右上にそのアプリの標本ビニールを 1 枚置く（`.specimen-slot`、内側の `.sticker-slot` は 96px でホームの机スロット規則から切り離す）。アイコンが無いアプリには置かない。リンクではない。`aria-hidden`。`src/components/SpecimenSticker.tsx` が `VinylSticker` を `href` なしで載せ、クランプは `.app-shell`（`shellBounds`）。viewport 固定にしない。離した位置に残る。リサイズで机と同様にオフセットを捨てる。法務ページ（アプリ `/privacy/` `/terms/`、サイト `/privacy/` `/terms/`）とトップ以外には置かない。テープ・日付印・手書き合図は置かない。
- Features: registry の `{ icon, title, description }` を塗りなし・1px 罫線のブロックで表示。白いカード影は持たない。英語見出しは Newsreader 400。
- Screenshots: `public/apps/<slug>/screenshots/` の実ファイルを registry の順序で表示。flex wrap した各行を中央配置し、lazy loading と alt を付ける。1px 罫線と `--shadow-sticker`。黒ベタ背景は使わない。
- Footer: `/apps/<slug>/privacy/` とトップへの導線。字重 400。
- CTA: 配布先は電圧ブルーの outlined pill。「機能を見る」はインクの outlined pill。塗りグラデと浮き上がりは持たない。

共通 CSS は `src/styles/app-page.css`、基本トークンは `src/styles/tokens.css`。App Router は遷移後も読み込んだ global CSS を保持するため、アプリ詳細とアプリ別 privacy / terms は `.app-shell` で包み、各コンポーネント規則をその配下へスコープする。例外として、詳細表示中のブラウザ余白とオーバースクロールを同じ紙にする `body:has(.app-shell)` だけを条件付きで使う。`:root` や無条件の `body`、汎用の `.hero` などへアプリ固有の規則を追加しない。`--app-*` / `--glass-*` の既存名を維持する。掲載画像は正方形アイコン（128px 以上）と縦長スクリーンショットを使用する。
```

Keep the existing privacy-registry and e2e closing paragraphs.

- [ ] **Step 2: Point product and verification at the same paper**

In `specs/product.md`, after the 遊び bullet, add:

```md
- 個別ページとアプリ法務も同じ紙面。机の散らしはホームだけ。詳細の標本ビニールは 1 枚。
```

In `docs/verification.md`, replace the paragraph that starts with `グラデーションと半透明カードでは` with:

```md
トップ、サイト法務、個別ページ、アプリ法務は紙面トークンの単色キャンバスを使う。E2E の axe `color-contrast` は実装値のまま判定し、背景を単色へ倒さない。`color-contrast` が `incomplete` の場合や pass が 0 件の場合も失敗させる。アプリページ用 CSS は遷移後もブラウザに残るため、各詳細・privacy を直接ロードし、詳細表示中の body 背景と、トップとサイト法務ページへ戻った後の `.app-shell` 不在・body 配色を検証する。
```

- [ ] **Step 3: Point TODO at this plan**

In `docs/TODO.md` replace the open item with:

```md
- [ ] 個別ページをポスター紙面へ揃える

仕様: [個別ページをポスター紙面へ揃える](superpowers/specs/2026-09-15-app-page-poster-design.md)
計画: [個別ページのポスター化](superpowers/plans/2026-09-15-app-page-poster.md)
```

- [ ] **Step 4: Check docs**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run check:docs
```

Expected: PASS (OGP pixels unchanged; this task does not touch `tools/` or `public/ogp.png`).

- [ ] **Step 5: Commit**

```bash
git add docs/design/app-page.md docs/verification.md specs/product.md docs/TODO.md
git commit -m "個別ページの紙面契約を文書へ落とす"
```

---

### Task 4: Verify and record

**Files:**
- Modify: PR body only, unless verify forces a fix in files from Tasks 1–3

**Interfaces:**
- Consumes: Tasks 1–3
- Produces: `npm run verify` on this Head; high-risk dual review on that SHA

- [ ] **Step 1: Full verify**

```bash
export PATH="/home/ubuntu/.nvm/versions/node/v24.20.0/bin:$PATH"
npm run verify
```

Expected: check + Playwright pass. If a contrast or layout assertion fails, fix `app-page.css` (or the assertion if it encoded the old studio). Do not restore `FLATTEN_APP_SHELL`.

- [ ] **Step 2: Browser pass after verify**

Serve `out/` with `npm run start`. Open `/apps/sublog/`, `/apps/caflog/`, `/apps/dev-tools/`, `/apps/pay-cycle/`, one privacy page, pay-cycle terms, then home. Check light and dark, 1280 and 390. Confirm: cream (or dark paper) canvas, outlined CTAs, one specimen on detail, none on legal, no extra desk objects, no horizontal scroll.

- [ ] **Step 3: Retry Issue create; leave blank on 403**

If GitHub allows it, open an Issue that points at the spec and this plan, then put the number in the PR body. If create returns 403, keep the number blank and say so.

- [ ] **Step 4: Dual review on the exact Head**

This PR touches `specs/product.md` and `docs/verification.md`. Dispatch independent OpenAI and Anthropic read-only reviews on the verify Head. Record the SHA and results in the PR. CI success is not review approval.

- [ ] **Step 5: Commit only if Step 1–2 produced fixes**

```bash
git add -u
git commit -m "個別ページの紙面化で落ちた検証を直す"
```

Skip this commit when verify is already green.

---

## Self-review

1. **Spec coverage:** Paper tokens (T1). Theme follows `data-theme` (T1). Type, measure, left column, outlined CTAs (T2). Features without card shadow, screenshots with sticker shadow (T2). Specimen unchanged (existing e2e in T2). App legal inherits tokens (T1/T2). Flatten gone (T2). Docs / product / verification (T3). Verify + dual review (T4). Out-of-scope items are Global Constraints.
2. **Placeholders:** None. Commands, CSS, and assertions are inlined.
3. **Type consistency:** `--app-*` aliases in T1 are what T2 paints. `PAPER` / `INK` / `INK_2` match `tokens.css`. `FLATTEN_APP_SHELL` is removed only in T2, after gradient text is gone.
