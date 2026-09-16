import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { apps } from "../../src/data/registry";

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
const ACCENT = { light: "rgb(0, 102, 238)", dark: "rgb(110, 179, 255)" } as const;

/** アニメーションだけ止める。色は実際の値のまま axe に判定させる。 */
const FREEZE = "html *, html *::before, html *::after { animation: none !important; transition: none !important; }";

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

async function centerHits(page: Page, target: ReturnType<typeof page.locator>, selector: string) {
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

test("ポスター紙面はクリームと電圧ブルーで、Bricolage を使わない", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
  await expect(page.locator("body")).toHaveCSS("color", INK.light);

  const html = await page.content();
  expect(html.toLowerCase()).not.toContain("bricolage");

  const headingFont = await page.locator(".hero-h1").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(headingFont.toLowerCase()).toMatch(/newsreader/);

  const cta = page.locator(".cta-btn");
  await expect(cta).toHaveCSS("color", ACCENT.light);
  const [background, radius, borderWidth] = await cta.evaluate((el) => {
    const cs = getComputedStyle(el);
    return [cs.backgroundColor, parseFloat(cs.borderTopLeftRadius), parseFloat(cs.borderTopWidth)];
  });
  expect(background === "rgba(0, 0, 0, 0)" || background === "transparent").toBe(true);
  expect(radius).toBeGreaterThanOrEqual(30);
  expect(borderWidth).toBeGreaterThanOrEqual(1);

  await page.getByRole("button", { name: "ダークモードに切り替える" }).click();
  await expect(page.locator(".cta-btn")).toHaveCSS("color", ACCENT.dark);
});

test("机のテープとスタンプと手書き合図がある", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".desk-tape")).toHaveCount(1);
  await expect(page.locator(".desk-stamp")).toHaveText("TOKYO '26");
  const hint = page.locator(".desk-hint");
  await expect(hint).toHaveText("つまんでみて");
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
  await expect(page.locator(".desk-hint")).toHaveText("Pinch one.");
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

test("一覧は行の索引で、検索・フィルタ・モーダルを持たない", async ({ page }) => {
  await page.goto("/");

  const rows = page.locator(".app-row");
  await expect(rows).toHaveCount(apps.length);
  await expect(page.locator(".section-count").first()).toHaveText(String(apps.length));

  // 掲載数に対して過剰だった操作系は撤去済み。
  await expect(page.locator("#search-input")).toHaveCount(0);
  await expect(page.locator(".chip")).toHaveCount(0);
  await expect(page.getByText("プラットフォーム", { exact: true })).toHaveCount(0);
  await expect(page.getByText("カテゴリ", { exact: true })).toHaveCount(0);

  // 掲載中の全アプリが行として名前・説明・年と一緒に並ぶ。
  for (const app of apps) {
    const row = rows.filter({ has: page.getByText(app.name, { exact: true }) });
    await expect(row).toHaveAttribute("href", `/apps/${app.slug}/`);
    await expect(row.locator(".app-row-tagline")).toHaveText(app.tagline);
    await expect(row.locator(".app-row-year")).toHaveText(String(app.year));
  }

  // 行のクリックはモーダルを開かず、そのまま個別ページへ移る。
  await rows.first().click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/apps\/[a-z-]+\/$/u);
});

test("ステッカーは掴んで動かせて、離すと横スクロールを作らない", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator('.sticker[href="/apps/sublog/"]');
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);

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

  // ならべ直すと机の位置へ戻る（リセット操作でフッターへスクロールしても文書座標は同じ）。
  const reset = page.getByRole("button", { name: "ならべ直す" });
  await expect(reset).toBeVisible();
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

