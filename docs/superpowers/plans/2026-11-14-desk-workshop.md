# 机の上の工作室 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップとアプリのページを「同じ机の上」にそろえ、色をアプリに持たせ、一覧を拾い読みしやすくし、最後に机へアイコンの板が積もるようにする。

**Architecture:** アプリの色は registry の `accent` 1 か所に置き、カード・シール・帯・降る板がそこから読む。アプリのページは中身を変えず、`AppFrame` で前後を包む。降る板は three.js と cannon-es を npm から束ね、フッターが近づいてから動的 import する。

**Tech Stack:** Next.js 16（`output: "export"`）、React 19、TypeScript、zod、Vitest、Playwright（axe）、three 0.170.0、cannon-es 0.20.0。

**Spec:** `docs/superpowers/specs/2026-11-14-desk-workshop-direction-design.md`（とくに 5 章と 8 章）

## 進め方（PR の分け方）

`AGENTS.md` の 1 Issue / 1 branch / 1 PR に従い、4 つの PR に分ける。各 PR の最初に Issue を作り、ブランチは `claude/<issue>-<slug>`。各 PR は `npm run verify` を通し、Codex の読み取り専用レビュー（`ask-codex`）を受けてから PR にする。`main` へのマージは侑斗さんの承認のあと。

| PR | 中身 | Task |
|---|---|---|
| 1 | アプリの色、カード、シールの縁 | 1〜3 |
| 2 | トップの構成と飾りの整理、アプリの更新 | 4〜6 |
| 3 | アプリのページの共通の枠 | 7〜8 |
| 4 | 机に積もるアイコンの板 | 9 |

## Global Constraints

- 静的出力（`output: "export"`）。サーバー・DB・解析なし。絶対パスを使う。
- CSP は `script-src 'self'`・`img-src 'self' data:`。外の CDN・外の画像を読まない。`public/_headers` は変えない。
- `.reveal` などスクロール連動の表示は使わない。className を DOM へ直接書かない（状態は React の state と `data-*` 属性で表す）。
- `<html>` の `data-*` は初回から付ける（`layout.tsx` のインラインスクリプトと `SiteStateProvider` の二重構造を残す）。
- `tokens.css` のトークン名は変えない。ホームの色は `studio.css` の `.poster` の中に閉じる。
- `prefers-reduced-motion` では自動の動きを止める。light / dark とも、実際の配色で axe の `color-contrast` を通す。
- 今ある URL とページ内の目印（`#contact` など）を消さない。サポートは花島が `/apps/flower/support/`、ほかは `/#contact`。
- 架空の数字・実績を書かない。文言は今の `site-data.ts` と registry の事実だけ。
- App Store で公開中（`appStoreUrl` がある）のアプリだけ、値段・版・App Store へのリンクを出す。
- アプリの色（spec 8 章）: sublog `#1f86f5`、caflog `#ff7da0`、dev-tools `#2a9d8f`、pay-cycle `#ee3b2f`、simple-pomo `#fd8b21`、flower `#b0123a`。
- 机の地は今の空色（light `#dceeff`、dark `#162330`）。大きな装飾の文字「APP / LIBRARY」は残す。青い輪は外す。
- 降る物はアイコンの板だけ（アプリの色の板、表と裏にアイコン）。3D はトップのフッターの 1 か所だけ。

## Review Focus

1. **英語表示（EN）**: 新しい見出しと項目名（アプリの更新、このアプリについて、値段 など）が英語に切り替わる。registry の日本語の値（値段・分類）は `lang="ja"` のまま出る。→ Task 5・7 にテスト。
2. **公開前のアプリ**（`appStoreUrl` が null の SimplePomo・花島・Dev-Tools）: カードと「このアプリについて」に値段・版・App Store が出ない。→ Task 2・7 にテスト。
3. **保存した dark で明るい専用ページ**（CafLog・SubLog・PayCycle・花島）: 共通の帯とまとまりが明るい配色で出て、axe の `color-contrast` を通る。→ Task 8 にテスト。
4. **320px の幅**: カードの札（いちばん長い「無料・広告非表示の買い切りあり」）が折り返し、カードの外へはみ出さない。横スクロールが出ない。→ Task 2 にテスト。
5. **積もる板が読み込めないとき**（WebGL が無い、import が失敗する）: フッターの奥付・法務リンクはそのまま読めて押せる。コンソールに例外を投げっぱなしにしない。→ Task 9 にテスト。

