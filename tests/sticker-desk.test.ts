import { describe, expect, it } from "vitest";
import { apps } from "@/data/registry";
import { DESK_ITEMS, deskApp, statusStamp } from "@/lib/sticker-desk";

describe("sticker desk catalog", () => {
  it("掲載アプリが机に1枚ずつ載る", () => {
    const slugs = DESK_ITEMS.filter((item) => item.kind === "app").map((item) => item.slug);
    expect(slugs.sort()).toEqual(apps.map((app) => app.slug).sort());
  });

  it("Hero / 一覧 / 山の役割が仕様どおり", () => {
    expect(deskApp("sublog").anchor).toBe("hero");
    expect(deskApp("sublog").shape).toBe("round-rect");
    expect(deskApp("caflog").anchor).toBe("hero");
    expect(deskApp("caflog").shape).toBe("circle");
    expect(deskApp("dev-tools").anchor).toBe("apps");
    expect(deskApp("dev-tools").shape).toBe("squircle");
    expect(deskApp("pay-cycle").anchor).toBe("pile");
    expect(deskApp("pay-cycle").shape).toBe("round-lg");
  });

  it("飾りに Swift / Tokyo / 一人制作を持つ", () => {
    const words = DESK_ITEMS.filter((item) => item.kind === "word").map((item) => item.word);
    expect(words).toEqual(["Swift", "Tokyo", "一人制作"]);
    expect(DESK_ITEMS.find((item) => item.kind === "word" && item.word === "Tokyo")?.anchor).toBe("hero");
  });

  it("alpha / beta だけスタンプ文字を返す", () => {
    expect(statusStamp("alpha")).toBe("α");
    expect(statusStamp("beta")).toBe("β");
    expect(statusStamp("release")).toBeNull();
    expect(statusStamp("archived")).toBeNull();
  });
});
