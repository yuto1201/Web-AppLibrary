"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ActivateSource } from "@/lib/activate";
import {
  clampOffset,
  isTap,
  moveOffset,
  coverBox,
  normalizeGrab,
  spinFromGrab,
  stickerPoses,
  type Box,
  type Point,
  type Size,
} from "@/lib/drag";
import { boxFromElement, layoutCenter } from "@/lib/sticker-bounds";
import type { StickerShape } from "@/lib/sticker-desk";

export type VinylStickerProps = {
  offset: Point;
  tilt: number;
  lift: number;
  layer: number;
  held: boolean;
  linked: boolean;
  resetToken: number;
  order?: number;
  deskKey: string;
  shape: StickerShape | "word";
  stamp?: "α" | "β" | null;
  caption?: string;
  href?: string;
  slug?: string;
  label?: string;
  boundsFrom: (el: HTMLElement) => Box | null;
  onGrab: () => void;
  onMove: (offset: Point) => void;
  onRelease: () => void;
  onActivate: (slug: string | null, source: ActivateSource) => void;
  children: React.ReactNode;
};

type Drag = {
  pointerId: number;
  start: Point;
  /** 掴んだ時点のオフセット。move ごとにここへ移動量を足す（現在値へ足すと二重加算になる）。 */
  baseOffset: Point;
  /** 中心から見た掴み位置（-1〜1）。端を掴むほど、引いたときの回転が大きくなる。 */
  grab: Point;
  /** transform を含まない、オフセット 0 のときの中心と寸法。姿勢ごとの外接矩形の材料。 */
  center: Point;
  size: Size;
  /** スロットの呼吸が足す傾きの振れ幅（度）。 */
  sway: number;
  bounds: Box;
};

/**
 * 掴んで動かせるビニール。offset・held・linked は親が持つ。
 * 回転の上乗せ (spin) はドラッグ中だけの見た目で、離せば 0 へ戻る。
 * stamp は alpha / beta の印。caption は鉛筆メモ（飾りには渡さない）。
 */
export function VinylSticker({
  offset,
  tilt,
  lift,
  layer,
  held,
  linked,
  resetToken,
  order = 1,
  deskKey,
  shape,
  stamp,
  caption,
  href,
  slug,
  label,
  boundsFrom,
  onGrab,
  onMove,
  onRelease,
  onActivate,
  children,
}: VinylStickerProps) {
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const [spin, setSpin] = useState(0);

  const style = {
    "--dx": `${offset.x}px`,
    "--dy": `${offset.y}px`,
    "--tilt": `${tilt}deg`,
    "--lift": `${lift}px`,
    "--spin": `${spin}deg`,
  } as React.CSSProperties;

  const slotStyle = {
    "--layer": layer,
    "--settle-order": order,
  } as React.CSSProperties;

  const resetTokenRef = useRef(resetToken);
  useEffect(() => {
    if (resetToken === resetTokenRef.current) return;
    resetTokenRef.current = resetToken;
    if (!drag.current) return;
    drag.current = null;
    // リサイズでドラッグを中断しても、直後の click をリンク遷移として扱わない。
    setSpin(0);
  }, [resetToken]);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (drag.current) return;
    const el = event.currentTarget;
    const bounds = boundsFrom(el);
    if (!bounds) return;

    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      baseOffset: offset,
      grab: normalizeGrab({ x: event.clientX, y: event.clientY }, boxFromElement(el)),
      // クランプは掴んだ瞬間の矩形ではなく、姿勢の外接矩形で測る。掴んだ瞬間はホバーの transition 次第で揺れる（#60）。
      center: withLift(layoutCenter(el), lift),
      size: { width: el.offsetWidth, height: el.offsetHeight },
      sway: breatheSway(el),
      bounds,
    };
    dragged.current = false;
    setSpin(0);
    el.setPointerCapture(event.pointerId);
    onGrab();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const current = { x: event.clientX, y: event.clientY };
    if (!isTap(active.start, current)) dragged.current = true;
    const nextSpin = spinFromGrab(active.grab, { x: current.x - active.start.x, y: current.y - active.start.y });
    // 掴んでいる姿勢も離したあとの姿勢も紙の内側へ収める。離した瞬間のレイアウトが横幅を記録しても、はみ出しが無い。
    const box = coverBox(active.center, active.size, stickerPoses(tilt, active.sway, nextSpin));
    onMove(clampOffset(moveOffset(active.baseOffset, active.start, current), box, active.bounds));
    setSpin(nextSpin);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setSpin(0);
    onRelease();
  }

  function handlePointerCancel(event: React.PointerEvent<HTMLElement>) {
    if (drag.current && drag.current.pointerId !== event.pointerId) return;
    handlePointerUp(event);
    // cancel のあとに click は来ない。フラグを残すと次の Enter / AT click まで遷移を止める。
    dragged.current = false;
  }

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onLostPointerCapture: handlePointerUp,
    onClick: (event: React.MouseEvent) => {
      // キーボードや支援技術の click は、直前に mouseup がなくても有効にする。
      if (event.detail === 0) {
        dragged.current = false;
        return;
      }
      if (!dragged.current) return;
      event.preventDefault();
      dragged.current = false;
    },
    onMouseEnter: () => onActivate(slug ?? null, "hover"),
    onFocus: () => onActivate(slug ?? null, "focus"),
    onMouseLeave: () => onActivate(null, "hover"),
    onBlur: () => onActivate(null, "focus"),
    className: `sticker${held ? " is-held" : ""}${linked ? " is-linked" : ""}`,
    "data-shape": shape,
    style,
  };

  return (
    <span className="sticker-slot" style={slotStyle} data-key={deskKey} data-shape={shape}>
      {held && <span className="sticker-ghost" aria-hidden="true" />}
      {href ? (
        <Link {...handlers} href={href} aria-label={label} draggable={false}>
          {children}
          {stamp ? <span className="sticker-stamp" data-mark={stamp} aria-hidden="true" /> : null}
          {caption ? <span className="sticker-caption" lang="ja">{caption}</span> : null}
        </Link>
      ) : (
        <span {...handlers} aria-hidden="true">
          {children}
          {stamp ? <span className="sticker-stamp" data-mark={stamp} aria-hidden="true" /> : null}
          {caption ? <span className="sticker-caption" lang="ja">{caption}</span> : null}
        </span>
      )}
    </span>
  );
}

/** スロットの呼吸が足す傾きの振れ幅（度）。呼吸しないスロットは 0。 */
function breatheSway(el: HTMLElement): number {
  const slot = el.closest(".sticker-slot");
  if (!(slot instanceof HTMLElement)) return 0;
  const value = Number.parseFloat(getComputedStyle(slot).getPropertyValue("--breathe-amp-r"));
  return Number.isFinite(value) ? value : 0;
}

/** 静止姿勢の --lift は本体の translateY に足される。 */
function withLift(center: Point, lift: number): Point {
  return { x: center.x, y: center.y + lift };
}