---

## PR 1: アプリの色、カード、シールの縁

### Task 1: アプリの色を registry の `accent` に置く

**Files:**
- Modify: `src/data/registry.ts`（6 アプリの `accent`、CafLog の `price`）
- Test: `tests/registry.test.ts`

**Interfaces:**
- Produces: `app.accent` が「アプリの色」。後の Task はすべてここから読む。新しい関数は作らない。

- [ ] **Step 1: Issue を作る**（タイトル「アプリの色・カード・シールの縁」。本文は `.github/ISSUE_TEMPLATE/change.yml` の 5 項目。spec の 5.2・5.4・8 章を参照）。ブランチ `claude/<issue>-app-colors-cards` を `main` から作る。

- [ ] **Step 2: 失敗するテストを書く**（`tests/registry.test.ts`）

```ts
it("アプリの色は設計の 6 色で、互いに違う", () => {
  const expected: Record<string, string> = {
    sublog: "#1f86f5", caflog: "#ff7da0", "dev-tools": "#2a9d8f",
    "pay-cycle": "#ee3b2f", "simple-pomo": "#fd8b21", flower: "#b0123a",
  };
  expect(Object.fromEntries(apps.map((a) => [a.slug, a.accent.toLowerCase()]))).toEqual(expected);
  expect(new Set(apps.map((a) => a.accent.toLowerCase())).size).toBe(apps.length);
});

it("CafLog の値段は専用ページと同じく Pro があることを書く", () => {
  expect(getApp("caflog")?.price).toBe("無料・Pro あり（月額・年額）");
});
```

- [ ] **Step 3: 失敗を確かめる** — Run: `npx vitest run tests/registry.test.ts` / Expected: 2 件 FAIL（accent の不一致、price の不一致）

- [ ] **Step 4: `src/data/registry.ts` の 6 つの `accent` と CafLog の `price` を変える**。`color` は変えない。CafLog Pro の「月額と年額のプランがあります」は registry の機能の説明にある事実。

- [ ] **Step 5: 通ることを確かめる** — Run: `npx vitest run tests/registry.test.ts` / Expected: PASS

- [ ] **Step 6: Commit** — `git commit -m "アプリの色を registry の accent に置く (#<issue>)"`

### Task 2: 一覧のカードを「器は共通、窓はアプリの色」にする

**Files:**
- Modify: `src/components/AppsSection.tsx`
- Modify: `src/styles/studio.css`（`.poster .app-list > li:nth-child(n)` の `--app-card` の塗り分けを消す。`.poster .app-row` と `.app-row-visual` を書き換える）
- Modify: `src/lib/site-data.ts`（`Dict` に `app_price_label: string` を足す。ja「値段」、en「Price」。札の読み上げ用）
- Test: `tests/e2e/site.spec.ts`（テスト「作品カードは実画面と掲載情報を持ち…」）

**Interfaces:**
- Consumes: `app.accent`（Task 1）、`app.price`、`app.appStoreUrl`、`app.category`、`app.platforms`、`app.status`
- Produces: カードの DOM: `.app-row` に `style="--app-color: <accent>"`、`.app-row-visual` がその色で塗られる、札は `.app-row-tags > .app-row-tag[data-kind="category"|"platforms"|"price"|"status"]`。（`.chip` は使わない。既存のテストが `.chip` 0 件を確かめている）

- [ ] **Step 1: e2e のテストを書き換える**（同じテストの中に足す）

