import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { getApp } from "../../src/data/registry";

const app = getApp("flower")!;
const PAPER = { light: "rgb(255, 248, 241)", dark: "rgb(18, 16, 14)" } as const;
const FLOWER_PAPER = "rgb(244, 247, 252)";
const LEGAL = [
  { route: "support", title: "サポート", english: "Support" },
  { route: "privacy", title: "プライバシーポリシー", english: "Privacy Policy" },
  { route: "terms", title: "利用規約", english: "Terms of Use" },
] as const;

test.use({ timezoneId: "Asia/Tokyo" });

async function expectContrast(page: Page) {
  const results = await new AxeBuilder({ page }).withRules(["color-contrast", "link-name", "button-name"]).analyze();
  expect(results.violations).toEqual([]);
  expect(results.incomplete.filter(({ id }) => id === "color-contrast")).toEqual([]);
  expect(results.passes.some(({ id }) => id === "color-contrast")).toBe(true);
}

async function expectNoHorizontalScroll(page: Page) {
  await expect.poll(() => page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
}

test("Flower: the fixed URLs answer 200 without redirects and carry their own metadata", async ({ request }) => {
  for (const route of ["", "support/", "privacy/", "terms/"]) {
    const response = await request.get(`/apps/flower/${route}`, { maxRedirects: 0 });
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    const title = LEGAL.find((page) => `${page.route}/` === route)?.title;
    expect(html).toContain(`<meta property="og:url" content="https://app.yutodev.com/apps/flower/${route}"/>`);
    expect(html).toContain(`<meta property="og:title" content="${title ? `${title} — ${app.name}` : `${app.name} — AppLibrary`}"/>`);
    expect(html).toContain('<meta property="og:image" content="https://app.yutodev.com/ogp.png"/>');
    expect(html).not.toContain("Status: Confirmed");
    // v2（Issue #96）: 旧名を残さない。
    expect(html).not.toContain("花の島");
    expect(html).not.toMatch(/Flower Island(?!: Living Sky)/u);
  }
});

test("Flower: each legal page shows both languages, switches in place and links to the other two", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const legal of LEGAL) {
    await page.goto(`/apps/flower/${legal.route}/`);
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-tone");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`花島 ${legal.title} / Flower Island: Living Sky ${legal.english}`);
    const japanese = page.locator(`section#flower-${legal.route}-ja[lang='ja']`);
    const english = page.locator(`section#flower-${legal.route}-en[lang='en']`);
    await expect(japanese.getByRole("heading", { level: 2 })).toHaveText(legal.title);
    await expect(english.getByRole("heading", { level: 2 })).toHaveText(legal.english);
    await expect(page.locator("main")).not.toContainText("Status:");

    const switcher = page.getByRole("navigation", { name: "言語 / Language", exact: true });
    await switcher.getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/apps/flower/${legal.route}/#flower-${legal.route}-en$`, "u"));
    await expect(english).toBeInViewport();
    await switcher.getByRole("link", { name: "日本語", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#flower-${legal.route}-ja$`, "u"));

    const footer = page.locator("footer.page-footer");
    for (const other of LEGAL.filter(({ route }) => route !== legal.route)) {
      await expect(footer.getByRole("link", { name: other.title, exact: true })).toHaveAttribute("href", `/apps/flower/${other.route}/`);
    }
    await expect(page.getByRole("link", { name: "← 花島", exact: true })).toHaveAttribute("href", "/apps/flower/");

    const sizes = await page.evaluate(() => ["h2", "h3", "p"].map((tag) => parseFloat(getComputedStyle(document.querySelector(`.privacy-page section ${tag}`)!).fontSize)));
    expect(sizes[0]!).toBeGreaterThan(sizes[1]!);
    expect(sizes[1]!).toBeGreaterThanOrEqual(sizes[2]!);
    await expectContrast(page);
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expectNoHorizontalScroll(page);
    }
  }

  await page.goto("/apps/flower/support/");
  const japaneseSupport = page.locator("section[lang='ja']");
  await expect(japaneseSupport.getByRole("link", { name: "https://app.yutodev.com/apps/flower/terms/", exact: true })).toHaveAttribute("href", "/apps/flower/terms/");
  await expect(japaneseSupport.getByRole("link", { name: "https://x.com/Yuto_Program", exact: true })).toHaveAttribute("target", "_blank");
  await japaneseSupport.getByRole("link", { name: "https://app.yutodev.com/apps/flower/privacy/", exact: true }).click();
  await expect(page).toHaveURL(/\/apps\/flower\/privacy\/$/u);
  await expect(page.locator("section[lang='en']")).toContainText("Apple WeatherKit");
  expect(errors).toEqual([]);
});

