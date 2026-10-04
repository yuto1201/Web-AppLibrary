import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { apps } from "../../src/data/registry";
import { DESK_ITEMS } from "../../src/lib/sticker-desk";
import { appPageTone } from "../../src/lib/app-tone";
import { statusLabel } from "../../src/lib/labels";
import { i18n } from "../../src/lib/site-data";

test("AdMob の公開 seller ファイルを正しい形式で配信する", async ({ request }) => {
  const response = await request.get("/app-ads.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^text\/plain(?:;|$)/u);
  expect(await response.text()).toBe("google.com, pub-6131120324499407, DIRECT, f08c47fec0942fa0\n");
});

const privacyContacts: Record<string, { label: string; url: string }> = {
  "pay-cycle": { label: "開発者の連絡先", url: "https://app.yutodev.com/#contact" },
  sublog: {
    label: "SubLog お問い合わせフォーム",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfm2fsJLBAy4CVIBscx2ueab2znR5pYTzxZo7ntUULdtaoODg/viewform",
  },
  caflog: {
    label: "CafLog お問い合わせフォーム",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfwkDqyQ_NutiUPmFnTw01q9hIgVFbHFzGJp95h6qgYd5awQQ/viewform",
  },
  "dev-tools": { label: "Dev-Tools お問い合わせ", url: "https://github.com/yuto1201/Dev-Tools/issues" },
};

/** 紙面の配色。トークンを変えたらここも合わせる。 */
const PAPER = { light: "rgb(255, 248, 241)", dark: "rgb(18, 16, 14)" } as const;
const INK = { light: "rgb(0, 0, 0)", dark: "rgb(255, 248, 241)" } as const;
const INK_2 = { light: "rgb(63, 59, 54)", dark: "rgb(200, 194, 184)" } as const;
const CAFLOG = { canvas: "rgb(250, 249, 247)", ink: "rgb(32, 32, 36)", white: "rgb(255, 255, 255)" } as const;
const SUBLOG = { paper: "rgb(247, 248, 245)" } as const;
const PAYCYCLE = { paper: "rgb(246, 244, 240)" } as const;
const HOME = {
  light: { paper: "rgb(220, 238, 255)", ink: "rgb(17, 17, 17)" },
  dark: { paper: "rgb(22, 35, 48)", ink: "rgb(242, 246, 250)" },
  black: "rgb(17, 17, 17)",
  white: "rgb(255, 255, 255)",
  focus: "rgb(22, 75, 202)",
  lavender: "rgb(233, 204, 255)",
  mint: "rgb(85, 219, 156)",
  yellow: "rgb(255, 215, 49)",
} as const;

function cssRgb(hex: string) {
  const value = hex.slice(1);
  return `rgb(${Number.parseInt(value.slice(0, 2), 16)}, ${Number.parseInt(value.slice(2, 4), 16)}, ${Number.parseInt(value.slice(4, 6), 16)})`;
}

/** アニメーションだけ止める。色は実際の値のまま axe に判定させる。 */
const FREEZE = "html *, html *::before, html *::after { animation: none !important; transition: none !important; }";

async function freezeMotion(page: Page) {
  await page.addStyleTag({ content: FREEZE });
}

/**
 * 実際に描かれている配色でコントラストを検証する。
 * 半透明パネルをやめて背景が解決できるようになったため、色の上書きは行わない。
 */
async function expectColorContrast(page: Page, include?: string) {
  await page.addStyleTag({ content: FREEZE });
  let builder = new AxeBuilder({ page }).withRules(["color-contrast", "link-name", "label", "button-name"]);
  if (include) builder = builder.include(include);
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
  expect(results.incomplete.filter(({ id }) => id === "color-contrast")).toEqual([]);
  expect(results.passes.some(({ id }) => id === "color-contrast")).toBe(true);
}

/** 言語 h2 より条項 h3 を一段小さくし、本文より小さくしない。字重はどちらも 400。 */
async function expectLegalHeadingHierarchy(page: Page) {
  const h2 = page.locator(".privacy-page h2").first();
  const h3 = page.locator(".privacy-page h3").first();
  await expect(h2).toBeVisible();
  await expect(h3).toBeVisible();
  await expect(h2).toHaveCSS("font-weight", "400");
  await expect(h3).toHaveCSS("font-weight", "400");
  const [h2Size, h3Size, pSize, h2Top, h3Top] = await page.evaluate(() => {
    const heading2 = document.querySelector(".privacy-page h2");
    const heading3 = document.querySelector(".privacy-page h3");
    const paragraph = document.querySelector(".privacy-page p");
    if (
      !(heading2 instanceof HTMLElement)
      || !(heading3 instanceof HTMLElement)
      || !(paragraph instanceof HTMLElement)
    ) {
      throw new Error("expected app-legal h2, h3, and p");
    }
    const second = getComputedStyle(heading2);
    const third = getComputedStyle(heading3);
    const body = getComputedStyle(paragraph);
    return [
      parseFloat(second.fontSize),
      parseFloat(third.fontSize),
      parseFloat(body.fontSize),
      parseFloat(second.marginTop),
      parseFloat(third.marginTop),
    ];
  });
  expect(h3Size).toBeLessThan(h2Size);
  expect(h3Size).toBeGreaterThanOrEqual(pSize);
  expect(h3Top).toBeLessThan(h2Top);
}

/**
 * CSS の matrix(a, b, c, d, e, f) から回転角度 (deg) を取り出す。
 * 一様な scale は a・b を同じ倍率で伸ばすだけなので atan2 の比には影響しない。
 * --spin という「値」だけでなく、実際に描画される transform（cascade の勝者）を
 * 見るためのもの。CSS の詳細度勝負で --spin が無視される回帰を検出できる。
 */
/** 山で重なったシールの下側を掴む。重ね順はスロットのスタッキング文脈で決まる。 */
async function raiseSticker(sticker: import("@playwright/test").Locator) {
  await sticker.evaluate((el) => {
    const poster = el.closest(".poster") ?? document.querySelector(".poster");
    if (poster) {
      for (const slot of poster.querySelectorAll(".sticker-slot")) {
        if (slot instanceof HTMLElement) {
          // play-state: paused だと初回着地の from 姿勢で固まる。none なら静止位置。
          slot.style.animation = "none";
        }
      }
    }
    const slot = el.closest(".sticker-slot");
    if (slot instanceof HTMLElement) slot.style.zIndex = "1000";
  });
}

function rotationDegrees(matrix: string): number {
  const values = matrix.match(/matrix\(([^)]+)\)/u)?.[1]?.split(",").map(Number);
  if (!values || values.length < 4) return 0;
  const [a, b] = values;
  return (Math.atan2(b!, a!) * 180) / Math.PI;
}

type Box = { x: number; y: number; width: number; height: number };

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function expectInitialPlayground(page: Page, context: string) {
  await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
  await freezeMotion(page);
  const board = (await page.locator(".hero-playground").boundingBox())!;
  expect(board, `${context} playground`).not.toBeNull();
  const protectedBoxes = {
    h1: (await page.locator(".hero-h1").boundingBox())!,
    bio: (await page.locator(".hero-bio").boundingBox())!,
    note: (await page.locator(".hero-note").boundingBox())!,
    hint: (await page.locator(".desk-hint").boundingBox())!,
    cta: (await page.locator(".cta-btn").boundingBox())!,
    controls: (await page.locator(".stickers-foot").boundingBox())!,
  };
  const controls = protectedBoxes.controls;
  expect(controls.y, `${context} controls reservation`).toBeGreaterThanOrEqual(board.y + board.height - 72 - 1);
  expect(controls.y + controls.height, `${context} controls bottom`).toBeLessThanOrEqual(board.y + board.height + 1);
  expect(controls.x, `${context} controls left`).toBeGreaterThanOrEqual(board.x - 1);
  expect(controls.x + controls.width, `${context} controls right`).toBeLessThanOrEqual(board.x + board.width + 1);

  const stickers = page.locator(".poster .sticker-slot .sticker");
  await expect(stickers).toHaveCount(DESK_ITEMS.length);
  const initialBoxes: { key: string | null | undefined; box: Box }[] = [];
  for (const sticker of await stickers.all()) {
    const painted = (await sticker.boundingBox())!;
    const key = await sticker.evaluate((el) => el.closest(".sticker-slot")?.getAttribute("data-key"));
    expect(painted.x, `${context} ${key} left`).toBeGreaterThanOrEqual(board.x - 1);
    expect(painted.x + painted.width, `${context} ${key} right`).toBeLessThanOrEqual(board.x + board.width + 1);
    expect(painted.y, `${context} ${key} top`).toBeGreaterThanOrEqual(board.y - 1);
    expect(painted.y + painted.height, `${context} ${key} bottom`).toBeLessThanOrEqual(board.y + board.height - 72 + 1);
    for (const previous of initialBoxes) {
      expect(boxesOverlap(painted, previous.box), `${context} ${key} × ${previous.key}`).toBe(false);
    }
    initialBoxes.push({ key, box: painted });
    for (const [name, target] of Object.entries(protectedBoxes)) {
      expect(boxesOverlap(painted, target), `${context} ${key} × ${name}`).toBe(false);
    }
  }
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

async function centerHits(page: Page, target: ReturnType<typeof page.locator>, selector: string) {
  // 遊び場の下にある本文・CTA は、利用者と同じくスクロールしてから届くか確かめる。
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  return page.evaluate(
    ({ x, y, sel }) => Boolean(document.elementFromPoint(x, y)?.closest(sel)),
    { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2, sel: selector },
  );
}

async function setStoredState(page: Page, state: Record<string, string>) {
  await page.evaluate((value) => localStorage.setItem("applibrary_state", value), JSON.stringify(state));
}

async function exportedIndexRoutes(directory = "out", prefix = ""): Promise<string[]> {
  const routes: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    if (entry.isDirectory()) {
      routes.push(...await exportedIndexRoutes(path.join(directory, entry.name), relative));
    } else if (entry.name === "index.html" && !["404", "_not-found"].includes(prefix)) {
      routes.push(prefix ? `/${prefix}/` : "/");
    }
  }
  return routes;
}