test("初期表示でシールが Hero と一覧見出しに乗っている", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");

  await expect(page.locator(".sticker-band")).toHaveCount(0);
  await expect(page.locator(".sticker-name")).toHaveCount(0);

  const hero = (await page.locator(".hero-h1").boundingBox())!;
  const appsHead = (await page.locator("#apps").boundingBox())!;
  const footer = (await page.locator(".footer").boundingBox())!;
  const cta = page.locator(".cta-btn");

  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  const caflog = page.locator('.sticker[href="/apps/caflog/"]');
  const devTools = page.locator('.sticker[href="/apps/dev-tools/"]');
  const payCycle = page.locator('.sticker[href="/apps/pay-cycle/"]');

  const sublogBox = (await sublog.boundingBox())!;
  const caflogBox = (await caflog.boundingBox())!;
  const devBox = (await devTools.boundingBox())!;
  const payBox = (await payCycle.boundingBox())!;

  expect(sublogBox.y + sublogBox.height / 2).toBeLessThan(appsHead.y);
  expect(sublogBox.y).toBeGreaterThan(hero.y - 40);
  expect(caflogBox.y + caflogBox.height / 2).toBeLessThan(appsHead.y);
  expect(Math.abs(devBox.y - appsHead.y)).toBeLessThan(120);
  expect(payBox.y).toBeGreaterThan(footer.y - 160);

  const tokyo = page.locator('.sticker-slot[data-key="note-Tokyo"] .sticker');
  const tokyoBox = (await tokyo.boundingBox())!;
  expect(boxesOverlap(caflogBox, tokyoBox)).toBe(false);
  expect(boxesOverlap(sublogBox, tokyoBox)).toBe(false);

  const firstRow = (await page.locator(".app-row").first().boundingBox())!;
  expect(boxesOverlap(devBox, firstRow)).toBe(false);

  await expect(cta).toBeVisible();
  const ctaBox = (await cta.boundingBox())!;
  const hitsCta = [sublogBox, caflogBox].some((box) =>
    box.x < ctaBox.x + ctaBox.width && box.x + box.width > ctaBox.x &&
    box.y < ctaBox.y + ctaBox.height && box.y + box.height > ctaBox.y,
  );
  expect(hitsCta).toBe(false);
  await cta.click();
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(/apps/);

  const stagePosition = await page.locator(".sticker-stage").evaluate((el) => getComputedStyle(el).position);
  expect(stagePosition).not.toBe("fixed");
});

test("390px で見出しと CTA が押せる", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const heading = page.locator(".hero-h1");
  await expect(heading).toBeVisible();
  await expect(page.locator(".cta-btn")).toBeVisible();
  expect(await centerHits(page, heading, ".hero-h1")).toBe(true);
  expect(await centerHits(page, page.locator(".cta-btn"), ".cta-btn")).toBe(true);
  const appsHead = (await page.locator("#apps").boundingBox())!;
  const firstRow = (await page.locator(".app-row").first().boundingBox())!;
  const devBox = (await page.locator('.sticker[href="/apps/dev-tools/"]').boundingBox())!;
  expect(Math.abs(devBox.y - appsHead.y)).toBeLessThan(80);
  expect(boxesOverlap(devBox, firstRow)).toBe(false);
  await page.locator(".cta-btn").click();
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(/apps/);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
});

test("640px で見出しと CTA が押せる", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto("/");
  const heading = page.locator(".hero-h1");
  const cta = page.locator(".cta-btn");
  await expect(heading).toBeVisible();
  await expect(cta).toBeVisible();
  expect(await centerHits(page, heading, ".hero-h1")).toBe(true);
  expect(await centerHits(page, cta, ".cta-btn")).toBe(true);
  const appsHead = (await page.locator("#apps").boundingBox())!;
  const firstRow = (await page.locator(".app-row").first().boundingBox())!;
  const devBox = (await page.locator('.sticker[href="/apps/dev-tools/"]').boundingBox())!;
  expect(Math.abs(devBox.y - appsHead.y)).toBeLessThan(80);
  expect(boxesOverlap(devBox, firstRow)).toBe(false);

  await cta.click();
  await expect.poll(() => page.evaluate(() => location.hash)).toMatch(/apps/);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);
});