```ts
for (const app of apps) {
  const row = rows.filter({ has: page.getByText(app.name, { exact: true }) });
  await expect(row.locator(".app-row-visual")).toHaveCSS("background-color", cssRgb(app.accent));
  await expect(row.locator('.app-row-tag[data-kind="category"]')).toHaveText(app.category);
  await expect(row.locator('.app-row-tag[data-kind="platforms"]')).toHaveText(app.platforms.join("・"));
  await expect(row.locator('.app-row-tag[data-kind="price"]')).toHaveCount(app.appStoreUrl ? 1 : 0);
  if (app.appStoreUrl) await expect(row.locator('.app-row-tag[data-kind="price"]')).toHaveText(app.price);
  await expect(row.locator('.app-row-tag[data-kind="status"]')).toHaveCount(app.status === "release" ? 0 : 1);
  // 窓には文字を置かない（色の上の文字のコントラストを避ける）
  await expect(row.locator(".app-row-visual-label")).toHaveCount(0);
}
// Review Focus 4: 320px で札がカードからはみ出さず、横スクロールも出ない
await page.setViewportSize({ width: 320, height: 800 });
expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
for (const row of await rows.all()) {
  const box = (await row.boundingBox())!;
  for (const tag of await row.locator(".app-row-tag").all()) {
    const t = (await tag.boundingBox())!;
    expect(t.x + t.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
  }
}
```

- [ ] **Step 2: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "作品カード"` / Expected: FAIL（背景色が順番塗りの色、`.app-row-tag` が無い）

- [ ] **Step 3: `AppsSection.tsx` を書き換える**。`.app-row-visual-label` を消す。`.app-row-meta` の中身を `.app-row-tags` にし、`StatusMark` は `.app-row-tag[data-kind="status"]` を返す。値段の札は `app.appStoreUrl` があるときだけ、`lang="ja"` と `aria-label={`${t.app_price_label}: ${app.price}`}` を付ける。`--row-accent` は `--app-color` に名前を変える。年（`.app-row-year`）は残す。

- [ ] **Step 4: `studio.css` を書き換える**。プロトタイプ（Tool-UI-Design `outputs/yuto/2026-11-14-applibrary-desk-prototype/desk.css` の `.card`・`.card-window`・`.chip`）の形に合わせる: カードの地は `var(--paper-raised)`、枠 1.5px `var(--ink)`、角丸 24px、窓は `background: var(--app-color)` で下に 1.5px の枠、札は高さ 26px・角丸 999px・1px `var(--rule)`。札の並びは `flex-wrap: wrap`。

- [ ] **Step 5: 通ることを確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "作品カード|コントラスト"` / Expected: PASS

- [ ] **Step 6: Commit** — `git commit -m "一覧のカードの窓をアプリの色にし、札をそろえる (#<issue>)"`

### Task 3: アプリのシールにアプリの色の縁、文字のシールは紙とインク

**Files:**
- Modify: `src/components/VinylSticker.tsx`（prop `color?: string` を足し、`slotStyle` に `--app-color` を入れる）
- Modify: `src/components/Stickers.tsx`（アプリのシールに `color={getApp(item.slug)?.accent}` を渡す）
- Modify: `src/components/SpecimenSticker.tsx`（同じく `color={app.accent}`）
- Modify: `src/styles/standard.css`（`.sticker-slot[style*="--app-color"] .sticker` に 2.5px の輪）、`src/styles/studio.css`（105〜107 行の文字のシールの黄・ミント・ラベンダーを `var(--paper-raised)` と `var(--ink)` に）
- Modify: `docs/design/top.md`（「パステルの作品カード」「順番塗り」の記述を、spec 8 章の内容に置き換える）、`docs/decisions/2026-11-14-desk-workshop.md`（新規。置き換えた方針と理由を spec へリンク）
- Test: `tests/e2e/site.spec.ts`（テスト「アプリシールの形が違い、beta / alpha に印がある」）

**Interfaces:**
- Consumes: `app.accent`（Task 1）
- Produces: `VinylSticker` の prop `color?: string`。Task 7 の帯の小さいシールも使う。

- [ ] **Step 1: e2e にテストを足す**

```ts
for (const app of apps) {
  const sticker = page.locator(`.sticker-slot[data-key="${app.slug}"] .sticker`);
  expect(await sticker.evaluate((el) => getComputedStyle(el).boxShadow)).toContain(cssRgb(app.accent));
}
for (const key of ["note-Swift", "note-Tokyo", "note-solo"]) {
  const word = page.locator(`.sticker-slot[data-key="${key}"] .sticker`);
  expect(await word.evaluate((el) => getComputedStyle(el).boxShadow)).not.toMatch(/rgb\((31, 134, 245|255, 125, 160)\)/);
}
```