test.describe("静的 HTML の初期表示", () => {
  test.use({ javaScriptEnabled: false });
  test("計測前のシールを旧位置へ出さず、作品へのリンクは使える", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".poster")).not.toHaveAttribute("data-desk", "ready");
    for (const slot of await page.locator(".poster .sticker-slot").all()) {
      await expect(slot).toBeHidden();
    }
    await expect(page.locator(".stickers-foot")).toBeHidden();
    await expect(page.locator(".hero-wordmark")).toBeVisible();
    await expect(page.locator(".app-row")).toHaveCount(apps.length);
    await page.locator('.app-row[href="/apps/sublog/"]').click();
    await expect(page).toHaveURL(/\/apps\/sublog\/$/u);
  });
});

test("ホームは空色の遊び場と大きなワードマーク、黒いピルで作品へ案内する", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.locator("body")).toHaveCSS("background-color", HOME.light.paper);
  await expect(page.locator("body")).toHaveCSS("color", HOME.light.ink);
  await expect(page.locator(".nav-inner")).toHaveCSS("background-color", HOME.white);
  await expect(page.locator(".nav-brand")).toContainText("AppLibrary");
  await expect(page.locator(".nav-brand")).toContainText("uesugiyuuto");

  const html = await page.content();
  expect(html.toLowerCase()).not.toContain("bricolage");
  const board = page.locator(".hero-playground");
  await expect(board).toBeVisible();
  const wordmark = board.locator(".hero-wordmark");
  await expect(wordmark).toHaveAttribute("aria-hidden", "true");
  await expect(wordmark).toHaveAttribute("viewBox", "0 0 700 300");
  await expect(wordmark).toHaveAttribute("focusable", "false");
  await expect(wordmark).toBeVisible();
  await expect(wordmark.locator("path")).toHaveCount(2);
  await expect(wordmark.locator("text")).toHaveCount(0);
  await expect(wordmark).toHaveCSS("color", HOME.black);
  // 装飾ロゴはアウトラインの図形。本文のフォント検証と混同しない。
  const wordmarkBox = (await wordmark.boundingBox())!;
  expect(wordmarkBox.width).toBeGreaterThan(500);
  expect(wordmarkBox.height).toBeGreaterThan(200);

  const ornament = board.locator(".hero-orbit");
  await expect(ornament).toHaveAttribute("src", "/home/playground/blue-orbit.webp");
  await expect(ornament).toHaveAttribute("alt", "");
  await expect(ornament).toHaveAttribute("aria-hidden", "true");
  await expect.poll(() => ornament.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".home-hero-picture")).toHaveCount(0);

  const heading = page.locator(".hero-h1");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(heading).toHaveAccessibleName(i18n.ja.hero_h1_a + i18n.ja.hero_h1_b);
  await expect(heading).toHaveCSS("color", HOME.black);
  expect(await heading.evaluate((el) => Number(getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(800);
  const boardBox = (await board.boundingBox())!;
  const headingBox = (await heading.boundingBox())!;
  expect(headingBox.y).toBeGreaterThanOrEqual(boardBox.y + boardBox.height);

  const cta = page.locator(".cta-btn");
  await expect(cta).toHaveCSS("color", HOME.white);
  await expect(cta).toHaveCSS("background-color", HOME.black);
  await expect(cta).toHaveAttribute("href", "#apps");
  expect(await cta.evaluate((el) => Number.parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(24);
  await expect(page.locator(".home-showcase")).toHaveCSS("background-color", HOME.lavender);
  await expect(page.locator(".workshop")).toHaveCSS("background-color", HOME.mint);

  await page.getByRole("button", { name: "ダークモードに切り替える" }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", HOME.dark.paper);
  await expect(page.locator("body")).toHaveCSS("color", HOME.dark.ink);
  await expect(heading).toHaveCSS("color", HOME.dark.ink);
  await expect(cta).toHaveCSS("color", HOME.white);
  await expect(cta).toHaveCSS("background-color", HOME.black);
});

test("黄色い連絡先パネルの黒いリンクをキーボードで識別できる", async ({ page }) => {
  await page.goto("/#contact");
  const socials = page.locator(".contact-postcard .social-link");
  await socials.first().focus();
  await page.keyboard.press("Tab");
  await expect(socials.nth(1)).toBeFocused();
  await expect(socials.nth(1)).toHaveCSS("color", HOME.black);
  await expect(socials.nth(1)).toHaveCSS("outline-color", HOME.focus);
  await expect(socials.nth(1)).toHaveCSS("outline-style", "solid");
  await expect(socials.nth(1)).toHaveCSS("outline-width", "3px");
  await expect(page.locator(".contact-postcard")).toHaveCSS("background-color", HOME.yellow);
});

test("手書きの紹介は日英で読める", async ({ page }) => {
  await page.goto("/");
  const hint = page.locator(".desk-hint");
  await expect(hint).toHaveText(i18n.ja.desk_hint);
  const hintFont = await hint.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(hintFont.toLowerCase()).toMatch(/klee/);
  const kleePaintsJa = await hint.evaluate(async (el) => {
    const text = el.textContent ?? "";
    const style = getComputedStyle(el);
    const primary = style.fontFamily.split(",")[0]?.trim() ?? "";
    const spec = `${style.fontWeight} ${style.fontSize} ${primary}`;
    await document.fonts.load(spec, text);
    await document.fonts.ready;
    return document.fonts.check(spec, text);
  });
  expect(kleePaintsJa).toBe(true);
  const html = await page.content();
  expect(html.toLowerCase()).not.toContain("bricolage");

  await page.getByRole("button", { name: "英語に切り替える" }).click();
  await expect(page.locator(".desk-hint")).toHaveText(i18n.en.desk_hint);
});

test("Klee One を全ページへ preload しない", async ({ page }) => {
  for (const route of ["/", "/privacy/", "/apps/sublog/"]) {
    await page.goto(route);
    const hrefs = await page.locator('link[rel="preload"][as="font"]').evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLLinkElement).href.toLowerCase()),
    );
    expect(hrefs.some((href) => href.includes("klee")), route).toBe(false);
  }
});

test("作品カードは実画面と掲載情報を持ち、検索・フィルタ・モーダルを持たない", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  const rows = page.locator(".app-row");
  await expect(rows).toHaveCount(apps.length);
  await expect(page.locator(".section-count").first()).toHaveText(String(apps.length));

  // 掲載数に対して過剰だった操作系は撤去済み。
  await expect(page.locator("#search-input")).toHaveCount(0);
  await expect(page.locator(".chip")).toHaveCount(0);
  await expect(page.getByText("プラットフォーム", { exact: true })).toHaveCount(0);
  await expect(page.getByText("カテゴリ", { exact: true })).toHaveCount(0);

  // 掲載中の全アプリを、実画面・名前・説明・年が揃ったリンクとして紹介する。
  for (const app of apps) {
    const row = rows.filter({ has: page.getByText(app.name, { exact: true }) });
    await expect(row).toHaveAttribute("href", `/apps/${app.slug}/`);
    await expect(row.locator(".app-row-tagline")).toHaveText(app.tagline);
    await expect(row.locator(".app-row-year")).toHaveText(String(app.year));
    const preview = row.locator(".app-row-visual .app-preview-phone img");
    await preview.scrollIntoViewIfNeeded();
    await expect(preview).toHaveAttribute("alt", "");
    await expect(preview).toHaveAttribute("src", app.screenshots[0] ? `/apps/${app.slug}/screenshots/${app.screenshots[0]}` : `/apps/${app.slug}/${app.icon}`);
    await expect(row.locator(".app-preview-phone")).toHaveAttribute("data-kind", app.screenshots.length ? "screen" : "icon");
    await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  }

  const first = (await rows.nth(0).boundingBox())!;
  const second = (await rows.nth(1).boundingBox())!;
  for (const row of await rows.all()) {
    expect(await row.evaluate((el) => Number.parseFloat(getComputedStyle(el).borderTopLeftRadius))).toBeGreaterThanOrEqual(24);
  }
  expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(1);
  expect(second.x).toBeGreaterThan(first.x + first.width);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileFirst = (await rows.nth(0).boundingBox())!;
  const mobileSecond = (await rows.nth(1).boundingBox())!;
  expect(Math.abs(mobileFirst.x - mobileSecond.x)).toBeLessThanOrEqual(1);
  expect(mobileSecond.y).toBeGreaterThan(mobileFirst.y + mobileFirst.height);

  // カードのクリックはモーダルを開かず、そのまま個別ページへ移る。
  await rows.first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/apps\/[a-z-]+\/$/u);
});

