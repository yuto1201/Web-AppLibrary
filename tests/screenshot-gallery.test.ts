import { describe, expect, it } from "vitest";
import { screenshotAlt, screenshotSrc, stepIndex, wrapIndex } from "../src/lib/screenshot-gallery";

describe("wrapIndex", () => {
  it("範囲内はそのまま", () => {
    expect(wrapIndex(2, 5)).toBe(2);
  });

  it("末尾の次は先頭", () => {
    expect(wrapIndex(5, 5)).toBe(0);
  });

  it("先頭の前は末尾", () => {
    expect(wrapIndex(-1, 5)).toBe(4);
  });

  it("件数が 0 なら 0", () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe("stepIndex", () => {
  it("正方向に 1 つ進む", () => {
    expect(stepIndex(0, 1, 4)).toBe(1);
  });

  it("最終から次は 0", () => {
    expect(stepIndex(3, 1, 4)).toBe(0);
  });

  it("先頭から前は最終", () => {
    expect(stepIndex(0, -1, 4)).toBe(3);
  });
});

describe("screenshot copy", () => {
  it("公開パスを slug とファイル名から作る", () => {
    expect(screenshotSrc("caflog", "2.png")).toBe("/apps/caflog/screenshots/2.png");
  });

  it("alt は 1 始まりの日本語", () => {
    expect(screenshotAlt("CafLog", 0)).toBe("CafLog スクリーンショット 1");
  });
});
