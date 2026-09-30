"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getApp } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import { useActivate } from "@/lib/activate";
import { ORIGIN, type Point } from "@/lib/drag";
import { paperBounds } from "@/lib/sticker-bounds";
import { DESK_ITEMS, statusStamp } from "@/lib/sticker-desk";
import { VinylSticker } from "@/components/VinylSticker";

/** 遊び場に並べたシールの傾きを、1 枚ずつ変える。 */
const TILT = [-7, 4, -3, 9, -5] as const;

export function Stickers() {
  const { activeSlug, onActivate } = useActivate();
  const { t } = useSiteState();
  const [offsets, setOffsets] = useState<Record<string, Point>>({});
  const [held, setHeld] = useState<ReadonlySet<string>>(() => new Set());
  const [resetToken, setResetToken] = useState(0);
  const layerSeq = useRef(0);
  const [layers, setLayers] = useState<Record<string, number>>({});

  const items = DESK_ITEMS.map((item) => {
    if (item.kind === "app") {
      const app = getApp(item.slug)!;
      return {
        desk: item,
        href: `/apps/${app.slug}/`,
        slug: app.slug,
        label: app.name,
        caption: app.stickerNote,
        stamp: statusStamp(app.status),
        body: app.icon ? (
          // 静的出力のため素の img を使う。next/image の最適化は使わない。
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/apps/${app.slug}/${app.icon}`} alt="" draggable={false} loading="lazy" />
        ) : (
          <span className="sticker-note">{app.iconGlyph}</span>
        ),
      };
    }
    return {
      desk: item,
      href: undefined,
      slug: undefined,
      label: undefined,
      caption: undefined,
      stamp: null,
      body: <span className="sticker-note">{item.word}</span>,
    };
  });

  const moved = Object.keys(offsets).length > 0;

  useLayoutEffect(() => {
    const poster = document.querySelector(".poster");
    if (!(poster instanceof HTMLElement)) return;
    const playground = poster.querySelector(".hero-playground");
    const hero = poster.querySelector(".hero");
    if (!(playground instanceof HTMLElement)) return;
    const sync = () => {
      const origin = poster.getBoundingClientRect();
      const box = playground.getBoundingClientRect();
      // 初期配置だけを Hero の予約領域へ寄せる。ドラッグの範囲は引き続き poster 全体。
      poster.style.setProperty("--desk-play-left", `${Math.round(box.left - origin.left)}px`);
      poster.style.setProperty("--desk-play-top", `${Math.round(box.top - origin.top)}px`);
      poster.style.setProperty("--desk-play-width", `${Math.round(box.width)}px`);
      poster.style.setProperty("--desk-play-height", `${Math.round(box.height)}px`);
      poster.setAttribute("data-desk", "ready");
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(poster);
    observer.observe(playground);
    if (hero instanceof HTMLElement) observer.observe(hero);
    const mutations = new MutationObserver(sync);
    mutations.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    if (hero instanceof HTMLElement) {
      mutations.observe(hero, { childList: true, subtree: true, characterData: true });
    }
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

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

      <p className="stickers-foot">
        <span className="stickers-hint">{t.stickers_hint}</span>
        <button className="sticker-reset" type="button" hidden={!moved} onClick={() => setOffsets({})}>
          {t.stickers_reset}
        </button>
      </p>

      <div className="sticker-stage">
        {items.map((item, index) => {
          const deskKey = item.desk.key;
          return (
            <VinylSticker
              key={deskKey}
              deskKey={deskKey}
              shape={item.desk.kind === "app" ? item.desk.shape : "word"}
              href={item.href}
              slug={item.slug}
              label={item.label}
              caption={item.caption}
              stamp={item.stamp}
              tilt={TILT[index % TILT.length]!}
              lift={0}
              layer={layers[deskKey] ?? index + 1}
              order={index + 1}
              offset={offsets[deskKey] ?? ORIGIN}
              held={held.has(deskKey)}
              linked={item.slug !== undefined && item.slug === activeSlug}
              resetToken={resetToken}
              boundsFrom={paperBounds}
              onGrab={() => {
                layerSeq.current = Math.max(layerSeq.current, items.length) + 1;
                setLayers((current) => ({ ...current, [deskKey]: layerSeq.current }));
                setHeld((current) => {
                  const next = new Set(current);
                  next.add(deskKey);
                  return next;
                });
              }}
              onMove={(offset) => setOffsets((current) => ({ ...current, [deskKey]: offset }))}
              onRelease={() =>
                setHeld((current) => {
                  if (!current.has(deskKey)) return current;
                  const next = new Set(current);
                  next.delete(deskKey);
                  return next;
                })
              }
              onActivate={onActivate}
            >
              {item.body}
            </VinylSticker>
          );
        })}
      </div>
    </section>
  );
}