- [ ] **Step 2: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "アプリシールの形"` / Expected: FAIL

- [ ] **Step 3: 実装する**（Files のとおり）。

- [ ] **Step 4: PR 1 の全体の検証** — Run: `npm run verify` / Expected: すべて PASS。ローカルで `npm run start` し、BrowserOS Neo でトップを light / dark・1280 / 390px で見る。

- [ ] **Step 5: Commit と Codex のレビューと PR** — `git commit -m "シールの縁をアプリの色にし、文字のシールを紙とインクに (#<issue>)"`。`ask-codex` でブランチの差分を読んでもらい、指摘を直してから PR を作る。

---

## PR 2: トップの構成と飾りの整理、アプリの更新

### Task 4: 飾りを外し、机を枠のある面にする

**Files:**
- Modify: `src/components/Hero.tsx`（`.hero-orbit` の img、`.playground-spark` の svg、`.playground-label`、`.hero-tag` を消す。`.studio-strip` は Task 6 へ移すので消す）
- Delete: `public/home/playground/blue-orbit.webp`（`docs/design/home-assets.md` の記録は「使わなくなった」と残す）
- Modify: `src/styles/studio.css`（消した要素のスタイルを消す。`.poster .hero-playground` に 1.5px `var(--ink)` の枠・角丸 32px・地 `var(--paper-sunken)`・22px 間隔の点の模様）
- Test: `tests/e2e/site.spec.ts`（テスト「ホームは空色の遊び場と大きなワードマーク…」）

**Interfaces:**
- Consumes: なし
- Produces: `.hero-playground` は枠のある机。シールの計測（`--desk-play-*`）は変えない。

- [ ] **Step 1: Issue を作り**（「トップの構成と飾りの整理、アプリの更新」）、ブランチ `claude/<issue>-top-desk` を PR 1 のマージ後の `main` から作る。
- [ ] **Step 2: e2e を書き換える**: `.hero-orbit`・`.playground-spark`・`.playground-label`・`.hero-tag` が 0 件。ワードマークの既存の検証は残す。`.hero-playground` の `border-top-width` が `1.5px` 以上、`border-top-left-radius` が 32px。`.home-showcase`・`.workshop` の背景色の検証（`HOME.lavender`・`HOME.mint`）は消す。
- [ ] **Step 3: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "ホームは空色"` / Expected: FAIL
- [ ] **Step 4: 実装する**（Files のとおり）。
- [ ] **Step 5: 通ることを確かめる** — 同じコマンドで PASS。あわせて `-g "シール"` の既存テスト（遊び場に収まる、本文と CTA を覆わない）も PASS。
- [ ] **Step 6: Commit** — `git commit -m "青い輪と英語の飾りを外し、机を枠のある面にする (#<issue>)"`

### Task 5: 「A LITTLE CLOSER」を外し、作り手と連絡を紙の面にする

**Files:**
- Delete: `src/components/HomeShowcase.tsx`、`src/components/AppSpotlight.tsx`
- Modify: `src/app/page.tsx`（`<HomeShowcase />` を外す）
- Modify: `src/components/Sections.tsx`（`Workshop`: `.eyebrow` と `.workshop-flower` を消し、Hero から外した 3 つの事実〈`studio_intro`・`studio_apps`・`studio_made`〉を `.workshop-facts` として足す。`Contact`: `.contact-stamp` と `.eyebrow` を消す）
- Modify: `src/lib/site-data.ts`（`showcase_*`・`spotlight_*` を `Dict` から消す。`section_apps` を ja「アプリ」/ en「Apps」、`nav.posts` と `section_posts` を ja「アプリの更新」/ en「App updates」、`posts_intro` を ja「リリースや新しい機能のお知らせ。」/ en「Releases and new features.」に）
- Modify: `src/styles/studio.css`（`.home-showcase` 一式を消す。`.workshop` と `.contact-postcard` の地を `var(--paper-raised)`、枠 1.5px `var(--ink)`、角丸 28px に）
- Test: `tests/e2e/site.spec.ts`（「展示は…」の 2 つのテストを消す。「黄色い連絡先パネル…」を「連絡先の黒いリンクをキーボードで識別できる」にし、背景の検証を `HOME.white` に）