test("ステッカーは掴んで動かせて、離すと横スクロールを作らない", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator('.sticker[href="/apps/sublog/"]');
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();

  await expect(page.locator(".sticker-band")).toHaveCount(0);
  await expect(page.locator(".sticker-name")).toHaveCount(0);

  // 初期表示の時点で紙面は横に伸びていない。
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    .toBe(0);

  const deskPoint = () =>
    sticker.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return { x: box.x + window.scrollX, y: box.y + window.scrollY };
    });
  const origin = await deskPoint();
  const before = await sticker.boundingBox();
  expect(before).not.toBeNull();

  // 掴んで大きく動かす。紙の外へ出ようとしてもクランプされる。
  await page.mouse.move(before!.x + before!.width / 2, before!.y + before!.height / 2);
  await page.mouse.down();
  await page.mouse.move(before!.x + 400, before!.y - 300, { steps: 12 });
  await page.mouse.up();

  const after = await sticker.boundingBox();
  expect(after).not.toBeNull();
  expect(Math.abs(after!.x - before!.x) + Math.abs(after!.y - before!.y)).toBeGreaterThan(20);

  // 動かした後も紙面は横に伸びない。
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  // ドラッグの終わりのクリックでは遷移しない。
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");

  // ならべ直すと遊び場の初期位置へ戻る（操作でスクロールしても文書座標は同じ）。
  const reset = page.getByRole("button", { name: "ならべ直す" });
  await expect(reset).toBeVisible();
  const resetArea = (await page.locator(".stickers-foot").boundingBox())!;
  const playground = (await page.locator(".hero-playground").boundingBox())!;
  expect(resetArea.y).toBeGreaterThanOrEqual(playground.y + playground.height - 72 - 1);
  expect(resetArea.y + resetArea.height).toBeLessThanOrEqual(playground.y + playground.height + 1);
  expect(resetArea.x).toBeGreaterThanOrEqual(playground.x - 1);
  expect(resetArea.x + resetArea.width).toBeLessThanOrEqual(playground.x + playground.width + 1);
  await reset.click();
  await expect(reset).toBeHidden();
  // 戻りは transition で補間されるので、収束するまで待つ。
  await expect
    .poll(async () => {
      const now = await deskPoint();
      return Math.round(Math.abs(now.x - origin.x) + Math.abs(now.y - origin.y));
    })
    .toBeLessThan(2);
});

test("アプリシールの形が違い、beta / alpha に印がある", async ({ page }) => {
  await page.goto("/");
  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  const caflog = page.locator('.sticker[href="/apps/caflog/"]');
  const devTools = page.locator('.sticker[href="/apps/dev-tools/"]');
  const payCycle = page.locator('.sticker[href="/apps/pay-cycle/"]');

  const radius = async (locator: ReturnType<typeof page.locator>) =>
    locator.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));

  expect(await radius(caflog)).toBeGreaterThan(await radius(sublog) + 10);
  expect(await radius(devTools)).toBeLessThan(await radius(sublog));

  await expect(sublog.locator(".sticker-stamp")).toHaveCount(0);
  await expect(caflog.locator(".sticker-stamp")).toHaveCount(0);
  await expect(devTools.locator(".sticker-stamp")).toHaveAttribute("data-mark", "β");
  await expect(payCycle.locator(".sticker-stamp")).toHaveAttribute("data-mark", "α");
  const betaPaint = await devTools.locator(".sticker-stamp").evaluate((el) => getComputedStyle(el, "::after").content);
  const alphaPaint = await payCycle.locator(".sticker-stamp").evaluate((el) => getComputedStyle(el, "::after").content);
  expect(betaPaint.replaceAll('"', "")).toBe("β");
  expect(alphaPaint.replaceAll('"', "")).toBe("α");
  await expect(page.locator(".sticker-name")).toHaveCount(0);
});

test("初期表示の全シールと操作案内は Hero の遊び場に収まる", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await expectInitialPlayground(page, "1280px");
  await expect(page.locator(".sticker-band")).toHaveCount(0);
  await expect(page.locator(".sticker-name")).toHaveCount(0);
  const stagePosition = await page.locator(".sticker-stage").evaluate((el) => getComputedStyle(el).position);
  expect(stagePosition).not.toBe("fixed");
  await page.locator(".cta-btn").click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#apps");
});

test("320〜1280px と英語でも遊び場の全シールは本文と CTA を覆わない", async ({ page }) => {
  for (const width of [320, 390, 640, 641, 768, 834, 1023, 1024, 1180, 1240, 1279, 1280] as const) {
    await page.setViewportSize({ width, height: width >= 800 ? 900 : 844 });
    await page.goto("/");
    await expectInitialPlayground(page, `${width}px`);
    expect(await centerHits(page, page.locator(".hero-h1"), ".hero-h1"), `${width}px heading center`).toBe(true);
    expect(await centerHits(page, page.locator(".cta-btn"), ".cta-btn"), `${width}px cta center`).toBe(true);
    await page.locator(".cta-btn").click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#apps");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "英語に切り替える" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectInitialPlayground(page, "1280px en");
  expect(await centerHits(page, page.locator(".hero-h1"), ".hero-h1")).toBe(true);
  await page.locator(".cta-btn").click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#apps");
});

test("置いたシールはスクロールしても viewport に張り付かない", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator('.sticker[href="/apps/pay-cycle/"]');
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  const before = (await sticker.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.waitForTimeout(350);
  await page.mouse.down();
  // Hero の遊び場から、ビューポート上端へ引き上げる。
  await page.mouse.move(before.x + 40, 80, { steps: 16 });
  await page.mouse.up();

  const placed = await sticker.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, docTop: box.top + window.scrollY };
  });

  const scrolled = await page.evaluate(() => {
    const root = document.documentElement;
    const beforeY = root.scrollTop;
    root.scrollTo({ top: beforeY + 400, behavior: "instant" });
    return root.scrollTop - beforeY;
  });
  expect(scrolled).toBeGreaterThan(200);

  const after = await sticker.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, docTop: box.top + window.scrollY };
  });
  // 紙に貼ったままスクロールする。fixed なら viewport 上端に張り付き docTop が動く。
  expect(Math.abs(after.docTop - placed.docTop)).toBeLessThan(2);
  expect(placed.top - after.top).toBeGreaterThan(200);
});

