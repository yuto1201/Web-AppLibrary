/**
 * ステッカーのドラッグ計算。DOM に触らない純粋関数だけを置く。
 * 実際のポインタ処理は src/components/Stickers.tsx が担う。
 */

export type Point = { x: number; y: number };

/** 画面座標の矩形。DOMRect の必要な 4 辺だけを受け取る。 */
export type Box = { left: number; top: number; right: number; bottom: number };

export const ORIGIN: Point = { x: 0, y: 0 };

/** ポインタの移動量を、掴んだ時点のオフセットへ足す。 */
export function moveOffset(base: Point, start: Point, current: Point): Point {
  return { x: base.x + current.x - start.x, y: base.y + current.y - start.y };
}

/**
 * オフセットを帯の内側へ収める。
 * ステッカーが帯より大きい軸は 0 に固定する（動かすと必ずはみ出すため）。
 * これが横スクロールを発生させないための唯一の防波堤。
 */
export function clampOffset(offset: Point, rect: Box, bounds: Box): Point {
  return {
    x: clampAxis(offset.x, bounds.left - rect.left, bounds.right - rect.right),
    y: clampAxis(offset.y, bounds.top - rect.top, bounds.bottom - rect.bottom),
  };
}

function clampAxis(value: number, min: number, max: number): number {
  if (min > max) return 0;
  return Math.min(Math.max(value, min), max);
}

/**
 * 掴んだ位置からほとんど動いていなければ「タップ」と見なす。
 * ドラッグと、個別ページへの遷移を区別するために使う。
 */
export function isTap(start: Point, current: Point, threshold = 6): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) < threshold;
}

/** 掴んだ時点の矩形。表示中の矩形から現在のオフセットを引いて求める。 */
export function baseBox(rect: Box, offset: Point): Box {
  return {
    left: rect.left - offset.x,
    top: rect.top - offset.y,
    right: rect.right - offset.x,
    bottom: rect.bottom - offset.y,
  };
}

/**
 * 矩形の中心から見た、掴んだ点の位置を -1〜1 に正規化する。
 * 端に近いほど 1 に近づく。てこの原理で回転量を変えるための材料。
 */
export function normalizeGrab(point: Point, rect: Box): Point {
  const halfW = (rect.right - rect.left) / 2 || 1;
  const halfH = (rect.bottom - rect.top) / 2 || 1;
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;
  return {
    x: clampAxis((point.x - centerX) / halfW, -1, 1),
    y: clampAxis((point.y - centerY) / halfH, -1, 1),
  };
}

/**
 * 掴んだ位置に応じた回転量（度）。中心から離れた点を掴んで横へ引くほど、
 * てこの原理で大きく回って見えるようにする。
 * grab は normalizeGrab の結果、delta は掴んでから今までの移動量（px）。
 */
export function spinFromGrab(grab: Point, delta: Point, gain = 0.06, max = 14): number {
  const torque = grab.x * delta.y - grab.y * delta.x;
  return Math.max(-max, Math.min(max, torque * gain));
}
