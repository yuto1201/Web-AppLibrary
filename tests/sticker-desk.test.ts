import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { apps } from "@/data/registry";
import { DESK_ITEMS, deskApp, statusStamp } from "@/lib/sticker-desk";

describe("sticker desk catalog", () => {
  it("掲載アプリが机に1枚ずつ載る", () => {
    const slugs = DESK_ITEMS.filter((item) => item.kind === "app").map((item) => item.slug);
    expect(slugs.sort()).toEqual(apps.map((app) => app.slug).sort());
  });

  it("すべてのシールを Hero に置き、アプリごとの形を保つ", () => {
    expect(DESK_ITEMS.every((item) => item.anchor === "hero")).toBe(true);
    expect(deskApp("sublog").shape).toBe("round-rect");
    expect(deskApp("caflog").shape).toBe("circle");
    expect(deskApp("dev-tools").shape).toBe("squircle");
    expect(deskApp("pay-cycle").shape).toBe("round-lg");
    expect(deskApp("simple-pomo").shape).toBe("circle");
  });

  it("飾りに Swift / Tokyo / 一人制作を持つ", () => {
    const words = DESK_ITEMS.filter((item) => item.kind === "word").map((item) => item.word);
    expect(words).toEqual(["Swift", "Tokyo", "一人制作"]);
    expect(DESK_ITEMS.find((item) => item.kind === "word" && item.word === "Tokyo")?.anchor).toBe("hero");
  });

  it("すべての data-key にホーム専用 CSS の初期位置がある", () => {
    const css = readFileSync(join(process.cwd(), "src/styles/studio.css"), "utf8");
    for (const item of DESK_ITEMS) {
      expect(css).toContain(`.sticker-slot[data-key="${item.key}"]`);
    }
  });

  it("alpha / beta だけスタンプ文字を返す", () => {
    expect(statusStamp("alpha")).toBe("α");
    expect(statusStamp("beta")).toBe("β");
    expect(statusStamp("release")).toBeNull();
    expect(statusStamp("archived")).toBeNull();
  });
});