test("ドラッグの後でもキーボードから遷移できる", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator(`.sticker[href="/apps/${apps[0]!.slug}/"]`);
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  const box = await sticker.boundingBox();

  // 一度ドラッグする。この click 抑止フラグが戻らないと、以降の Enter が死ぬ。
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + 120, box!.y - 40, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/");

  await sticker.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/apps/${apps[0]!.slug}/$`, "u"));
});

test("ステッカーは動かさずに離すと個別ページへ移る", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator(`.sticker[href="/apps/${apps[0]!.slug}/"]`);
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  await expect(sticker).toHaveAttribute("aria-label", apps[0]!.name);
  await sticker.click();
  await expect(page).toHaveURL(new RegExp(`/apps/${apps[0]!.slug}/$`, "u"));
  await expect(page.getByRole("heading", { level: 1, name: apps[0]!.name, exact: true })).toBeVisible();
});

test("個別ページの標本シールはリンクではなく動かせる", async ({ page }) => {
  await page.goto("/apps/dev-tools/");
  const specimen = page.locator(".app-shell .sticker");
  await expect(specimen).toHaveCount(1);
  await expect(specimen).not.toHaveAttribute("href");
  const specimenBox = (await specimen.boundingBox())!;
  expect(specimenBox.width).toBeGreaterThan(100);
  expect(specimenBox.width).toBeLessThan(140);
  const before = (await specimen.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.waitForTimeout(350);
  await page.mouse.down();
  await page.mouse.move(before.x - 80, before.y + 60, { steps: 10 });
  await page.mouse.up();
  const after = (await specimen.boundingBox())!;
  expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(20);
  await expect.poll(() => new URL(page.url()).pathname).toBe("/apps/dev-tools/");

  await page.goto("/apps/dev-tools/privacy/");
  await expect(page.locator(".app-shell .sticker")).toHaveCount(0);
});

test("一覧行とステッカーが slug で相互にハイライトする", async ({ page }) => {
  await page.goto("/");
  const target = apps[1]!; // CafLog。先頭以外を選び、初期状態が非活性であることも確認する。
  const row = page.locator(`.app-row[href="/apps/${target.slug}/"]`);
  const sticker = page.locator(`.sticker[href="/apps/${target.slug}/"]`);
  await raiseSticker(sticker);

  await expect(row).not.toHaveClass(/\bis-linked\b/u);
  await expect(sticker).not.toHaveClass(/\bis-linked\b/u);

  // 行にホバー → 対応するステッカーだけが反応する。
  await row.hover();
  await expect(sticker).toHaveClass(/\bis-linked\b/u);
  const other = page.locator(`.sticker[href="/apps/${apps[0]!.slug}/"]`);
  await expect(other).not.toHaveClass(/\bis-linked\b/u);

  // locator.hover は途中の要素に遮られると失敗しうるため、低レベルの mouse.move で単に離す。
  await page.mouse.move(0, 0);
  await expect(sticker).not.toHaveClass(/\bis-linked\b/u);

  // 逆方向：ステッカーにホバー → 対応する行が反応する。
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  await sticker.hover();
  await expect(row).toHaveClass(/\bis-linked\b/u);

  // フォーカスでも同様に動く（キーボード利用者向け）。
  // locator.hover は途中の要素に遮られると失敗しうるため、低レベルの mouse.move で単に離す。
  await page.mouse.move(0, 0);
  await expect(row).not.toHaveClass(/\bis-linked\b/u);
  await row.focus();
  await expect(sticker).toHaveClass(/\bis-linked\b/u);

  // ホバーとフォーカスは別系統。行にキーボードフォーカスが残ったまま
  // 別のステッカー（装飾・slug 無し）へマウスを乗せて離れても、
  // フォーカス由来のハイライトは消えない。
  const decorative = page.locator('.sticker[aria-hidden="true"]').first();
  await raiseSticker(decorative);
  await decorative.hover();
  await expect(sticker).toHaveClass(/\bis-linked\b/u);
  await page.mouse.move(0, 0);
  await expect(sticker).toHaveClass(/\bis-linked\b/u);
});

test("ステッカーは掴んだ位置に応じて傾き、掴んでいる間だけ元の位置に跡が残る", async ({ page }) => {
  await page.goto("/");
  const sticker = page.locator('.sticker[href="/apps/sublog/"]');
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  const slot = page.locator(".sticker-slot").filter({ has: sticker });

  // 1 回目のドラッグでステッカー自身が動くため、掴む中心座標は毎回その時点の
  // boundingBox から取り直す。使い回すと、動いた後のステッカーから外れて掴めない。
  async function spinFromEdge(edge: "top" | "bottom"): Promise<{ spin: number; renderedDeg: number }> {
    const box = (await sticker.boundingBox())!;
    const cx = box.x + box.width / 2;
    const grabY = edge === "top" ? box.y + 8 : box.y + box.height - 8;
    await page.mouse.move(cx, grabY);
    // マウスを乗せた時点で一覧行との相互ハイライト (is-linked) が発火し、
    // 0.3s の transform transition で位置が数 px 動く。収まる前に押すと
    // 掴んだ位置の計算がずれるため、実際のユーザー操作と同じく間を置く。
    await page.waitForTimeout(350);
    await page.mouse.down();
    await page.mouse.move(cx + 80, grabY, { steps: 8 });
    // ドラッグ中だけ跡（ghost）が現れる。
    await expect(slot.locator(".sticker-ghost")).toHaveCount(1);
    const [spin, transform] = await sticker.evaluate((el) => {
      const cs = getComputedStyle(el);
      return [parseFloat(cs.getPropertyValue("--spin")), cs.transform];
    });
    await page.mouse.up();
    await expect(slot.locator(".sticker-ghost")).toHaveCount(0);
    return { spin, renderedDeg: rotationDegrees(transform) };
  }

  const top = await spinFromEdge("top");
  await sticker.scrollIntoViewIfNeeded(); // 前のドラッグで動いている場合に備える
  const bottom = await spinFromEdge("bottom");

  // てこの原理：上端と下端を掴んで同じ向きに引くと、回転が逆向きになる。
  expect(top.spin).toBeGreaterThan(0);
  expect(bottom.spin).toBeLessThan(0);

  // --spin という「値」だけでなく、実際に描かれた transform（CSS cascade の
  // 勝者）でも確認する。ドラッグ中は is-held と is-linked が同時に true になり
  // うる。is-linked が詳細度で勝って --spin を無視する rotate(tilt) 固定へ
  // 落ちる回帰が実際に一度発生しており、その場合 top/bottom の見た目の角度は
  // ほぼ同じ（tilt のまま）になるため、はっきり差が付くことを確認する。
  expect(top.renderedDeg - bottom.renderedDeg).toBeGreaterThan(4);

  // 離した後は 0 へ戻る。
  await expect
    .poll(() => sticker.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--spin"))))
    .toBe(0);
});

test("ホバーと掴みで鉛筆メモが出て、飾りには出ない", async ({ page }) => {
  await page.goto("/");
  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  const caption = sublog.locator(".sticker-caption");
  await expect(caption).toHaveCount(1);
  await expect(caption).toHaveText("月の固定費、見えてる？");
  await expect(caption).not.toBeVisible();

  await raiseSticker(sublog);
  await sublog.hover();
  await expect(caption).toBeVisible();
  const captionBox = (await caption.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(captionBox.x).toBeGreaterThanOrEqual(0);
  expect(captionBox.x + captionBox.width).toBeLessThanOrEqual(viewport.width + 1);
  await page.mouse.move(0, 0);
  await expect(caption).not.toBeVisible();

  const box = (await sublog.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(350);
  await page.mouse.down();
  await expect(caption).toBeVisible();
  await page.mouse.up();
  await expect(caption).not.toBeVisible();

  const decorative = page.locator('.sticker[aria-hidden="true"]').first();
  await expect(decorative.locator(".sticker-caption")).toHaveCount(0);
});

test("390px で右端の鉛筆メモが画面内に収まる", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  const caption = sublog.locator(".sticker-caption");
  await raiseSticker(sublog);
  await sublog.hover();
  await expect(caption).toBeVisible();
  const captionBox = (await caption.boundingBox())!;
  expect(captionBox.x).toBeGreaterThanOrEqual(0);
  expect(captionBox.x + captionBox.width).toBeLessThanOrEqual(391);
});

test("reduced-motion では掴み中に拡大しない", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".poster")).toHaveAttribute("data-desk", "ready");
  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  await raiseSticker(sublog);
  // data-desk は最初の計測完了。mobile の初期レイアウトが収束する前の座標を
  // 固定せず、Playwright の安定・表示・ヒット判定を経てシールへポインタを乗せる。
  await sublog.hover();
  await page.mouse.down();
  await expect(sublog).toHaveClass(/\bis-held\b/u);
  const scale = await sublog.evaluate((el) => {
    const m = getComputedStyle(el).transform;
    const match = m.match(/matrix\(([^)]+)\)/u);
    if (!match?.[1]) return 1;
    const a = Number(match[1].split(",")[0]);
    return Math.abs(a);
  });
  expect(scale).toBeLessThan(1.02);
  await page.mouse.up();
});

test("画面リサイズがドラッグ中に起きても、掴んだままの見た目で固着しない", async ({ page }) => {
  await page.goto("/");
  const sticker = page.locator('.sticker[href="/apps/sublog/"]');
  const slot = page.locator(".sticker-slot").filter({ has: sticker });
  await raiseSticker(sticker);
  await sticker.scrollIntoViewIfNeeded();
  const box = (await sticker.boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y - 40, { steps: 6 });
  await expect(sticker).toHaveClass(/\bis-held\b/u);
  await expect(slot.locator(".sticker-ghost")).toHaveCount(1);

  // 掴んだ時点の紙の矩形は、この時点で無効になる。
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: Math.max(360, viewport.width - 200), height: viewport.height });

  // 古い矩形のまま move/up が来ても破綻しない。掴んだ表示は解ける。
  await page.mouse.move(box.x + 90, box.y - 20, { steps: 4 });
  await page.mouse.up();

  await expect(page).toHaveURL("/");
  await expect(sticker).not.toHaveClass(/\bis-held\b/u);
  await expect(slot.locator(".sticker-ghost")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  await page.setViewportSize(viewport);
  await sticker.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/apps\/sublog\/$/u);
});

test("フッターの奥付は既定で閉じており、開くと本文とリンクが読める", async ({ page }) => {
  await page.goto("/");
  const colophon = page.locator(".colophon");
  const body = colophon.locator(".colophon-body");

  await expect(colophon).not.toHaveJSProperty("open", true);
  await expect(body).toBeHidden();

  await colophon.locator("summary").click();
  await expect(colophon).toHaveJSProperty("open", true);
  await expect(body).toBeVisible();

  const sourceLink = colophon.getByRole("link");
  await expect(sourceLink).toHaveAttribute("href", "https://github.com/yuto1201/Web-AppLibrary");
  await expect(sourceLink).toHaveAttribute("target", "_blank");

  // 既存のフッター（著作権表示・法務リンク）は壊れていない。
  await expect(page.getByRole("link", { name: "プライバシー", exact: true })).toBeVisible();
});

test("ホームの light / dark 双方が専用の実配色でコントラストを満たす", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", HOME.light.paper);
  await expect(page.locator("body")).toHaveCSS("color", HOME.light.ink);
  await expectColorContrast(page);

  await page.getByRole("button", { name: "ダークモードに切り替える" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", HOME.dark.paper);
  await expect(page.locator("body")).toHaveCSS("color", HOME.dark.ink);
  await expectColorContrast(page);
});

test("テーマと言語の設定が再読み込み後も維持される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "メインナビゲーション" })).toBeVisible();
  await page.getByRole("button", { name: "ダークモードに切り替える" }).click();
  await page.getByRole("button", { name: "英語に切り替える" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Switch to Japanese" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();

  // UI ラベルだけを訳す。アプリ本文と紹介文は日本語のまま出す。
  await expect(page.locator(".hero-bio")).toHaveAttribute("lang", "ja");
  await expect(page.locator(".app-row-tagline").first()).toHaveAttribute("lang", "ja");
  const postLangs = await page.locator(".post").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("lang")));
  expect(postLangs.length).toBeGreaterThan(0);
  expect(postLangs.every((lang) => lang === "ja")).toBe(true);
  await expect(page.getByRole("button", { name: "Tidy up" })).toBeHidden();

  for (const [route, selector] of [
    ["/apps/sublog/", ".sublog-site"],
    ["/apps/sublog/privacy/", ".app-shell"],
    ["/privacy/", ".legal-page"],
    ["/terms/", ".legal-page"],
  ] as const) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(selector)).toHaveAttribute("lang", "ja");
    if (route === "/apps/sublog/") {
      await expect(page.locator(".sublog-headline")).toHaveText("サブスクを、すっきりひとまとめ。");
    }
  }
});

test("OGP metadata とサイト共通の法務ページ", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://app.yutodev.com/ogp.png");
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", "https://app.yutodev.com/ogp.png");

  await expect(page.getByRole("link", { name: "プライバシー", exact: true })).toHaveAttribute("href", "/privacy/");
  const privacyResponse = await request.get("/privacy/");
  expect(privacyResponse.ok()).toBe(true);
  const privacyHtml = await privacyResponse.text();
  expect(privacyHtml).toContain('<meta property="og:url" content="https://app.yutodev.com/privacy/"/>');
  expect(privacyHtml).toContain('<meta property="og:title" content="プライバシーポリシー — AppLibrary"/>');
  expect(privacyHtml).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');

  await page.goto("/privacy/");
  await expect(page).toHaveURL(/\/privacy\/$/u);
  await expect(page.getByRole("heading", { level: 1, name: "プライバシーポリシー" })).toBeVisible();
  await expect(page.locator(".legal-language [lang='en']")).toHaveText("This page is available in Japanese only.");
  await expect(page.locator(".legal-card")).toContainText("テーマと言語");
  await expect(page.locator(".legal-card")).not.toContainText("検索入力");
  await expect(page.locator(".legal-card")).not.toContainText("表示密度");
  await expect(page.locator(".legal-meta")).toContainText("制定日: 2026年9月1日 · 最終更新: 2026年9月27日");
  await expect(page.getByRole("link", { name: "Cloudflare のプライバシーポリシー" })).toHaveAttribute("href", "https://www.cloudflare.com/policies/privacy/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://app.yutodev.com/privacy/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "プライバシーポリシー — AppLibrary");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "プライバシーポリシー — AppLibrary");
  await expectColorContrast(page);

  await setStoredState(page, { theme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expectColorContrast(page);

  await expect(page.getByRole("link", { name: "利用規約", exact: true })).toHaveAttribute("href", "/terms/");
  const termsResponse = await request.get("/terms/");
  expect(termsResponse.ok()).toBe(true);
  const termsHtml = await termsResponse.text();
  expect(termsHtml).toContain('<meta property="og:url" content="https://app.yutodev.com/terms/"/>');
  expect(termsHtml).toContain('<meta property="og:title" content="利用規約 — AppLibrary"/>');
  expect(termsHtml).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');

  await page.goto("/terms/");
  await expect(page).toHaveURL(/\/terms\/$/u);
  await expect(page.getByRole("heading", { level: 1, name: "利用規約" })).toBeVisible();
  await expect(page.locator(".legal-language [lang='en']")).toHaveText("This page is available in Japanese only.");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://app.yutodev.com/terms/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "利用規約 — AppLibrary");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "利用規約 — AppLibrary");
  await expectColorContrast(page);

  await setStoredState(page, { theme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expectColorContrast(page);
});

test("robots と sitemap が全静的ルートを公開する", async ({ request }) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain("Sitemap: https://app.yutodev.com/sitemap.xml");

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  const actual = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1]).sort();
  const expected = (await exportedIndexRoutes())
    .map((route) => new URL(route, "https://app.yutodev.com/").href)
    .sort();
  expect(actual).toEqual(expected);
});

test("通常モーションでは初回だけ Hero を再生し、履歴を消すと再生する", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hero-opening", "play");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hero-opening", "off");
  await page.evaluate(() => sessionStorage.removeItem("applibrary_hero_seen"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hero-opening", "play");
});

test("reduced-motion では初回でも Hero を再生しない", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hero-opening", "off");
});

test("ホームのシールは呼吸し、個別の標本は静止する", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
  const home = page.locator(".poster .sticker-slot").first();
  await expect.poll(() => home.evaluate((el) => getComputedStyle(el).animationName)).toContain("vinyl-breathe");
  await expect.poll(() => home.evaluate((el) => getComputedStyle(el).animationName)).toContain("sticker-settle");
  const amp = await home.evaluate((el) => getComputedStyle(el).getPropertyValue("--breathe-amp-y").trim());
  expect(Number.parseFloat(amp)).toBeGreaterThan(0);
  expect(Number.parseFloat(amp)).toBeLessThanOrEqual(1.5);

  for (const key of ["sublog", "caflog", "note-Tokyo"] as const) {
    const slot = page.locator(`.poster .sticker-slot[data-key="${key}"]`);
    expect(await slot.evaluate((el) => getComputedStyle(el).getPropertyValue("--breathe-amp-r").trim())).toBe("0deg");
    expect(Number.parseFloat(await slot.evaluate((el) => getComputedStyle(el).getPropertyValue("--breathe-amp-y")))).toBeLessThanOrEqual(1);
  }
  const allSlots = page.locator(".poster .sticker-slot");
  const count = await allSlots.count();
  for (let index = 0; index < count; index += 1) {
    const slot = allSlots.nth(index);
    expect(Number.parseFloat(await slot.evaluate((el) => getComputedStyle(el).getPropertyValue("--breathe-amp-y")))).toBeLessThanOrEqual(1.5);
    expect(Number.parseFloat(await slot.evaluate((el) => getComputedStyle(el).getPropertyValue("--breathe-amp-r")))).toBeLessThanOrEqual(0.35);
  }

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hero-opening", "off");
  await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
  const again = page.locator(".poster .sticker-slot").first();
  await expect.poll(() => again.evaluate((el) => getComputedStyle(el).animationName)).toBe("vinyl-breathe");
  const moved = await again.evaluate((el) => {
    const anim = el.getAnimations().find((item) => item instanceof CSSAnimation && item.animationName === "vinyl-breathe");
    if (!(anim instanceof CSSAnimation) || !(anim.effect instanceof KeyframeEffect)) return 0;
    const duration = anim.effect.getComputedTiming().duration;
    const length = typeof duration === "number" ? duration : 11_000;
    anim.pause();
    anim.currentTime = 0;
    const start = Number.parseFloat(getComputedStyle(el).getPropertyValue("--breathe-y"));
    anim.currentTime = length / 2;
    const mid = Number.parseFloat(getComputedStyle(el).getPropertyValue("--breathe-y"));
    return Math.abs(mid - start);
  });
  expect(moved).toBeGreaterThanOrEqual(0.5);

  await page.goto("/apps/dev-tools/");
  const specimen = page.locator(".specimen-slot .sticker-slot");
  await expect(specimen).toHaveCount(1);
  expect(await specimen.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/^(?:none)?$/u);
});

test("reduced-motion ではシールも呼吸しない", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
  const slot = page.locator(".poster .sticker-slot").first();
  expect(await slot.evaluate((el) => getComputedStyle(el).animationName)).toMatch(/^(?:none)?$/u);
  const transform = await slot.evaluate((el) => getComputedStyle(el).transform);
  expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);
});

for (const app of apps.filter(({ slug }) => slug !== "simple-pomo")) {
  test(`${app.slug}: 詳細とプライバシーの直接ロード、往復、画像、runtime エラー`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const detailResponse = await request.get(`/apps/${app.slug}/`);
    expect(detailResponse.ok()).toBe(true);
    const detailHtml = await detailResponse.text();
    expect(detailHtml).toContain(`<meta property="og:url" content="https://app.yutodev.com/apps/${app.slug}/"/>`);
    expect(detailHtml).toContain(`<meta property="og:title" content="${app.name} — AppLibrary"/>`);
    expect(detailHtml).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');
    const privacyResponse = await request.get(`/apps/${app.slug}/privacy/`);
    expect(privacyResponse.ok()).toBe(true);
    const privacyHtml = await privacyResponse.text();
    expect(privacyHtml).toContain(
      `<meta property="og:url" content="https://app.yutodev.com/apps/${app.slug}/privacy/"/>`,
    );
    expect(privacyHtml).toContain(`<meta property="og:title" content="プライバシーポリシー — ${app.name}"/>`);
    expect(privacyHtml).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');
    if (app.slug === "pay-cycle") {
      const termsResponse = await request.get("/apps/pay-cycle/terms/");
      expect(termsResponse.ok()).toBe(true);
      const termsHtml = await termsResponse.text();
      expect(termsHtml).toContain(
        '<meta property="og:url" content="https://app.yutodev.com/apps/pay-cycle/terms/"/>',
      );
      expect(termsHtml).toContain('<meta property="og:title" content="利用規約 — PayCycle"/>');
      expect(termsHtml).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');
    }
    // request.get は HTML / OGP だけ。紙面 CSS は各法務 URL を直接開いて確認する。
    await page.goto(`/apps/${app.slug}/privacy/`);
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/privacy/$`, "u"));
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell .sticker")).toHaveCount(0);
    if (app.slug === "pay-cycle") {
      await expectLegalHeadingHierarchy(page);
      await page.goto("/apps/pay-cycle/terms/");
      await expect(page).toHaveURL(/\/apps\/pay-cycle\/terms\/$/u);
      await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
      await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.light);
      await expectLegalHeadingHierarchy(page);
    }
    await page.goto(`/apps/${app.slug}/`);
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/$`, "u"));
    await expect(page.getByRole("heading", { name: app.name, exact: true, level: 1 })).toBeVisible();
    const tone = appPageTone(app.slug);
    if (!tone) throw new Error(`${app.slug} の色味が無い`);
    if (app.slug === "caflog") {
      // Issue #69: 実アイコンとアプリ画面に合わせた明るい専用ページ。
      await expect(page.locator(".caflog-site")).toHaveAttribute("lang", "ja");
      await expect(page.locator(".app-shell")).toHaveCount(0);
      await expect(page.locator("body")).toHaveCSS("background-color", CAFLOG.canvas);
      await expect(page.locator(".caflog-hero")).toBeVisible();
      await expect(page.locator(".caflog-headline")).toHaveText(/一杯ずつ、\s*自分のペースへ。/u);
      await expect(page.locator(".caflog-headline")).toHaveCSS("color", CAFLOG.ink);
      const heroImage = page.locator(".caflog-hero-image");
      await expect(heroImage).toBeVisible();
      await expect.poll(() => heroImage.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const storeLinks = page.locator('a[href*="apps.apple.com"]');
      expect(await storeLinks.count()).toBeGreaterThan(0);
      for (const link of await storeLinks.all()) {
        await expect(link).toHaveAttribute("href", app.appStoreUrl!);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/u);
      }
      const proFeature = page.locator("#features .feature-row").filter({ has: page.locator(".caflog-pro") });
      await expect(proFeature.getByRole("heading")).toHaveText("Pro 連携機能");
      for (const [target, title] of [
        ["caflog-feature-log", "10 秒で記録"],
        ["caflog-feature-flow", "体内残量をリアルタイム計算"],
        ["caflog-feature-sleep", "睡眠への影響を確認"],
      ]) {
        await expect(page.locator(`.caflog-moment[href="#${target}"]`)).toHaveCount(1);
        await expect(page.locator(`#${target}`).getByRole("heading")).toHaveText(title!);
      }
      const download = page.locator(".caflog-button").first();
      await expect(download).toHaveCSS("background-color", CAFLOG.ink);
      await expect(download).toHaveCSS("color", CAFLOG.white);
    } else if (app.slug === "sublog") {
      await expect(page.locator(".sublog-site")).toHaveAttribute("lang", "ja");
      await expect(page.locator(".app-shell")).toHaveCount(0);
      await expect(page.locator("body")).toHaveCSS("background-color", SUBLOG.paper);
      await expect(page.locator(".sublog-headline")).toHaveText("サブスクを、すっきりひとまとめ。");
      const icon = page.locator(`.sublog-site img[src="/apps/${app.slug}/${app.icon}"]`).first();
      await expect(icon).toBeVisible();
      await expect.poll(() => icon.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const storeLinks = page.locator('a[href*="apps.apple.com"]');
      expect(await storeLinks.count()).toBeGreaterThan(0);
      for (const link of await storeLinks.all()) {
        await expect(link).toHaveAttribute("href", app.appStoreUrl!);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/u);
      }
    } else if (app.slug === "pay-cycle") {
      await expect(page.locator(".paycycle-site")).toHaveAttribute("lang", "ja");
      await expect(page.locator(".app-shell")).toHaveCount(0);
      await expect(page.locator("body")).toHaveCSS("background-color", PAYCYCLE.paper);
      await expect(page.locator(".paycycle-headline")).toHaveText(/お金の流れに、\s*見通しを。/u);
      const heroImage = page.locator('.paycycle-hero-icon img[src="/apps/pay-cycle/icon.png"]');
      await expect(heroImage).toBeVisible();
      await expect.poll(() => heroImage.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      const icon = page.locator('.paycycle-site img[src="/apps/pay-cycle/icon.png"]').first();
      await expect(icon).toBeVisible();
      await expect.poll(() => icon.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    } else {
      await expect(page.locator(".app-shell")).toHaveAttribute("data-tone", tone.tone);
      await expect(page.locator("body")).toHaveCSS("background-color", cssRgb(tone.wash));
      await expect(page.locator(".app-shell")).toHaveCSS("background-color", cssRgb(tone.wash));
      await expect(page.locator(".hero-title")).toHaveCSS("font-weight", "400");
      await expect(page.locator(".hero-title")).toHaveCSS("font-family", /Newsreader/i);
      await expect(page.locator(".hero-title")).toHaveCSS("color", INK.light);
      await expect(page.locator(".hero-tagline")).toHaveCSS("color", INK_2.light);
      await expect(page.locator(".section-title").first()).toHaveCSS("font-family", /Newsreader/i);
      await expect(page.locator(".hero-icon")).toHaveCount(0);
      await expect(page.locator(".feature-icon")).toHaveCount(0);
      await expect(page.locator(".feature-row").first()).toHaveCSS("box-shadow", "none");
      await expect(page.locator(".feature-row").first()).toHaveCSS("border-bottom-width", "1px");
    }
    if (app.slug === "dev-tools") {
      await expect(page.locator(".feature-list")).toHaveCSS("display", "grid");
    }
    if (app.status === "release") {
      await expect(page.locator(".hero-status")).toHaveCount(0);
    } else if (app.slug === "pay-cycle") {
      await expect(page.locator(".paycycle-release").first()).toHaveText("リリース準備中");
    } else {
      await expect(page.locator(".hero-status")).toHaveText(statusLabel(app.status, i18n.ja));
    }
    const primary = page.locator(".btn-primary").first();
    if (await primary.count()) {
      await expect(primary).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(primary).toHaveCSS("color", cssRgb(tone.ink));
    }
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth))
      .toBe(true);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://app.yutodev.com/apps/${app.slug}/`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", `${app.name} — AppLibrary`);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", `${app.name} — AppLibrary`);
    if (app.siteUrl) {
      const siteLink = page.getByRole("link", {
        name: app.platforms.includes("Web") ? "Web アプリを開く" : "公式サイト",
        exact: true,
      });
      await expect(siteLink).toHaveAttribute("href", app.siteUrl);
      await expect(siteLink).toHaveAttribute("target", "_blank");
    }
    await expectColorContrast(page);
    const features = page.locator("#features .feature-row");
    await expect(features).toHaveCount(app.features.length);
    await expect(features.first()).toContainText(app.features[0]!.description);
    await expect(page.locator("#features")).not.toContainText(app.features[0]!.icon);
    await expect(page.getByRole("heading", { name: "Screenshots", exact: true })).toBeVisible();
    const featured = page.locator("#screenshots .shot-featured img");
    await expect(featured).toHaveCount(1);
    await featured.scrollIntoViewIfNeeded();
    await expect(featured).toBeVisible();
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
      const afterArrow = app.screenshots[2] ?? app.screenshots[0];
      await expect(featured).toHaveAttribute("src", `/apps/${app.slug}/screenshots/${afterArrow}`);
    }
    if (app.slug === "pay-cycle") {
      await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
      const related = page.getByRole("navigation", { name: "PayCycle 関連リンク", exact: true });
      await expect(related.getByRole("link", { name: "サポート", exact: true }))
        .toHaveAttribute("href", "https://app.yutodev.com/#contact");
      await expect(related.getByRole("link", { name: "利用規約", exact: true }))
        .toHaveAttribute("href", "/apps/pay-cycle/terms/");
    }
    const detailPrivacy = app.slug === "pay-cycle"
      ? page.getByRole("navigation", { name: "PayCycle 関連リンク", exact: true }).getByRole("link", { name: "プライバシーポリシー", exact: true })
      : page.getByRole("link", { name: "プライバシーポリシー", exact: true });
    await detailPrivacy.click();
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/privacy/$`, "u"));
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-tone");
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.light);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("プライバシー");
    if (app.slug === "pay-cycle") {
      await expect(page.locator(".legal-language [lang='en']")).toHaveText("This page is available in Japanese and English.");
      await expect(page.locator("section[lang='ja']")).toBeVisible();
      const englishPolicy = page.locator("section[lang='en']");
      await expect(englishPolicy).toBeVisible();
      await expect(englishPolicy).toContainText("Google AdMob");
      await expect(englishPolicy).toContainText("StoreKit");
      await expect(englishPolicy.getByRole("link", { name: "developer's contact links", exact: true }))
        .toHaveAttribute("href", "https://app.yutodev.com/#contact");
      await page.getByRole("link", { name: "利用規約", exact: true }).click();
      await expect(page).toHaveURL(/\/apps\/pay-cycle\/terms\/$/u);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("PayCycle 利用規約");
      await expect(page.locator("section[lang='ja']")).toContainText("東京地方裁判所");
      await expect(page.locator("section[lang='en']")).toContainText("Apple Standard EULA");
      await expect(page.getByRole("link", { name: "Apple Standard EULA", exact: true }))
        .toHaveAttribute("href", "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/");
      await expect(page.getByRole("link", { name: "サポート", exact: true }))
        .toHaveAttribute("href", "https://app.yutodev.com/#contact");
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        "https://app.yutodev.com/apps/pay-cycle/terms/",
      );
      await expect
        .poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth))
        .toBe(true);
      await expectColorContrast(page);
      await page.getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
      await expect(page).toHaveURL(/\/apps\/pay-cycle\/privacy\/$/u);
      await expectLegalHeadingHierarchy(page);
    } else {
      await expect(page.locator(".legal-language [lang='en']")).toHaveText("This page is available in Japanese only.");
    }
    const expectedContact = privacyContacts[app.slug]!;
    const contact = page.getByRole("link", { name: expectedContact.label, exact: true });
    await expect(contact).toBeVisible();
    await expect(contact).toHaveAttribute("href", expectedContact.url);
    await expect(page.locator("footer.page-footer")).toBeVisible();
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `https://app.yutodev.com/apps/${app.slug}/privacy/`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `プライバシーポリシー — ${app.name}`,
    );
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      `プライバシーポリシー — ${app.name}`,
    );
    await expect
      .poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth))
      .toBe(true);
    await expectColorContrast(page);
    await page.getByRole("link", { name: `← ${app.name}`, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/$`, "u"));
    const backToHome = app.slug === "pay-cycle"
      ? page.getByRole("navigation", { name: "PayCycle 関連リンク", exact: true }).getByRole("link", { name: "AppLibrary", exact: true })
      : page.getByRole("link", { name: "← AppLibrary", exact: true });
    await backToHome.click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(page.locator(".app-shell")).toHaveCount(0);
    // トップへ戻るとホーム専用の配色へ戻り、アプリや法務の色が残らない。
    await expect(page.locator("body")).toHaveCSS("background-color", HOME.light.paper);
    await expect(page.locator("body")).toHaveCSS("color", HOME.light.ink);
    await expect(page.locator(".app-row")).toHaveCount(apps.length);
    await page.getByRole("link", { name: "プライバシー", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "プライバシーポリシー" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("CafLog の案内リンクと実画面ギャラリーをキーボードで操作できる", async ({ page }) => {
  const app = apps.find(({ slug }) => slug === "caflog")!;
  await page.goto("/apps/caflog/");
  for (const section of ["features", "screenshots"] as const) {
    const link = page.locator(`.caflog-site a[href="#${section}"]`).first();
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/apps/caflog/#${section}$`, "u"));
    await expect(page.locator(`#${section}`)).toBeInViewport();
  }

  const gallery = page.getByRole("group", { name: "Screenshots", exact: true });
  const featured = gallery.locator(".shot-featured img");
  await gallery.getByRole("button", { name: "Next", exact: true }).click();
  await expect(featured).toHaveAttribute("src", `/apps/caflog/screenshots/${app.screenshots[1]}`);
  await gallery.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(featured).toHaveAttribute("src", `/apps/caflog/screenshots/${app.screenshots[0]}`);
  await gallery.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(featured).toHaveAttribute("src", `/apps/caflog/screenshots/${app.screenshots.at(-1)}`);
  await expect(gallery.locator(".shot-count")).toHaveText(`${app.screenshots.length} / ${app.screenshots.length}`);
  await expect(gallery.locator(".shot-thumb").last()).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
});