test("初期配置のシールは Hero の文字と CTA を覆わない", async ({ page }) => {
  for (const width of [390, 641, 768, 834, 1023, 1024, 1280] as const) {
    await page.setViewportSize({ width, height: width >= 800 ? 900 : 844 });
    await page.goto("/");
    await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
    const heading = page.locator(".hero-h1");
    const cta = page.locator(".cta-btn");
    const protectedBoxes = {
      h1: (await heading.boundingBox())!,
      bio: (await page.locator(".hero-bio").boundingBox())!,
      note: (await page.locator(".hero-note").boundingBox())!,
      hint: (await page.locator(".desk-hint").boundingBox())!,
      cta: (await cta.boundingBox())!,
    };
    const stickers = page.locator(".sticker-slot .sticker");
    const count = await stickers.count();
    for (let index = 0; index < count; index += 1) {
      const painted = (await stickers.nth(index).boundingBox())!;
      const key = await stickers.nth(index).evaluate((el) => el.closest(".sticker-slot")?.getAttribute("data-key"));
      for (const [name, target] of Object.entries(protectedBoxes)) {
        expect(boxesOverlap(painted, target), `${width}px ${key} × ${name}`).toBe(false);
      }
    }
    expect(await centerHits(page, heading, ".hero-h1"), `${width}px heading center`).toBe(true);
    expect(await centerHits(page, cta, ".cta-btn"), `${width}px cta center`).toBe(true);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      .toBe(true);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "英語に切り替える" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect.poll(() => page.locator(".poster").getAttribute("data-desk")).toBe("ready");
  const enHeading = page.locator(".hero-h1");
  const enCta = page.locator(".cta-btn");
  expect(await centerHits(page, enHeading, ".hero-h1")).toBe(true);
  expect(await centerHits(page, enCta, ".cta-btn")).toBe(true);
  const enCtaBox = (await enCta.boundingBox())!;
  const enStickers = page.locator(".sticker-slot .sticker");
  const enCount = await enStickers.count();
  for (let index = 0; index < enCount; index += 1) {
    const painted = (await enStickers.nth(index).boundingBox())!;
    expect(boxesOverlap(painted, enCtaBox), `1280en sticker ${index} × cta`).toBe(false);
  }
});

test("置いたシールはスクロールしても viewport に張り付かない", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator('.sticker[href="/apps/pay-cycle/"]');
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
  const before = (await sticker.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.waitForTimeout(350);
  await page.mouse.down();
  // フッターを見ている状態から、ビューポート上端へ引き上げる。
  await page.mouse.move(before.x + 40, 80, { steps: 16 });
  await page.mouse.up();

  const placed = await sticker.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, docTop: box.top + window.scrollY };
  });

  const scrolled = await page.evaluate(() => {
    const root = document.documentElement;
    const beforeY = root.scrollTop;
    root.scrollTo({ top: Math.max(0, beforeY - 400), behavior: "instant" });
    return beforeY - root.scrollTop;
  });
  expect(scrolled).toBeGreaterThan(200);

  const after = await sticker.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, docTop: box.top + window.scrollY };
  });
  // 紙に貼ったままスクロールする。fixed なら viewport 上端に張り付き docTop が動く。
  expect(Math.abs(after.docTop - placed.docTop)).toBeLessThan(2);
  expect(after.top - placed.top).toBeGreaterThan(200);
});

test("ドラッグの後でもキーボードから遷移できる", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator(`.sticker[href="/apps/${apps[0]!.slug}/"]`);
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
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
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
  await expect(sticker).toHaveAttribute("aria-label", apps[0]!.name);
  await sticker.click();
  await expect(page).toHaveURL(new RegExp(`/apps/${apps[0]!.slug}/$`, "u"));
  await expect(page.getByRole("heading", { level: 1, name: apps[0]!.name, exact: true })).toBeVisible();
});

