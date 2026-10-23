import { describe, expect, it } from "vitest";
import { clampOffset, coverBox, isTap, moveOffset, normalizeGrab, poseBox, spinFromGrab, stickerPoses } from "../src/lib/drag";

const band = { left: 0, top: 0, right: 800, bottom: 300 };
/** 紙の左上に置いた 100x100 のステッカー。 */
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
  it("紙の内側では要求どおり動かす", () => {
    expect(clampOffset({ x: 120, y: 40 }, sticker, band)).toEqual({ x: 120, y: 40 });
  });

  it("左と上へはみ出す分を止める", () => {
    expect(clampOffset({ x: -500, y: -500 }, sticker, band)).toEqual({ x: -50, y: -50 });
  });

  it("右と下へはみ出す分を止める", () => {
    expect(clampOffset({ x: 5000, y: 5000 }, sticker, band)).toEqual({ x: 650, y: 150 });
  });

  it("紙より大きい軸は動かさない", () => {
    const oversized = { left: -20, top: 10, right: 900, bottom: 120 };
    expect(clampOffset({ x: 300, y: 30 }, oversized, band)).toEqual({ x: 0, y: 30 });
  });

  it("紙と同じ大きさなら 0 に固定される", () => {
    expect(clampOffset({ x: 40, y: 40 }, band, band)).toEqual({ x: 0, y: 0 });
  });

  it("下辺を広げた紙では、フッター山のはみ出しを許す", () => {
    const page = { left: 0, top: 0, right: 800, bottom: 1000 };
    const hanging = { left: 50, top: 920, right: 150, bottom: 1020 };
    expect(clampOffset({ x: 0, y: 0 }, hanging, page)).toEqual({ x: 0, y: -20 });
    expect(clampOffset({ x: 0, y: 0 }, hanging, { ...page, bottom: 1080 })).toEqual({ x: 0, y: 0 });
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

describe("poseBox", () => {
  const center = { x: 100, y: 100 };
  const square = { width: 56, height: 56 };

  it("傾き 0・等倍なら寸法どおり", () => {
    expect(poseBox(center, square, { angle: 0, scale: 1, rise: 0 })).toEqual({ left: 72, top: 72, right: 128, bottom: 128 });
  });

  it("傾けると外接矩形が広がる", () => {
    const box = poseBox(center, square, { angle: 7, scale: 1, rise: 0 });
    const width = 56 * (Math.cos((7 * Math.PI) / 180) + Math.sin((7 * Math.PI) / 180));
    expect(box.right - box.left).toBeCloseTo(width, 6);
    expect(box.right - box.left).toBeGreaterThan(56 * 1.04);
  });

  it("拡大は中心から広げ、持ち上げは上へずらす", () => {
    expect(poseBox(center, square, { angle: 0, scale: 1.5, rise: 8 })).toEqual({ left: 58, top: 50, right: 142, bottom: 134 });
  });
});

describe("coverBox / stickerPoses", () => {
  const center = { x: 100, y: 100 };
  const square = { width: 56, height: 56 };

  it("ホバー（傾き 0・1.04 倍）だけで測ると、傾いて着地した姿勢がはみ出す（#60）", () => {
    const hover = poseBox(center, square, { angle: 0, scale: 1.04, rise: 8 });
    const rest = poseBox(center, square, { angle: 7, scale: 1, rise: 0 });
    expect(rest.right).toBeGreaterThan(hover.right);
    const covered = coverBox(center, square, stickerPoses(-7, 0, 0));
    expect(covered.right).toBeGreaterThanOrEqual(rest.right);
    expect(covered.left).toBeLessThanOrEqual(rest.left);
    expect(covered.top).toBeLessThanOrEqual(hover.top);
  });

  it("掴んでいる間の spin と拡大も覆う", () => {
    const held = poseBox(center, square, { angle: 14 - 7 * 0.4, scale: 1.06, rise: 4 });
    const covered = coverBox(center, square, stickerPoses(-7, 0, 14));
    expect(covered.right).toBeGreaterThanOrEqual(held.right);
    expect(covered.right).toBeGreaterThan(coverBox(center, square, stickerPoses(-7, 0, 0)).right);
  });

  it("呼吸の傾きの振れ幅を静止の傾きへ足す", () => {
    expect(coverBox(center, square, stickerPoses(4, 0.25, 0)).right).toBeGreaterThan(coverBox(center, square, stickerPoses(4, 0, 0)).right);
  });

  it("覆った矩形でクランプすると、着地後の姿勢は紙の右端を越えない", () => {
    const paper = { left: 0, top: 0, right: 393, bottom: 2000 };
    const box = coverBox(center, square, stickerPoses(-7, 0, 0));
    const offset = clampOffset({ x: 5000, y: 0 }, box, paper);
    const rest = poseBox(center, square, { angle: 7, scale: 1, rise: 0 });
    expect(rest.right + offset.x).toBeLessThanOrEqual(paper.right);
  });
});

describe("normalizeGrab", () => {
  const centered = { left: 0, top: 0, right: 100, bottom: 100 };

  it("中心を掴むと 0,0", () => {
    expect(normalizeGrab({ x: 50, y: 50 }, centered)).toEqual({ x: 0, y: 0 });
  });

  it("右端を掴むと x が 1 に近づく", () => {
    expect(normalizeGrab({ x: 100, y: 50 }, centered)).toEqual({ x: 1, y: 0 });
  });

  it("左端を掴むと x が -1 に近づく", () => {
    expect(normalizeGrab({ x: 0, y: 50 }, centered)).toEqual({ x: -1, y: 0 });
  });

  it("矩形の外を掴んでも -1〜1 にクランプされる", () => {
    expect(normalizeGrab({ x: 500, y: -500 }, centered)).toEqual({ x: 1, y: -1 });
  });
});

describe("spinFromGrab", () => {
  it("中心を掴んで動かしても回転しない", () => {
    expect(spinFromGrab({ x: 0, y: 0 }, { x: 200, y: 200 })).toBe(0);
  });

  it("下端を掴んで右へ引くと片方向に回る", () => {
    const spin = spinFromGrab({ x: 0, y: 1 }, { x: 100, y: 0 });
    expect(spin).toBeLessThan(0);
  });

  it("上端を掴んで同じ向きに引くと逆方向に回る", () => {
    const spin = spinFromGrab({ x: 0, y: -1 }, { x: 100, y: 0 });
    expect(spin).toBeGreaterThan(0);
  });

  it("端を掴むほど、中心を掴むより大きく回る（てこの原理）", () => {
    const edge = Math.abs(spinFromGrab({ x: 0, y: 1 }, { x: 100, y: 0 }));
    const nearCenter = Math.abs(spinFromGrab({ x: 0, y: 0.2 }, { x: 100, y: 0 }));
    expect(edge).toBeGreaterThan(nearCenter);
  });

  it("上限を超える回転量は max で頭打ちになる", () => {
    expect(spinFromGrab({ x: 0, y: 1 }, { x: 10000, y: 0 }, 0.06, 14)).toBe(-14);
  });
});
