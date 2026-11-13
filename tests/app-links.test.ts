import { describe, expect, it } from "vitest";
import { apps, getApp } from "../src/data/registry";
import { appLinks } from "../src/lib/app-links";

describe("appLinks", () => {
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
});
