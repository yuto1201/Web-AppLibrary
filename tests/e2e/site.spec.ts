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
const PAPER = { light: "rgb(250, 250, 248)", dark: "rgb(19, 18, 16)" } as const;
const INK = { light: "rgb(20, 19, 16)", dark: "rgb(242, 240, 234)" } as const;

/**
 * 個別ページ (app-page.css) は今回の再設計の対象外で背景に radial-gradient を使う。
 * axe は gradient の下の色を解決できないため、判定時だけ単色へ倒す。
 * トップと法務ページは単色になったので、この平坦化は不要。
 */
const FLATTEN_APP_SHELL =
  ".app-shell{background:#f8fafc!important}.hero-badge{background:#fff!important}" +
  ".hero-tagline{background:none!important;color:var(--app-accent)!important}" +
  ".btn-primary{background:var(--app-accent)!important}";

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

  const sticker = page.locator(".sticker").first();
  await sticker.scrollIntoViewIfNeeded();

  // 初期表示の時点で帯からはみ出していないこと。
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    .toBe(0);
  const band = await page.locator(".sticker-band").boundingBox();
  const spread = await page.locator(".sticker").evaluateAll((nodes) => {
    const boxes = nodes.map((node) => node.getBoundingClientRect());
    return { left: Math.min(...boxes.map((b) => b.left)), right: Math.max(...boxes.map((b) => b.right)) };
  });
  expect(spread.left).toBeGreaterThanOrEqual(band!.x - 1);
  expect(spread.right).toBeLessThanOrEqual(band!.x + band!.width + 1);

  const before = await sticker.boundingBox();
  expect(before).not.toBeNull();

  // 掴んで大きく動かす。帯の外へ出ようとしてもクランプされる。
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

  // ならべ直すと元の位置へ戻る。
  const reset = page.getByRole("button", { name: "ならべ直す" });
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(reset).toBeHidden();
  // 戻りは transition で補間されるので、収束するまで待つ。
  await expect
    .poll(async () => {
      const box = await sticker.boundingBox();
      return Math.round(Math.abs(box!.x - before!.x) + Math.abs(box!.y - before!.y));
    })
    .toBeLessThan(2);
});

test("ドラッグの後でもキーボードから遷移できる", async ({ page }) => {
  await page.goto("/");

  const sticker = page.locator(`.sticker[href="/apps/${apps[0]!.slug}/"]`);
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
  await sticker.scrollIntoViewIfNeeded();
  await expect(sticker).toHaveAttribute("aria-label", apps[0]!.name);
  await sticker.click();
  await expect(page).toHaveURL(new RegExp(`/apps/${apps[0]!.slug}/$`, "u"));
  await expect(page.getByRole("heading", { level: 1, name: apps[0]!.name, exact: true })).toBeVisible();
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
    await page.goto(`/apps/${app.slug}/`);
    await expect(page).toHaveURL(new RegExp(`/apps/${app.slug}/$`, "u"));
    await expect(page.getByRole("heading", { name: app.name, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(248, 250, 252)");
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
    // 個別ページは今回の再設計の対象外で、背景が radial-gradient のままなので
    // axe が解決できない面だけ単色へ倒して判定する。
    await page.addStyleTag({ content: FLATTEN_APP_SHELL });
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
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
      .toBe(true);
    await page.addStyleTag({ content: FLATTEN_APP_SHELL });
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

test("未生成ルートは 404", async ({ request }) => {
  expect((await request.get("/apps/does-not-exist/")).status()).toBe(404);
});