test("個別ページの標本シールはリンクではなく動かせる", async ({ page }) => {
  await page.goto("/apps/sublog/");
  const specimen = page.locator(".app-shell .sticker");
  await expect(specimen).toHaveCount(1);
  await expect(specimen).not.toHaveAttribute("href");
  const before = (await specimen.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.waitForTimeout(350);
  await page.mouse.down();
  await page.mouse.move(before.x - 80, before.y + 60, { steps: 10 });
  await page.mouse.up();
  const after = (await specimen.boundingBox())!;
  expect(Math.abs(after.x - before.x) + Math.abs(after.y - before.y)).toBeGreaterThan(20);
  await expect.poll(() => new URL(page.url()).pathname).toBe("/apps/sublog/");

  await page.goto("/apps/sublog/privacy/");
  await expect(page.locator(".app-shell .sticker")).toHaveCount(0);
});

test("一覧行とステッカーが slug で相互にハイライトする", async ({ page }) => {
  await page.goto("/");
  const target = apps[1]!; // CafLog。先頭以外を選び、初期状態が非活性であることも確認する。
  const row = page.locator(`.app-row[href="/apps/${target.slug}/"]`);
  const sticker = page.locator(`.sticker[href="/apps/${target.slug}/"]`);

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
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
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
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
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
  const sublog = page.locator('.sticker[href="/apps/sublog/"]');
  await raiseSticker(sublog);
  const box = (await sublog.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
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
  await sticker.scrollIntoViewIfNeeded();
  await raiseSticker(sticker);
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

  await expect(sticker).not.toHaveClass(/\bis-held\b/u);
  await expect(slot.locator(".sticker-ghost")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
    .toBe(true);

  await page.setViewportSize(viewport);
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

test("既定は紙のライトテーマで、light / dark 双方が実配色でコントラストを満たす", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
  await expect(page.locator("body")).toHaveCSS("color", INK.light);
  await expectColorContrast(page);

  await page.getByRole("button", { name: "ダークモードに切り替える" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
  await expect(page.locator("body")).toHaveCSS("color", INK.dark);
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
    ["/apps/sublog/", ".app-shell"],
    ["/apps/sublog/privacy/", ".app-shell"],
    ["/privacy/", ".legal-page"],
    ["/terms/", ".legal-page"],
  ] as const) {
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(selector)).toHaveAttribute("lang", "ja");
    if (route === "/apps/sublog/") {
      await expect(page.getByRole("heading", { level: 2, name: "Features" })).toHaveAttribute("lang", "en");
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
  await expect(page.locator("article")).toContainText("テーマと言語");
  await expect(page.locator("article")).not.toContainText("検索入力");
  await expect(page.locator("article")).not.toContainText("表示密度");
  await expect(page.locator(".legal-meta time[datetime='2026-09-16']")).toHaveText("2026年9月16日");
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

for (const app of apps) {
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
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".hero-title")).toHaveCSS("font-weight", "400");
    await expect(page.locator(".hero-title")).toHaveCSS("color", INK.light);
    await expect(page.locator(".hero-tagline")).toHaveCSS("color", INK_2.light);
    await expect(page.locator(".section-title").first()).toHaveCSS("font-family", /Newsreader/i);
    await expect(page.locator(".feature-card").first()).toHaveCSS("box-shadow", "none");
    if (app.slug === "sublog") {
      const heroInner = await page.locator(".hero-inner").boundingBox();
      const pageBox = await page.locator(".page").boundingBox();
      expect(heroInner).not.toBeNull();
      expect(pageBox).not.toBeNull();
      expect(Math.abs(heroInner!.x - pageBox!.x)).toBeLessThan(2);
    }
    const primary = page.locator(".btn-primary").first();
    if (await primary.count()) {
      await expect(primary).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
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
    const features = page.locator("#features .feature-card");
    await expect(features).toHaveCount(app.features.length);
    await expect(features.first()).toContainText(app.features[0]!.description);
    const screenshots = page.locator("#screenshots img");
    await expect(screenshots).toHaveCount(app.screenshots.length);
    for (const screenshot of await screenshots.all()) {
      await screenshot.scrollIntoViewIfNeeded();
      await expect(screenshot).toBeVisible();
      await expect.poll(() => screenshot.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    if (app.slug === "caflog" && (page.viewportSize()?.width ?? 0) >= 1000) {
      const boxes = (await screenshots.all()).map(async (screenshot) => screenshot.boundingBox());
      const resolvedBoxes = (await Promise.all(boxes)).filter((box) => box !== null);
      const lastRowY = Math.max(...resolvedBoxes.map((box) => box.y));
      const lastRow = resolvedBoxes.filter((box) => Math.abs(box.y - lastRowY) < 2);
      const left = Math.min(...lastRow.map((box) => box.x));
      const right = Math.max(...lastRow.map((box) => box.x + box.width));
      const row = await page.locator(".shot-row").boundingBox();
      expect(row).not.toBeNull();
      expect(Math.abs((left + right) / 2 - (row!.x + row!.width / 2))).toBeLessThan(2);
    }
    if (app.slug === "pay-cycle") {
      await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
      await expect(page.getByRole("link", { name: "サポート", exact: true }))
        .toHaveAttribute("href", "https://app.yutodev.com/#contact");
      await expect(page.getByRole("link", { name: "利用規約", exact: true }))
        .toHaveAttribute("href", "/apps/pay-cycle/terms/");
    }
    await page.getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/privacy/$`, "u"));
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
    await page.getByRole("link", { name: "← AppLibrary", exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
    await expect(page.locator(".app-shell")).toHaveCount(0);
    // トップへ戻ると紙面の配色に戻る。
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator("body")).toHaveCSS("color", INK.light);
    await expect(page.locator(".app-row")).toHaveCount(apps.length);
    await page.getByRole("link", { name: "プライバシー", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "プライバシーポリシー" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

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
  await expectColorContrast(page);
});

test("未生成ルートは 404", async ({ request }) => {
  expect((await request.get("/apps/does-not-exist/")).status()).toBe(404);
});
