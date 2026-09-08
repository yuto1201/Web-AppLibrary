import { describe, expect, it } from "vitest";
import { baseBox, clampOffset, isTap, moveOffset, ORIGIN } from "../src/lib/drag";

const band = { left: 0, top: 0, right: 800, bottom: 300 };
/** 帯の左上に置いた 100x100 のステッカー。 */
const sticker = { left: 50, top: 50, right: 150, bottom: 150 };

describe("moveOffset", () => {
  it("掴んだ時点のオフセットへ移動量を足す", () => {
    expect(moveOffset({ x: 10, y: -5 }, { x: 100, y: 100 }, { x: 130, y: 80 })).toEqual({ x: 40, y: -25 });
  });

  it("動かなければオフセットは変わらない", () => {
    expect(moveOffset({ x: 7, y: 7 }, { x: 200, y: 200 }, { x: 200, y: 200 })).toEqual({ x: 7, y: 7 });
  });
});

describe("clampOffset", () => {
  it("帯の内側では要求どおり動かす", () => {
    expect(clampOffset({ x: 120, y: 40 }, sticker, band)).toEqual({ x: 120, y: 40 });
  });

  it("左と上へはみ出す分を止める", () => {
    expect(clampOffset({ x: -500, y: -500 }, sticker, band)).toEqual({ x: -50, y: -50 });
  });

  it("右と下へはみ出す分を止める", () => {
    expect(clampOffset({ x: 5000, y: 5000 }, sticker, band)).toEqual({ x: 650, y: 150 });
  });

  it("帯より大きい軸は動かさない", () => {
    const oversized = { left: -20, top: 10, right: 900, bottom: 120 };
    expect(clampOffset({ x: 300, y: 30 }, oversized, band)).toEqual({ x: 0, y: 30 });
  });

  it("帯と同じ大きさなら 0 に固定される", () => {
    expect(clampOffset({ x: 40, y: 40 }, band, band)).toEqual({ x: 0, y: 0 });
  });
});

describe("isTap", () => {
  it("しきい値未満の移動はタップ", () => {
    expect(isTap({ x: 10, y: 10 }, { x: 13, y: 12 })).toBe(true);
  });

  it("しきい値以上の移動はドラッグ", () => {
    expect(isTap({ x: 10, y: 10 }, { x: 30, y: 10 })).toBe(false);
  });

  it("斜めの移動も距離で判定する", () => {
    // dx=5, dy=5 → 距離 7.07 なので既定しきい値 6 を超える
    expect(isTap({ x: 0, y: 0 }, { x: 5, y: 5 })).toBe(false);
  });
});

describe("baseBox", () => {
  it("表示中の矩形からオフセットを引いて掴む前の矩形を求める", () => {
    expect(baseBox({ left: 90, top: 30, right: 190, bottom: 130 }, { x: 40, y: -20 })).toEqual({
      left: 50,
      top: 50,
      right: 150,
      bottom: 150,
    });
  });

  it("未移動なら矩形はそのまま", () => {
    expect(baseBox(sticker, ORIGIN)).toEqual(sticker);
  });
});
