/**
 * ステッカーのドラッグ計算。DOM に触らない純粋関数だけを置く。
 * 実際のポインタ処理は src/components/VinylSticker.tsx が担う。
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
 * オフセットを紙（ステージ）の内側へ収める。
 * ステッカーが紙より大きい軸は 0 に固定する（動かすと必ずはみ出すため）。
 * 下方向のはみ出しは、呼び出し側が bounds.bottom を広げて許す。
 * 横スクロールを出さないための第一の防波堤（html の overflow-x: clip が第二）。
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

/** 寸法。transform を含まないレイアウト上の幅と高さ。 */
export type Size = { width: number; height: number };

/** 本体の 1 つの姿勢。回転（度）・拡大率・上への持ち上げ（px）。CSS の .sticker の transform と合わせる。 */
export type Pose = { angle: number; scale: number; rise: number };

/**
 * 中心と寸法から、その姿勢の外接矩形を求める（オフセットを足す前の位置）。
 * transform-origin は中央なので、回転と拡大は中心を動かさない。
 */
export function poseBox(center: Point, size: Size, pose: Pose): Box {
  const angle = (pose.angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  const halfW = ((size.width * cos + size.height * sin) * pose.scale) / 2;
  const halfH = ((size.width * sin + size.height * cos) * pose.scale) / 2;
  const y = center.y - pose.rise;
  return { left: center.x - halfW, top: y - halfH, right: center.x + halfW, bottom: y + halfH };
}

/** 複数の姿勢をすべて覆う矩形。 */
export function coverBox(center: Point, size: Size, poses: readonly Pose[]): Box {
  const boxes = poses.map((pose) => poseBox(center, size, pose));
  return {
    left: Math.min(...boxes.map((box) => box.left)),
    top: Math.min(...boxes.map((box) => box.top)),
    right: Math.max(...boxes.map((box) => box.right)),
    bottom: Math.max(...boxes.map((box) => box.bottom)),
  };
}

/**
 * 掴んでいる間と、離したあとに取りうる姿勢。standard.css の .sticker 系の規則と同じ値を持つ。
 * tilt は --tilt、sway はスロットの呼吸が足す傾きの振れ幅（--breathe-amp-r）、spin は掴み位置による上乗せ。
 *
 * 掴んだ瞬間の getBoundingClientRect は、ホバーの起き上がり（傾き 0・拡大）や
 * その transition の途中を写すだけで、離したあとの姿勢でも掴んでいる間の姿勢でもない。
 * それでクランプすると、離して傾きへ戻る途中に外接矩形が紙の端から数 px はみ出す。
 * 離した瞬間のレイアウトがその矩形を横スクロール幅として記録し、transform の transition だけでは
 * 測り直されないため、横スクロールが残る（#60）。姿勢ごとの矩形を足し合わせてクランプする。
 */
export function stickerPoses(tilt: number, sway: number, spin: number): Pose[] {
  const rest = Math.abs(tilt) + Math.abs(sway);
  return [
    // 静止（.sticker）と一覧行からの連動（.is-linked: 傾いたまま 6px 持ち上げ）。
    { angle: rest, scale: 1, rise: 0 },
    { angle: rest, scale: 1, rise: 6 },
    // ホバー（傾き 0・1.04 倍・8px 持ち上げ）。離したあと指やポインタが残る間の姿勢。
    { angle: Math.abs(sway), scale: 1.04, rise: 8 },
    // 掴んでいる間（.is-held: 傾き 0.4 倍 + spin・1.06 倍・4px 持ち上げ）。離した瞬間の transition の始点。
    { angle: Math.abs(tilt * 0.4 + spin) + Math.abs(sway), scale: 1.06, rise: 4 },
  ];
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