test("CafLog は320〜1280pxで実画面とアイコンを表示し、配布先とギャラリーを操作できる", async ({ page }) => {
  for (const width of [320, 393, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/apps/caflog/");
    const heroImage = page.locator(".caflog-hero-image");
    await expect(heroImage).toHaveAttribute("src", "/apps/caflog/screenshots/4.png");
    await expect(heroImage).toBeVisible();
    const icon = page.locator(".caflog-icon-card img");
    await expect(icon).toHaveAttribute("src", "/apps/caflog/icon.png");
    await expect(icon).toBeVisible();
    for (const image of [heroImage, icon]) {
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await icon.scrollIntoViewIfNeeded();
    await expect.poll(() => icon.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === element;
    })).toBe(true);

    const controls = [
      page.locator(".caflog-hero-actions").getByRole("link", { name: "App Store で入手", exact: true }),
      page.locator(".caflog-hero-actions").getByRole("link", { name: "画面を見てみる", exact: true }),
      page.getByRole("group", { name: "Screenshots", exact: true }).getByRole("button", { name: "Previous", exact: true }),
      page.getByRole("group", { name: "Screenshots", exact: true }).getByRole("button", { name: "Next", exact: true }),
    ];
    for (const control of controls) {
      await control.click({ trial: true });
      const box = (await control.boundingBox())!;
      expect(box.width, `${width}px control width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${width}px control height`).toBeGreaterThanOrEqual(44);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("CafLog は保存した dark でもアプリに合わせた明るい配色を保ち、法務へ戻ると保存テーマに従う", async ({ page }) => {
  await page.goto("/apps/caflog/");
  await setStoredState(page, { theme: "dark", lang: "en" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".caflog-site")).toHaveAttribute("lang", "ja");
  await expect(page.locator("body")).toHaveCSS("background-color", CAFLOG.canvas);
  await expect(page.locator(".caflog-headline")).toBeVisible();
  await expect(page.locator(".caflog-button").first()).toHaveCSS("background-color", CAFLOG.ink);
  await expect(page.locator(".caflog-button").first()).toHaveCSS("color", CAFLOG.white);
  await expectColorContrast(page);
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);

  await page.getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
  await expect(page).toHaveURL(/\/apps\/caflog\/privacy\/$/u);
  await expect(page.locator(".caflog-site")).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.dark);
  await expectColorContrast(page);
  await page.getByRole("link", { name: "← CafLog", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", CAFLOG.canvas);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("保存した dark でも共通個別ページの見出しが電圧ブルーに飲み込まれない", async ({ page }) => {
  await page.goto("/apps/dev-tools/");
  await setStoredState(page, { theme: "dark" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell .section-title").first()).toHaveCSS("color", INK.dark);
  await expect(page.locator(".app-shell .hero-title")).toHaveCSS("color", INK.dark);
  await expectColorContrast(page);
});

test("SubLog の支払い表示例はキーボードで月額・年額を切り替えられ、各幅で実画面を確認できる", async ({ page }) => {
  await page.goto("/apps/sublog/");
  const overview = page.locator(".sublog-overview");
  await expect(overview).toHaveAttribute("aria-label", "支払いの表示例");
  await expect(overview).toContainText("表示例");
  const monthly = overview.getByRole("button", { name: "月額", exact: true });
  const yearly = overview.getByRole("button", { name: "年額", exact: true });
  await expect(monthly).toHaveAttribute("aria-pressed", "true");
  await expect(yearly).toHaveAttribute("aria-pressed", "false");
  await expect(overview).toContainText(/[￥¥]3,670/u);
  await yearly.focus();
  await page.keyboard.press("Enter");
  await expect(yearly).toHaveAttribute("aria-pressed", "true");
  await expect(monthly).toHaveAttribute("aria-pressed", "false");
  await expect(overview).toContainText(/[￥¥]44,040/u);
  await monthly.focus();
  await page.keyboard.press("Space");
  await expect(monthly).toHaveAttribute("aria-pressed", "true");
  await expect(overview).toContainText(/[￥¥]3,670/u);

  const screenshot = page.locator("#screenshots .shot-featured img");
  for (const width of [320, 393, 768, 1280]) {
    await page.setViewportSize({ width, height: width >= 768 ? 900 : 852 });
    await expect(page.locator(".sublog-headline")).toBeVisible();
    await yearly.click({ trial: true });
    await expect(screenshot).toBeVisible();
    await expect.poll(() => screenshot.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("SubLog は保存した dark でも専用配色を保ち、法務へ戻ると保存テーマに従う", async ({ page }) => {
  await page.goto("/apps/sublog/");
  await setStoredState(page, { theme: "dark", lang: "en" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".sublog-site")).toHaveAttribute("lang", "ja");
  await expect(page.locator("body")).toHaveCSS("background-color", SUBLOG.paper);
  await expectColorContrast(page);

  await page.getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
  await expect(page).toHaveURL(/\/apps\/sublog\/privacy\/$/u);
  await expect(page.locator(".sublog-site")).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.dark);
  await expectColorContrast(page);
  await page.getByRole("link", { name: "← SubLog", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", SUBLOG.paper);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("PayCycle の案内・実画面・質問をキーボードで操作でき、狭い幅でも操作を覆わない", async ({ page }) => {
  const app = apps.find(({ slug }) => slug === "pay-cycle")!;
  await page.goto("/apps/pay-cycle/");
  for (const section of ["features", "screenshots"] as const) {
    const link = page.locator(`.paycycle-actions a[href="#${section}"]`);
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/apps/pay-cycle/#${section}$`, "u"));
    await expect(page.locator(`#${section}`)).toBeInViewport();
  }

  const gallery = page.getByRole("group", { name: "Screenshots", exact: true });
  const featured = gallery.locator(".shot-featured img");
  await expect(gallery.locator(".shot-thumb")).toHaveCount(5);
  await gallery.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(featured).toHaveAttribute("src", `/apps/pay-cycle/screenshots/${app.screenshots.at(-1)}`);
  await expect(gallery.locator(".shot-count")).toHaveText("5 / 5");
  await expect(gallery.locator(".shot-thumb").last()).toHaveAttribute("aria-pressed", "true");
  await gallery.getByRole("button", { name: "Next", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(featured).toHaveAttribute("src", "/apps/pay-cycle/screenshots/1.png");

  const question = page.locator("#questions details").first();
  await question.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("open", "");
  await expect(question.locator("p")).toBeVisible();

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const heroImage = page.locator(".paycycle-hero-image");
    await expect(heroImage).toBeVisible();
    await expect.poll(() => heroImage.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    for (const control of [
      page.locator('.paycycle-actions a[href="#screenshots"]'),
      gallery.getByRole("button", { name: "Next", exact: true }),
    ]) {
      await control.click({ trial: true });
      const box = (await control.boundingBox())!;
      expect(box.width, `${width}px control width`).toBeGreaterThanOrEqual(44);
      expect(box.height, `${width}px control height`).toBeGreaterThanOrEqual(44);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("PayCycle は保存した dark と en を維持し、privacy と terms との往復で配色を切り替える", async ({ page }) => {
  await page.goto("/apps/pay-cycle/");
  await setStoredState(page, { theme: "dark", lang: "en" });
  await page.reload();
  await expect(page.locator(".paycycle-site")).toHaveAttribute("lang", "ja");
  await expect(page.locator("body")).toHaveCSS("background-color", PAYCYCLE.paper);
  await expectColorContrast(page);

  for (const [label, route] of [["プライバシーポリシー", "privacy"], ["利用規約", "terms"]] as const) {
    await page.getByRole("navigation", { name: "PayCycle 関連リンク", exact: true }).getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/apps/pay-cycle/${route}/$`, "u"));
    await expect(page.locator(".paycycle-site")).toHaveCount(0);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.dark);
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expectColorContrast(page);
    await page.getByRole("link", { name: "← PayCycle", exact: true }).click();
    await expect(page.locator("body")).toHaveCSS("background-color", PAYCYCLE.paper);
    await expect(page.locator(".paycycle-site")).toHaveAttribute("lang", "ja");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  }
});

test("未生成ルートは 404", async ({ request }) => {
  expect((await request.get("/apps/does-not-exist/")).status()).toBe(404);
});

test("展示はキーボードで選べ、画面・状態・詳細リンクが同じアプリを指す", async ({ page }) => {
  await page.goto("/");
  const spotlight = page.getByRole("region", { name: i18n.ja.spotlight_title });
  await expect(page.locator(".hero .spotlight")).toHaveCount(0);
  await expect(page.locator(".home-showcase.section .spotlight")).toHaveCount(1);
  await expect(spotlight.getByRole("button", { name: apps[0]!.name, exact: true })).toHaveAttribute("aria-pressed", "true");
  const appsBox = (await page.locator("#apps").boundingBox())!;
  const showcaseBox = (await page.locator(".home-showcase").boundingBox())!;
  expect(showcaseBox.y).toBeGreaterThanOrEqual(appsBox.y + appsBox.height);
  for (const app of apps) {
    const choice = spotlight.getByRole("button", { name: app.name, exact: true });
    await choice.focus();
    await page.keyboard.press("Enter");
    await expect(choice).toBeFocused();
    await expect(choice).toHaveAttribute("aria-pressed", "true");
    await expect(spotlight.locator('[aria-pressed="true"]')).toHaveCount(1);
    const screenshot = spotlight.getByRole("img", { name: `${app.name} — ${app.screenshots.length ? i18n.ja.spotlight_screen : i18n.ja.spotlight_icon}` });
    await expect(screenshot).toHaveAttribute("src", app.screenshots[0] ? `/apps/${app.slug}/screenshots/${app.screenshots[0]}` : `/apps/${app.slug}/${app.icon}`);
    await expect.poll(() => screenshot.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(spotlight.locator(".spotlight-meta")).toContainText(statusLabel(app.status, i18n.ja));
    await expect(spotlight.getByRole("link")).toHaveAttribute("href", `/apps/${app.slug}/`);
  }
  await spotlight.getByRole("link").click();
  await expect(page).toHaveURL(`/apps/${apps.at(-1)!.slug}/`);
});

test("展示はテーマ・言語・reduced motionでも選択を保ち、シールに操作を覆われない", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const spotlight = page.locator(".spotlight");
  await spotlight.getByRole("button", { name: "CafLog", exact: true }).click();
  await page.getByRole("button", { name: i18n.ja.a11y_switch_language }).click();
  await page.getByRole("button", { name: i18n.en.a11y_switch_dark }).click();
  await expect(spotlight.getByRole("heading")).toHaveText(i18n.en.spotlight_title);
  await expect(spotlight.getByRole("button", { name: "CafLog", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(spotlight.getByRole("link")).toHaveAccessibleName("CafLog Explore");

  for (const width of [320, 390, 768, 1024, 1180, 1240, 1279, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    // trial click は表示・安定・他要素に覆われていないことを実操作と同じ条件で確認する。
    for (const app of apps) {
      await spotlight.getByRole("button", { name: app.name, exact: true }).click({ trial: true });
    }
    await spotlight.getByRole("link").click({ trial: true });
    await page.locator(".app-row").first().click({ trial: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
