# Screenshot Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 個別ページの `#screenshots` を、ページ内の featured + サムネギャラリーにする。

**Architecture:** 切替の純粋関数を `src/lib/screenshot-gallery.ts` に置き、`ScreenshotGallery` が index を持つ。詳細ページだけがそれを描く。dialog は出さない。

**Tech Stack:** Next.js 静的 export、React 19 client component、Vitest、Playwright

## Global Constraints

- 1 Issue / 1 branch / 1 PR。ブランチは `cursor/screenshot-gallery-03db`
- モーダル、検索、フィルタ、新規イラスト、紙ノイズは足さない
- 英語 chrome、アプリ本文と alt は日本語
- cream `#fff8f1`、電圧ブルー、Newsreader / Inter
- `.reveal` の表示クラスは `.in`。className を DOM へ直接書かない
- `main` へマージしない（デプロイ承認なし）
- Node 24.20.0 / npm 11.6.2

---

### Task 1: 切替の純粋関数

**Files:**
- Create: `tests/screenshot-gallery.test.ts`
- Create: `src/lib/screenshot-gallery.ts`

**Interfaces:**
- Produces: `wrapIndex(index: number, length: number): number`
- Produces: `stepIndex(index: number, delta: number, length: number): number`
- Produces: `screenshotSrc(slug: string, file: string): string`
- Produces: `screenshotAlt(name: string, index: number): string`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { screenshotAlt, screenshotSrc, stepIndex, wrapIndex } from "../src/lib/screenshot-gallery";

describe("wrapIndex", () => {
  it("範囲内はそのまま", () => {
    expect(wrapIndex(2, 5)).toBe(2);
  });

  it("末尾の次は先頭", () => {
    expect(wrapIndex(5, 5)).toBe(0);
  });

  it("先頭の前は末尾", () => {
    expect(wrapIndex(-1, 5)).toBe(4);
  });

  it("件数が 0 なら 0", () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe("stepIndex", () => {
  it("正方向に 1 つ進む", () => {
    expect(stepIndex(0, 1, 4)).toBe(1);
  });

  it("最終から次は 0", () => {
    expect(stepIndex(3, 1, 4)).toBe(0);
  });

  it("先頭から前は最終", () => {
    expect(stepIndex(0, -1, 4)).toBe(3);
  });
});

describe("screenshot copy", () => {
  it("公開パスを slug とファイル名から作る", () => {
    expect(screenshotSrc("caflog", "2.png")).toBe("/apps/caflog/screenshots/2.png");
  });

  it("alt は 1 始まりの日本語", () => {
    expect(screenshotAlt("CafLog", 0)).toBe("CafLog スクリーンショット 1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/screenshot-gallery.test.ts`
Expected: FAIL because `src/lib/screenshot-gallery.ts` is missing

- [ ] **Step 3: Write minimal implementation**

```ts
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function stepIndex(index: number, delta: number, length: number): number {
  return wrapIndex(index + delta, length);
}

export function screenshotSrc(slug: string, file: string): string {
  return `/apps/${slug}/screenshots/${file}`;
}

export function screenshotAlt(name: string, index: number): string {
  return `${name} スクリーンショット ${index + 1}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/screenshot-gallery.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/screenshot-gallery.test.ts src/lib/screenshot-gallery.ts
git commit -m "スクショギャラリーの切替を先に固定する"
```

---

### Task 2: ギャラリー UI と詳細ページ

**Files:**
- Create: `src/components/ScreenshotGallery.tsx`
- Modify: `src/app/apps/[slug]/page.tsx`
- Modify: `src/styles/app-page.css`
- Modify: `tests/e2e/site.spec.ts`
- Modify: `docs/design/app-page.md`
- Modify: `docs/TODO.md`

**Interfaces:**
- Consumes: `screenshotSrc`, `screenshotAlt`, `stepIndex`
- Produces: `<ScreenshotGallery slug name files />` inside `#screenshots`

- [ ] **Step 1: Write the failing E2E assertions**

`#screenshots img` 件数一致と CafLog の `.shot-row` 最終行中央をやめ、次を入れる。

```ts
await expect(page.getByRole("heading", { name: "Screenshots", exact: true })).toBeVisible();
const featured = page.locator("#screenshots .shot-featured img");
await expect(featured).toHaveCount(1);
await expect(featured).toHaveAttribute("src", `/apps/${app.slug}/screenshots/${app.screenshots[0]}`);
await expect(featured).toHaveAttribute("alt", `${app.name} スクリーンショット 1`);
await expect.poll(() => featured.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
await expect(page.getByRole("dialog")).toHaveCount(0);
if (app.screenshots.length === 1) {
  await expect(page.locator("#screenshots .shot-thumbs")).toHaveCount(0);
} else {
  const thumbs = page.locator("#screenshots .shot-thumbs button");
  await expect(thumbs).toHaveCount(app.screenshots.length);
  await thumbs.nth(1).click();
  await expect(featured).toHaveAttribute("src", `/apps/${app.slug}/screenshots/${app.screenshots[1]}`);
  await expect(page.locator("#screenshots .shot-count")).toHaveText(`2 / ${app.screenshots.length}`);
  await page.locator(".shot-gallery").focus();
  await page.keyboard.press("ArrowRight");
  await expect(featured).toHaveAttribute("src", `/apps/${app.slug}/screenshots/${app.screenshots[2] ?? app.screenshots[0]}`);
}
```

- [ ] **Step 2: Run a focused e2e or keep it red until UI lands**

実装前は featured クラスが無いので失敗する。

- [ ] **Step 3: Implement the client gallery**

`ScreenshotGallery` は `files.length === 0` なら `null`。state は `index`。サムネは `aria-pressed`。Prev/Next の aria-label は `Previous screenshot` / `Next screenshot`。ギャラリー根に `tabIndex={0}` と `onKeyDown`。

- [ ] **Step 4: Replace `.shot-row` CSS with `.shot-gallery` / `.shot-featured` / `.shot-thumbs` / `.shot-step` / `.shot-count`**

- [ ] **Step 5: Update design docs and TODO**

- [ ] **Step 6: `npm run verify` and commit**
