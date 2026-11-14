"use client";

// フッターの後ろに canvas を敷き、近づいたら three.js と cannon-es を読み込んでアイコンの板を積もらせる。
// 状態（読み込み済み・失敗・動きの有無）は React の state から data 属性で出す。DOM へは直接書かない。
import { useEffect, useRef, useState, type ReactNode } from "react";
import { apps } from "@/data/registry";
import type { Pile, PileItem } from "@/lib/falling-pile";

const items: PileItem[] = apps.map((app) => ({ color: app.accent, icon: `/apps/${app.slug}/${app.icon}` }));

export function FallingFooter({ children }: { children: ReactNode }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pileState, setPileState] = useState<"idle" | "ready" | "off">("idle");
  const [motion, setMotion] = useState<"still" | "move" | undefined>(undefined);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotion(mq.matches ? "still" : "move");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
        import("@/lib/falling-pile")
          .then(({ createPile }) => {
            if (cancelled) return;
            pile = createPile(canvas, zone, items);
            setPileState("ready");
          })
          .catch(() => {
            if (!cancelled) setPileState("off");
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
    <div
      ref={zoneRef}
      className="fall-zone"
      data-pile={pileState === "idle" ? undefined : pileState}
      data-pile-motion={motion}
    >
      <canvas ref={canvasRef} className="fall-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}