test("Flower: the product page follows the visitor's time and offers a sky preview", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.setFixedTime(new Date("2026-10-12T22:15:00+09:00"));
  await page.goto("/apps/flower/");
  const site = page.locator(".flower-site");
  await expect(page.locator("body")).toHaveCSS("background-color", FLOWER_PAPER);
  await expect(site).toHaveAttribute("lang", "ja");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${app.name} — 浮かぶ島で、花と空を眺める。`);
  await expect(site).toHaveAttribute("data-sky", "night");
  await expect(page.locator(".fl-clock")).toHaveAttribute("data-clock", "22:15");
  await expect(page.locator(".fl-window")).toHaveAttribute("aria-hidden", "true");

  const picker = page.getByRole("group", { name: "空の時間を選ぶ", exact: true });
  await expect(picker.getByRole("button", { name: "いま", exact: true })).toHaveAttribute("aria-pressed", "true");
  await picker.getByRole("button", { name: "朝", exact: true }).click();
  await expect(site).toHaveAttribute("data-sky", "morning");
  await expect(page.locator(".fl-clock")).toHaveAttribute("data-clock", "06:30");
  await expect(page.locator(".fl-hero-visual figcaption")).toContainText("朝の空のイメージ");
  const dusk = picker.getByRole("button", { name: "夕方", exact: true });
  await dusk.focus();
  await page.keyboard.press("Enter");
  await expect(dusk).toHaveAttribute("aria-pressed", "true");
  await expect(site).toHaveAttribute("data-sky", "dusk");
  await expect(picker.locator('[aria-pressed="true"]')).toHaveCount(1);
  await picker.getByRole("button", { name: "いま", exact: true }).click();
  await expect(site).toHaveAttribute("data-sky", "night");
  await expect(page.locator(".fl-clock")).toHaveAttribute("data-clock", "22:15");

  await expect(page.locator(".fl-name")).toHaveText("花島Flower Island: Living Sky");
  await expect(page.locator(".fl-name [lang='en']")).toBeVisible();
  await expect(page.locator(".fl-availability")).toContainText("iOS / iPadOS 27以降");
  await expect(page.locator("#quiet")).toContainText("WeatherKit");
  await expect(page.locator(".fl-release")).toHaveText("リリース準備中");
  await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  await expect(page.locator("#screenshots")).toHaveCount(0);
  const icon = page.locator(".fl-wordmark img");
  await expect.poll(() => icon.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(512);
  const flowers = page.locator(".fl-flower");
  await expect(flowers).toHaveCount(6);
  await expect(flowers.filter({ hasText: "はじめから" })).toHaveCount(3);
  await expect(flowers.filter({ hasText: "アプリ内課金で追加" })).toHaveCount(3);
  for (const image of await page.locator(".fl-flower-art img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(480);
  }
  await expect(page.locator("#features .feature-row")).toHaveCount(app.features.length);
  await expectContrast(page);

  const related = page.getByRole("navigation", { name: "花島 関連リンク", exact: true });
  for (const legal of LEGAL) {
    await expect(related.getByRole("link", { name: legal.title, exact: true })).toHaveAttribute("href", `/apps/flower/${legal.route}/`);
  }
  await related.getByRole("link", { name: "サポート", exact: true }).click();
  await expect(page).toHaveURL(/\/apps\/flower\/support\/$/u);
  await expect(page.locator("body")).toHaveCSS("background-color", PAPER.light);
  await page.getByRole("link", { name: "← 花島", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", FLOWER_PAPER);
  await page.getByRole("link", { name: "← AppLibrary", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator('.app-row[href="/apps/flower/"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("Flower: the product page keeps its palette at every width, in the saved dark theme and with reduced motion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("applibrary_state", JSON.stringify({ theme: "dark", lang: "en" })));
  await page.clock.setFixedTime(new Date("2026-10-12T12:00:00+09:00"));
  await page.goto("/apps/flower/");
  await expect(page.locator(".flower-site")).toHaveAttribute("data-sky", "day");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoHorizontalScroll(page);
    await expect(page.locator("body")).toHaveCSS("background-color", FLOWER_PAPER);
    await expect(page.locator(".flower-site")).toHaveAttribute("lang", "ja");
    // 文中のリンクを除く、単独で押す操作はすべて 44px 以上の高さを持つ。
    for (const control of await page.locator(".flower-site :is(header a, .fl-button, .fl-sky-picker button, footer a)").all()) {
      const box = (await control.boundingBox())!;
      expect(box.height, await control.textContent() ?? "").toBeGreaterThanOrEqual(44);
    }
  }
  await expectContrast(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('.fl-sky[data-layer="day"]')).toHaveCSS("transition-duration", "0s");
});

test("Flower: the legal pages use the saved dark theme and hand it back to the product page", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("applibrary_state", JSON.stringify({ theme: "dark", lang: "en" })));
  for (const legal of LEGAL) {
    await page.goto(`/apps/flower/${legal.route}/`);
    await expect(page.locator("body")).toHaveCSS("background-color", PAPER.dark);
    await expectContrast(page);
  }
  await page.getByRole("link", { name: "← 花島", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", FLOWER_PAPER);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Flower: the clock and sky keep following the visitor's time", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-12T19:59:20+09:00") });
  await page.goto("/apps/flower/");
  const site = page.locator(".flower-site");
  await expect(site).toHaveAttribute("data-sky", "dusk");
  await expect(page.locator(".fl-clock")).toHaveAttribute("data-clock", "19:59");
  await page.clock.runFor(60_000);
  await expect(page.locator(".fl-clock")).toHaveAttribute("data-clock", "20:00");
  await expect(site).toHaveAttribute("data-sky", "night");
  await expect(page.locator(".fl-hero-visual figcaption")).toContainText("いまの時刻に合わせた空のイメージ");
});
