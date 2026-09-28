import { expect, test } from "@playwright/test";
import { apps } from "../../src/data/registry";
import { statusLabel } from "../../src/lib/labels";
import { i18n } from "../../src/lib/site-data";

test("展示はキーボードで選べ、画面・状態・詳細リンクが同じアプリを指す", async ({ page }) => {
  await page.goto("/");
  const spotlight = page.getByRole("complementary", { name: i18n.ja.spotlight_title });
  for (const app of apps) {
    const choice = spotlight.getByRole("button", { name: app.name, exact: true });
    await choice.focus();
    await page.keyboard.press("Enter");
    await expect(choice).toBeFocused();
    await expect(choice).toHaveAttribute("aria-pressed", "true");
    await expect(spotlight.locator('[aria-pressed="true"]')).toHaveCount(1);
    const screenshot = spotlight.getByRole("img", { name: `${app.name} — ${i18n.ja.spotlight_screen}` });
    await expect(screenshot).toHaveAttribute("src", `/apps/${app.slug}/screenshots/${app.screenshots[0]}`);
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

  for (const width of [320, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    // trial click は表示・安定・他要素に覆われていないことを実操作と同じ条件で確認する。
    for (const app of apps) {
      await spotlight.getByRole("button", { name: app.name, exact: true }).click({ trial: true });
    }
    await spotlight.getByRole("link").click({ trial: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