**Interfaces:**
- Consumes: なし
- Produces: `i18n.*.nav.posts`・`section_posts` の新しい文言（Task 6 が使う）

- [ ] **Step 1: e2e を書き換える**: `.home-showcase` が 0 件。`.workshop-facts` に 3 つの事実の文。`.contact-stamp` が 0 件。英語に切り替えると `#posts h2` が「App updates」（Review Focus 1）。
- [ ] **Step 2: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "ホーム|連絡先|手書き"` / Expected: FAIL
- [ ] **Step 3: 実装する**（Files のとおり。`AppSpotlight` を使っていたのは `HomeShowcase` だけか、`grep -rn AppSpotlight src` で確かめてから消す）。
- [ ] **Step 4: 通ることを確かめる** — 同じコマンドと `-g "コントラスト|テーマと言語"` で PASS。
- [ ] **Step 5: Commit** — `git commit -m "画面のぞきを外し、作り手と連絡を紙の面にする (#<issue>)"`

### Task 6: Notes を「アプリの更新」にする

**Files:**
- Modify: `src/lib/site-data.ts`（`Post` を `{ date: string; slug: string; title: string }` に。中身を下の 4 件に置き換える）
- Modify: `src/components/Sections.tsx`（`Posts`: 各行にアプリのアイコン〈`/apps/<slug>/<icon>`、`alt=""`、縁は `--app-color`〉とアプリ名の小さい行。`.post-excerpt` は消す）
- Modify: `src/styles/studio.css`（`.post` の並びをプロトタイプの `.updates li` に合わせる）
- Modify: `docs/design/top.md`（画面構成の 4〜5 番を新しい構成に）
- Test: `tests/registry.test.ts`（posts の検証）、`tests/e2e/site.spec.ts`

**Interfaces:**
- Consumes: `getApp(slug)`、`app.accent`
- Produces: `posts: Post[]`、`Post = { date: string; slug: string; title: string }`

- [ ] **Step 1: 4 件の下書きを侑斗さんに見せて OK をもらう**（spec 5.6。registry の `releaseDate` から作った見本。OK が出るまで PR を出さない）:
  - 2026-09-24 / pay-cycle / PayCycle を App Store で公開
  - 2026-04-14 / sublog / SubLog を App Store で公開
  - 2026-04-10 / caflog / CafLog を App Store で公開
  - 2026-03-30 / dev-tools / Dev-Tools を β で公開
- [ ] **Step 2: 失敗するテストを書く**（`tests/registry.test.ts`）

```ts
it("アプリの更新はすべて掲載中のアプリの話で、新しい順", () => {
  for (const post of posts) expect(getApp(post.slug), post.slug).toBeDefined();
  const dates = posts.map((p) => p.date);
  expect(dates).toEqual([...dates].sort().reverse());
});
```

- [ ] **Step 3: 失敗を確かめる** — Run: `npx vitest run tests/registry.test.ts` / Expected: FAIL（`slug` が無い）
- [ ] **Step 4: 実装する**（Files のとおり。Step 1 で OK になった文言を使う）。
- [ ] **Step 5: PR 2 の全体の検証** — Run: `npm run verify` / Expected: PASS。BrowserOS Neo でトップを light / dark・ja / en・1280 / 390px で見る。
- [ ] **Step 6: Commit と Codex のレビューと PR** — `git commit -m "Notes をアプリの更新にする (#<issue>)"`

---

## PR 3: アプリのページの共通の枠

### Task 7: 共通の枠の部品とリンクの決め方

**Files:**
- Create: `src/lib/app-links.ts`
- Create: `src/components/AppFrame.tsx`
- Create: `src/styles/app-frame.css`（`src/app/apps/[slug]/page.tsx` と法務の 3 ページから import）
- Modify: `src/lib/site-data.ts`（`Dict` に `frame_back`・`about_title`・`about_price`・`about_version`・`about_platforms`・`about_status`・`about_category`・`about_store`・`about_support`・`about_privacy`・`about_terms`・`others_title` を足す。ja はプロトタイプ `caflog.html` の文言、en は "← AppLibrary"・"About this app"・"Price"・"Version"・"Platforms"・"Status"・"Category"・"Download on the App Store"・"Support & contact"・"Privacy policy"・"Terms of use"・"Other apps"）
- Test: `tests/app-links.test.ts`（新規）

**Interfaces:**
- Consumes: `app.accent`・`app.appStoreUrl`・`app.price`・`app.version`、`termsDocuments`（`src/data/terms/registry.ts`）、`supportDocuments`（`src/data/support/registry.ts`）、`VinylSticker` の `color`（Task 3）
- Produces:
  - `appLinks(app: App): { support: string; privacy: string; terms: string | null; store: string | null }`
  - `AppFrameStrip({ app }: { app: App })`: 上の帯。「← AppLibrary」（`href="/"`）、小さいシール、アプリ名、分類。
  - `AppFrame({ app, light, children }: { app: App; light: boolean; children: React.ReactNode })`: 帯 → children → 「このアプリについて」→「ほかのアプリ」。ルートは `<div className="app-frame" data-frame-light={light ? "" : undefined} style={{ "--app-color": app.accent }}>`。
  - クラス名（Task 8 のテストが使う）: 帯 `.app-frame-strip`、「このアプリについて」の `section.app-frame-about`（見出しは `h2`）、「ほかのアプリ」の `section.app-frame-others`（中のリンクは残りの全アプリ）。

- [ ] **Step 1: Issue を作り**（「アプリのページの共通の枠」）、ブランチ `claude/<issue>-app-frame` を `main` から作る。
- [ ] **Step 2: 失敗するテストを書く**（`tests/app-links.test.ts`）

```ts
it("サポートは花島だけ専用ページ、ほかは連絡先", () => {
  expect(appLinks(getApp("flower")!).support).toBe("/apps/flower/support/");
  expect(appLinks(getApp("caflog")!).support).toBe("/#contact");
});
it("利用規約は持つアプリだけ", () => {
  expect(appLinks(getApp("caflog")!).terms).toBe("/apps/caflog/terms/");
  expect(appLinks(getApp("sublog")!).terms).toBeNull();
});
it("App Store は公開中のアプリだけ", () => {
  expect(appLinks(getApp("pay-cycle")!).store).toBe(getApp("pay-cycle")!.appStoreUrl);
  for (const slug of ["simple-pomo", "flower", "dev-tools"]) expect(appLinks(getApp(slug)!).store).toBeNull();
});
it("プライバシーは全アプリ", () => {
  for (const app of apps) expect(appLinks(app).privacy).toBe(`/apps/${app.slug}/privacy/`);
});
```

- [ ] **Step 3: 失敗を確かめる** — Run: `npx vitest run tests/app-links.test.ts` / Expected: FAIL（モジュールが無い）
- [ ] **Step 4: `appLinks` を実装し、通ることを確かめる** — 同じコマンドで PASS。
- [ ] **Step 5: `AppFrame.tsx` と `app-frame.css` を作る**。見た目はプロトタイプ `caflog.html` の `.strip`・`.facts-card`・`.mini-card`。「このアプリについて」の値段・版・App Store は `appLinks(app).store` があるときだけ。値段と分類の値には `lang="ja"`。`data-frame-light` のときは、保存テーマが dark でも light の値（`--paper` `#dceeff` 系ではなく、紙 `#ffffff` の面と `#111111` の文字）を使う。dark で `data-frame-light` が無いときはサイトの dark の値。
- [ ] **Step 6: Commit** — `git commit -m "アプリのページの共通の枠の部品を作る (#<issue>)"`

