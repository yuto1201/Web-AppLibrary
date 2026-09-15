"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getApp } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import { useActivate } from "@/lib/activate";
import { ORIGIN, type Point } from "@/lib/drag";
import { paperBounds } from "@/lib/sticker-bounds";
import { DESK_ITEMS, statusStamp } from "@/lib/sticker-desk";
import { VinylSticker } from "@/components/VinylSticker";

/** 傾きと持ち上げ量。散らした配置が機械的に見えないように 1 枚ずつ変える。 */
const TILT = [-7, 4, -3, 9, -5] as const;
const LIFT = [0, -26, -8, -38, -16] as const;

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
    const appsHead = document.querySelector("#apps .section-head") ?? document.getElementById("apps");
    if (!(poster instanceof HTMLElement) || !(appsHead instanceof HTMLElement)) return;
    const sync = () => {
      const top = appsHead.getBoundingClientRect().top - poster.getBoundingClientRect().top;
      poster.style.setProperty("--desk-apps-top", `${Math.round(top)}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(poster);
    observer.observe(appsHead);
    return () => observer.disconnect();
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
              lift={LIFT[index % LIFT.length]!}
              layer={layers[deskKey] ?? index + 1}
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
