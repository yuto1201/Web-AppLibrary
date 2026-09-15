"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ActivateSource } from "@/lib/activate";
import {
  baseBox,
  clampOffset,
  isTap,
  moveOffset,
  normalizeGrab,
  spinFromGrab,
  type Box,
  type Point,
} from "@/lib/drag";
import { boxFromElement } from "@/lib/sticker-bounds";
import type { StickerShape } from "@/lib/sticker-desk";

export type VinylStickerProps = {
  offset: Point;
  tilt: number;
  lift: number;
  layer: number;
  held: boolean;
  linked: boolean;
  resetToken: number;
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
  base: Box;
  bounds: Box;
};

/**
 * 掴んで動かせるビニール。offset・held・linked は親が持つ。
 * 回転の上乗せ (spin) はドラッグ中だけの見た目で、離せば 0 へ戻る。
 * stamp / caption は型だけ先に受け取り、見た目は後続タスクで載せる。
 */
export function VinylSticker({
  offset,
  tilt,
  lift,
  layer,
  held,
  linked,
  resetToken,
  deskKey,
  shape,
  stamp,
  caption: _caption,
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
  void _caption;
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
  } as React.CSSProperties;

  const resetTokenRef = useRef(resetToken);
  useEffect(() => {
    if (resetToken === resetTokenRef.current) return;
    resetTokenRef.current = resetToken;
    if (!drag.current) return;
    drag.current = null;
    dragged.current = false;
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
      base: baseBox(boxFromElement(el), offset),
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
    onMove(clampOffset(moveOffset(active.baseOffset, active.start, current), active.base, active.bounds));
    setSpin(spinFromGrab(active.grab, { x: current.x - active.start.x, y: current.y - active.start.y }));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setSpin(0);
    onRelease();
  }

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerUp,
    onLostPointerCapture: handlePointerUp,
    onClick: (event: React.MouseEvent) => {
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
          {stamp ? <span className="sticker-stamp" aria-hidden="true">{stamp}</span> : null}
        </Link>
      ) : (
        <span {...handlers} aria-hidden="true">
          {children}
          {stamp ? <span className="sticker-stamp" aria-hidden="true">{stamp}</span> : null}
        </span>
      )}
    </span>
  );
}
