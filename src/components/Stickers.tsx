"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { apps } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import {
  baseBox,
  clampOffset,
  isTap,
  moveOffset,
  normalizeGrab,
  ORIGIN,
  spinFromGrab,
  type Box,
  type Point,
} from "@/lib/drag";
import type { ActivateSource } from "@/lib/activate";

/** 傾きと持ち上げ量。並びが機械的に見えないように 1 枚ずつ変える。 */
const TILT = [-7, 4, -3, 9, -5] as const;
const LIFT = [0, -26, -8, -38, -16] as const;

/** アプリ以外の飾りステッカー。装飾なので支援技術からは隠す。 */
const NOTES = ["Swift", "Tokyo"] as const;

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

function toBox(rect: DOMRect): Box {
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

/**
 * 掴んで動かせるステッカー。
 *
 * offset・held・linked の判定は親が持つ。回転の上乗せ (spin) だけは
 * ドラッグ中だけの見た目で、離せば 0 へ戻るのでこのコンポーネント内に閉じる。
 * リンクとして描くので、キーボードでは通常のリンクとして遷移できる。
 * ほとんど動かさずに離したときだけクリックを通す。
 */
function Sticker({
  offset,
  tilt,
  lift,
  accent,
  held,
  linked,
  resetToken,
  onGrab,
  onMove,
  onRelease,
  onActivate,
  href,
  slug,
  label,
  children,
}: {
  offset: Point;
  tilt: number;
  lift: number;
  accent?: string;
  held: boolean;
  linked: boolean;
  /** 値が変わるたびに、進行中のドラッグを強制的に終わらせる（例: 画面リサイズ）。 */
  resetToken: number;
  onGrab: () => void;
  onMove: (offset: Point) => void;
  onRelease: () => void;
  onActivate: (slug: string | null, source: ActivateSource) => void;
  href?: string;
  slug?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const [spin, setSpin] = useState(0);

  const style = {
    "--dx": `${offset.x}px`,
    "--dy": `${offset.y}px`,
    "--tilt": `${tilt}deg`,
    "--lift": `${lift}px`,
    "--spin": `${spin}deg`,
    ...(accent ? { "--sticker-accent": accent } : {}),
  } as React.CSSProperties;

  // リサイズ後は帯の矩形でクランプした値が保証できないため、進行中のドラッグを
  // 強制終了する。何もしないと、次の move で古い base/bounds を使ってしまう。
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
    // 同じステッカーを 2 本目の指で掴んでも、1 本目の掴み位置を上書きしない。
    if (drag.current) return;
    const el = event.currentTarget;
    const band = el.parentElement?.parentElement;
    if (!band) return;

    drag.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      baseOffset: offset,
      grab: normalizeGrab({ x: event.clientX, y: event.clientY }, toBox(el.getBoundingClientRect())),
      base: baseBox(toBox(el.getBoundingClientRect()), offset),
      bounds: toBox(band.getBoundingClientRect()),
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
    // ブラウザ側の事情で capture だけ失われた場合の保険。cancel/up と同じ後始末をする。
    onLostPointerCapture: handlePointerUp,
    // ドラッグの終わりに起きるクリックは遷移させない。
    // フラグはここで消費して戻す。戻さないと、以降のキーボード Enter や
    // 支援技術からの click（pointerdown を伴わない）まで抑止し続けてしまう。
    onClick: (event: React.MouseEvent) => {
      if (!dragged.current) return;
      event.preventDefault();
      dragged.current = false;
    },
    // 一覧行との相互ハイライト。ホバーとフォーカスは別系統として親へ伝える
    // （どちらかが離れても、もう片方由来のハイライトを消さないため）。
    onMouseEnter: () => onActivate(slug ?? null, "hover"),
    onFocus: () => onActivate(slug ?? null, "focus"),
    onMouseLeave: () => onActivate(null, "hover"),
    onBlur: () => onActivate(null, "focus"),
    className: `sticker${held ? " is-held" : ""}${linked ? " is-linked" : ""}`,
    style,
  };

  return (
    <span className="sticker-slot">
      {/* 掴んでいる間、元の位置に残る跡。ステッカー自身は transform で動くが、
          このスロットは通常のフローに留まるため inset:0 で正確に重なる。 */}
      {held && <span className="sticker-ghost" aria-hidden="true" />}
      {href ? (
        <Link {...handlers} href={href} aria-label={label} draggable={false}>
          {children}
        </Link>
      ) : (
        <span {...handlers} aria-hidden="true">
          {children}
        </span>
      )}
    </span>
  );
}

export function Stickers({
  activeSlug,
  onActivate,
}: {
  /** 一覧行から連動させる slug。null なら誰も連動していない。 */
  activeSlug: string | null;
  onActivate: (slug: string | null, source: ActivateSource) => void;
}) {
  const { t } = useSiteState();
  const [offsets, setOffsets] = useState<Record<string, Point>>({});
  // 複数指で別々のステッカーを同時に掴める Set。1 本しか使わない大半の操作でも
  // 型はそのまま Set で通す方が「2 枚同時に掴むと片方の表示が消える」を防げる。
  const [held, setHeld] = useState<ReadonlySet<string>>(() => new Set());
  const [resetToken, setResetToken] = useState(0);

  const items = [
    ...apps.map((app) => ({
      key: app.slug,
      slug: app.slug as string | undefined,
      href: `/apps/${app.slug}/` as string | undefined,
      label: app.name as string | undefined,
      accent: app.accent as string | undefined,
      body: (
        <>
          {/* 静的出力のため素の img を使う。next/image の最適化は使わない。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/apps/${app.slug}/${app.icon}`} alt="" draggable={false} loading="lazy" />
          <span className="sticker-name">{app.name}</span>
        </>
      ),
    })),
    ...NOTES.map((note) => ({
      key: `note-${note}`,
      slug: undefined,
      href: undefined,
      label: undefined,
      accent: undefined,
      body: <span className="sticker-note">{note}</span>,
    })),
  ];

  const moved = Object.keys(offsets).length > 0;

  // 掴んだ時点の帯の矩形でクランプしているため、リサイズ後の位置は保証できない。
  // 古い座標のまま帯の外へ残るより、並びを戻すほうが素直。
  // resetToken を進めて、進行中のドラッグがあれば各 Sticker 側でも強制終了させる。
  useEffect(() => {
    const onResize = () => {
      setOffsets({});
      setHeld(new Set());
      setResetToken((token) => token + 1);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section className="stickers" aria-labelledby="stickers-title">
      <h2 className="visually-hidden" id="stickers-title">{t.stickers_title}</h2>

      <div className="sticker-band">
        {items.map((item, index) => (
          <Sticker
            key={item.key}
            href={item.href}
            slug={item.slug}
            label={item.label}
            accent={item.accent}
            tilt={TILT[index % TILT.length]!}
            lift={LIFT[index % LIFT.length]!}
            offset={offsets[item.key] ?? ORIGIN}
            held={held.has(item.key)}
            linked={item.slug !== undefined && item.slug === activeSlug}
            resetToken={resetToken}
            onGrab={() =>
              setHeld((current) => {
                const next = new Set(current);
                next.add(item.key);
                return next;
              })
            }
            onMove={(offset) => setOffsets((current) => ({ ...current, [item.key]: offset }))}
            onRelease={() =>
              setHeld((current) => {
                if (!current.has(item.key)) return current;
                const next = new Set(current);
                next.delete(item.key);
                return next;
              })
            }
            onActivate={onActivate}
          >
            {item.body}
          </Sticker>
        ))}
      </div>

      <p className="stickers-foot">
        <span className="stickers-hint">{t.stickers_hint}</span>
        <button className="sticker-reset" type="button" hidden={!moved} onClick={() => setOffsets({})}>
          {t.stickers_reset}
        </button>
      </p>
    </section>
  );
}
