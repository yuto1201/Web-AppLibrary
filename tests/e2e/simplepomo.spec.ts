import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("SimplePomo: published routes, bilingual legal copy and navigation", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["", "privacy/", "terms/"]) {
    const response = await request.get(`/apps/simple-pomo/${route}`);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(`https://app.yutodev.com/apps/simple-pomo/${route}`);
  }
  await page.goto("/apps/simple-pomo/");
  await expect(page.locator(".simplepomo-site")).toHaveCSS("background-color", "rgb(8, 8, 8)");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 8, 8)");
  await expect(page.locator(".sp-release")).toHaveText("リリース準備中");
  await expect(page.locator('a[href*="apps.apple.com"]')).toHaveCount(0);
  await expect(page.locator("#screenshots")).toHaveCount(0);
  const icon = page.locator(".sp-wordmark img");
  await expect.poll(() => icon.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBe(1024);
  await expect(page.locator("#features .feature-row")).toHaveCount(3);
  await page.getByRole("link", { name: "プライバシーポリシー", exact: true }).click();
  for (const route of ["privacy", "terms"]) {
    await expect(page).toHaveURL(new RegExp(`/apps/simple-pomo/${route}/$`, "u"));
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 248, 241)");
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-tone");
    await expect(page.locator("section[lang='ja']")).toBeVisible();
    await expect(page.locator("section[lang='en']")).toBeVisible();
    await page.getByRole("link", { name: "English", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#simplepomo-${route}-en$`, "u"));
    await expect(page.locator("section[lang='en']")).toContainText("AlarmKit");
    if (route === "privacy") await page.getByRole("link", { name: "利用規約", exact: true }).click();
  }
  await page.getByRole("link", { name: "← SimplePomo", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 8, 8)");
  await page.getByRole("link", { name: "← AppLibrary", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(220, 238, 255)");
  await expect(page.locator('.app-row[href="/apps/simple-pomo/"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("SimplePomo: motion pauses by keyboard and follows system preference", async ({ page }) => {
  await page.goto("/apps/simple-pomo/");
  const motion = page.getByRole("button", { name: "アニメーションを一時停止", exact: true });
  const hand = page.locator(".sp-dial-hand");
  await expect(motion).toHaveAttribute("aria-pressed", "false");
  await expect(hand).toHaveCSS("animation-play-state", "running");
  await motion.focus(); await page.keyboard.press("Enter");
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await expect(hand).toHaveCSS("animation-play-state", "paused");
  await page.keyboard.press("Space");
  await expect(motion).toHaveAttribute("aria-pressed", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(motion).toBeDisabled();
  await expect(motion).toHaveAttribute("aria-pressed", "true");
  await expect(hand).toHaveCSS("animation-name", "none");
});

test("SimplePomo: mobile widths, contrast and saved theme survive legal navigation", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("applibrary_state", JSON.stringify({ theme: "dark", lang: "en" })));
  await page.goto("/apps/simple-pomo/");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
    await expect(page.locator(".simplepomo-site")).toHaveAttribute("lang", "ja");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 8, 8)");
  }
  await page.addStyleTag({ content: ".simplepomo-site *, .simplepomo-site *::before, .simplepomo-site *::after { animation: none !important; transition: none !important; }" });
  const contrast = await new AxeBuilder({ page }).withRules(["color-contrast", "link-name", "button-name"]).analyze();
  expect(contrast.violations).toEqual([]);
  expect(contrast.incomplete.filter(({ id }) => id === "color-contrast")).toEqual([]);
  expect(contrast.passes.some(({ id }) => id === "color-contrast")).toBe(true);
  for (const route of ["privacy", "terms"]) {
    await page.goto(`/apps/simple-pomo/${route}/`);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(18, 16, 14)");
    const legalContrast = await new AxeBuilder({ page }).withRules(["color-contrast", "link-name"]).analyze();
    expect(legalContrast.violations).toEqual([]);
    expect(legalContrast.incomplete.filter(({ id }) => id === "color-contrast")).toEqual([]);
    expect(legalContrast.passes.some(({ id }) => id === "color-contrast")).toBe(true);
  }
  await page.getByRole("link", { name: "← SimplePomo", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 8, 8)");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-lang", "en");
});