### Task 8: 全アプリのページと法務のページに枠を付け、重なるリンクを片づける

**Files:**
- Modify: `src/app/apps/[slug]/page.tsx`（6 つの return をすべて `AppFrame` で包む。`light` は `["caflog", "sublog", "pay-cycle", "flower"]` に入るとき true。SimplePomo と Dev-Tools は保存テーマに従うので false）
- Modify: `src/app/apps/[slug]/privacy/page.tsx`・`terms/page.tsx`・`support/page.tsx`（先頭に `AppFrameStrip` だけ）
- Modify: `src/components/CafLogPage.tsx`・`PayCyclePage.tsx`・`SimplePomoPage.tsx`・`FlowerPage.tsx`・`SubLogPage.tsx` と、`page.tsx` の共通ひな形のフッター（サポート・プライバシー・利用規約・← AppLibrary の `nav` を消す。ブランド名の行は残す）。PayCycle の FAQ の中の文章リンク（117 行）は文中なので残す。
- Modify: `docs/design/app-page.md`（「共通の枠」の節を足す。CafLog の Hero の画面は `screenshots/1.webp` に直す）
- Test: `tests/e2e/site.spec.ts`（アプリごとのループのテスト〈1029 行〉と、CafLog・SubLog・PayCycle の dark のテスト）

