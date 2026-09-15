"use client";

import { useEffect, useState } from "react";
import type { App } from "@/data/schema";
import { deskApp, statusStamp } from "@/lib/sticker-desk";
import { ORIGIN, type Point } from "@/lib/drag";
import { shellBounds } from "@/lib/sticker-bounds";
import { VinylSticker } from "@/components/VinylSticker";

export function SpecimenSticker({ app }: { app: App }) {
  const desk = deskApp(app.slug);
  const [offset, setOffset] = useState<Point>(ORIGIN);
  const [held, setHeld] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    const onResize = () => {
      setOffset(ORIGIN);
      setHeld(false);
      setResetToken((token) => token + 1);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="specimen-slot" aria-hidden="true">
      <VinylSticker
        deskKey={`specimen-${app.slug}`}
        shape={desk.shape}
        stamp={statusStamp(app.status)}
        offset={offset}
        tilt={-6}
        lift={0}
        layer={1}
        held={held}
        linked={false}
        resetToken={resetToken}
        boundsFrom={shellBounds}
        href={undefined}
        slug={undefined}
        label={undefined}
        onGrab={() => setHeld(true)}
        onMove={setOffset}
        onRelease={() => setHeld(false)}
        onActivate={() => {}}
      >
        {/* 静的出力のため素の img を使う。 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/${app.icon}`} alt="" draggable={false} />
      </VinylSticker>
    </div>
  );
}
