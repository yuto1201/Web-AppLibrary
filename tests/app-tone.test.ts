import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apps } from "../src/data/registry";
import { APP_PAGE_TONE, appPageTone, appTone } from "../src/lib/app-tone";

describe("app page tone", () => {
  it("掲載アプリはすべて色味を持つ", () => {
    expect(apps.map((app) => app.slug).sort()).toEqual(Object.keys(APP_PAGE_TONE).sort());
    for (const app of apps) expect(appPageTone(app.slug)?.tone).toBe(appTone(app.slug));
  });

  it("未知の slug には色味を付けない", () => {
    expect(appTone("unknown")).toBeUndefined();
  });

  it("CSS が同じ wash と ink を持つ", () => {
    const css = readFileSync(new URL("../src/styles/app-page.css", import.meta.url), "utf8");
    for (const page of Object.values(APP_PAGE_TONE)) {
      expect(css).toContain(`data-tone="${page.tone}"`);
      expect(css).toContain(page.wash);
      expect(css).toContain(page.ink);
      expect(css).toContain(page.darkInk);
    }
  });
});