**Interfaces:**
- Consumes: `AppFrame`・`AppFrameStrip`・`appLinks`（Task 7）
- Produces: なし

- [ ] **Step 1: e2e を書き換える**（アプリごとのループに足す）

```ts
const frame = page.locator(".app-frame");
await expect(frame.locator('.app-frame-strip a[href="/"]')).toBeVisible();
const about = frame.locator(".app-frame-about");
await expect(about.getByRole("link", { name: /App Store/ })).toHaveCount(app.appStoreUrl ? 1 : 0);
await expect(about.getByText(app.price, { exact: true })).toHaveCount(app.appStoreUrl ? 1 : 0);
await expect(about.locator(`a[href="${app.slug === "flower" ? "/apps/flower/support/" : "/#contact"}"]`)).toHaveCount(1);
await expect(about.locator(`a[href="/apps/${app.slug}/privacy/"]`)).toHaveCount(1);
await expect(frame.locator(".app-frame-others a")).toHaveCount(apps.length - 1);
// 重なるリンクが残っていない: 「← AppLibrary」へのリンクはページ全体で帯の 1 つだけ
await expect(page.locator('a[href="/"]', { hasText: "AppLibrary" })).toHaveCount(1);
```

  CafLog・SubLog・PayCycle の「保存した dark でも…」のテストに足す（Review Focus 3）: `.app-frame-strip` と `.app-frame-about` の背景が `rgb(255, 255, 255)`、文字が `rgb(17, 17, 17)`。そのうえで axe の `color-contrast` を `.app-frame` に対して実行して違反 0。英語に切り替えると `.app-frame-about h2` が「About this app」（Review Focus 1）。
- [ ] **Step 2: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "詳細とプライバシー|dark"` / Expected: FAIL
- [ ] **Step 3: 実装する**（Files のとおり）。
- [ ] **Step 4: PR 3 の全体の検証** — Run: `npm run verify` / Expected: PASS。BrowserOS Neo で 6 つのアプリのページと花島のサポートを light / dark・1280 / 390px で見る。
- [ ] **Step 5: Commit と Codex のレビューと PR** — `git commit -m "全アプリのページに共通の枠を付け、重なるリンクを片づける (#<issue>)"`

---

## PR 4: 机に積もるアイコンの板

### Task 9: フッターに積もるアイコンの板

**Files:**
- 取り込み: 試作のコミット `5cd3ed9`（ブランチ `claude/spike-falling-footer`）の `package.json`・`package-lock.json`（three 0.170.0、cannon-es 0.20.0、@types/three 0.170.0）、`src/lib/falling-pile.ts`、`src/components/FallingFooter.tsx`、`src/app/page.tsx` と `src/styles/studio.css` の該当部分。`git cherry-pick 5cd3ed9` で取り込み、下の変更をかける。
- Modify: `src/lib/falling-pile.ts`
- Modify: `src/components/FallingFooter.tsx`
- Modify: `docs/design/top.md`（フッターの節）、`src/lib/site-data.ts` は変えない
- Test: `tests/e2e/site.spec.ts`（新しいテスト 3 つ）

**Interfaces:**
- Consumes: registry の `apps`（`slug`・`accent`・`icon`）
- Produces:
  - `createPile(canvas: HTMLCanvasElement, zone: HTMLElement, items: PileItem[]): Pile`
  - `type PileItem = { color: string; icon: string }`（`icon` は `/apps/<slug>/<icon>` の絶対パス）
  - `type Pile = { replay: () => void; destroy: () => void }`
  - `FallingFooter` は読み込みが終わったら、包む要素に `data-pile="ready"`、失敗したら `data-pile="off"` を state から付ける（DOM へ直接書かない）

- [ ] **Step 1: Issue を作り**（「机に積もるアイコンの板」）、ブランチ `claude/<issue>-falling-tiles` を `main` から作り、`git cherry-pick 5cd3ed9`。
- [ ] **Step 2: e2e に失敗するテストを書く**

```ts
test("積もる板はフッターが近づくまで読まず、外へは通信しない", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => { if (!r.url().startsWith("http://127.0.0.1")) external.push(r.url()); });
  await page.goto("/");
  await expect(page.locator(".fall-zone")).not.toHaveAttribute("data-pile", "ready");
  await page.locator(".fall-zone").scrollIntoViewIfNeeded();
  await expect(page.locator(".fall-zone")).toHaveAttribute("data-pile", "ready");
  await expect(page.locator(".fall-canvas")).toHaveAttribute("aria-hidden", "true");
  expect(external).toEqual([]);
});

test("WebGL が無くても、フッターの奥付と法務リンクを使える", async ({ page }) => {
  await page.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator(".fall-zone").scrollIntoViewIfNeeded();
  await expect(page.locator(".fall-zone")).toHaveAttribute("data-pile", "off");
  await page.locator(".colophon summary").click();
  await expect(page.locator(".colophon-body")).toBeVisible();
  await page.getByRole("link", { name: i18n.ja.privacy }).click();
  await expect(page).toHaveURL(/\/privacy\/$/u);
  expect(errors).toEqual([]);
});

test("reduced-motion では積もった後の 1 枚だけを描く", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".fall-zone").scrollIntoViewIfNeeded();
  await expect(page.locator(".fall-zone")).toHaveAttribute("data-pile", "ready");
  await expect(page.locator(".fall-zone")).toHaveAttribute("data-pile-motion", "still");
});
```

- [ ] **Step 3: 失敗を確かめる** — Run: `npm run build && npx playwright test tests/e2e/site.spec.ts -g "積もる板|WebGL|reduced-motion では積もった"` / Expected: FAIL
- [ ] **Step 4: `falling-pile.ts` を変える**: 形はアイコンの板だけ（積み木・球・`SIZES` を消す）。板は `RoundedBoxGeometry(s, 0.42, s)`、`s` は 1.7〜2.3（640px 以下は 0.9 倍）、アプリの色の `MeshStandardMaterial`、表と裏にアイコンの `PlaneGeometry`（`TextureLoader`、`colorSpace = SRGBColorSpace`、一辺 `s * 0.84`）。数は 34（640px 以下は 18）。奥の壁は `floorPoint(-1, 0.5)`（試作と同じ）。`window.__pile` を消す。`WebGLRenderer` の生成が例外を投げたら呼び出し元へ投げる（Step 5 で受ける）。
- [ ] **Step 5: `FallingFooter.tsx` を変える**: `items` を registry から作って渡す。`import()` と `createPile` を try/catch で包み、成功で `data-pile="ready"`、失敗で `"off"`。`prefers-reduced-motion` のときは `data-pile-motion="still"`、ほかは `"move"`。
- [ ] **Step 6: 通ることを確かめる** — Step 3 のコマンドで PASS。
- [ ] **Step 7: PR 4 の全体の検証** — Run: `npm run verify` / Expected: PASS。`out/` の中で three を含むチャンクが、トップの最初の HTML から読まれていないこと（`grep -l "WebGLRenderer" out/_next/static/chunks/*.js` で出たファイル名が `out/index.html` に無い）。BrowserOS Neo の前面のタブで、降ってくる動きを light / dark・1280 / 390px で見る。
- [ ] **Step 8: Commit と Codex のレビューと PR** — `git commit -m "フッターにアイコンの板が積もる (#<issue>)"`

---

## 終わったら

- spec の 7 章の 4 番（`docs/design/top.md`・`app-page.md`・`docs/decisions/`）が 4 つの PR で全部反映されたか確かめる。
- 試作のブランチ `claude/spike-falling-footer` は、PR 4 のマージ後に消してよいか侑斗さんに聞く。
