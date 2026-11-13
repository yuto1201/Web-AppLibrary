"use client";

// 試作（spike）: フッターの後ろに canvas を敷き、見えそうになったら three.js と cannon-es を読み込む。
import { useEffect, useRef, type ReactNode } from "react";
import type { Pile } from "@/lib/falling-pile";

export function FallingFooter({ children }: { children: ReactNode }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const canvas = canvasRef.current;
    if (!zone || !canvas) return;
    let pile: Pile | null = null;
    let cancelled = false;
    // 重い 2 つのライブラリは、フッターが近づいてから読む
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        import("@/lib/falling-pile").then(({ createPile }) => {
          if (!cancelled) pile = createPile(canvas, zone);
        });
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(zone);
    return () => {
      cancelled = true;
      io.disconnect();
      pile?.destroy();
    };
  }, []);

  return (
    <div ref={zoneRef} className="fall-zone">
      <canvas ref={canvasRef} className="fall-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
