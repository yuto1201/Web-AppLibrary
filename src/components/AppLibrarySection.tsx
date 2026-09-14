"use client";

import { useState } from "react";
import type { ActivateSource } from "@/lib/activate";
import { AppsSection } from "./AppsSection";
import { Stickers } from "./Stickers";

/**
 * 一覧行とステッカー帯は slug を鍵に相互ハイライトする。共有状態は
 * この 2 つの兄弟だけのものなので、ページ全体を client にせずここへ閉じる。
 *
 * ホバーとフォーカスは別系統で持つ。1 本にまとめると、キーボードで行に
 * フォーカスした状態で別の要素にマウスを乗せて離れただけで、フォーカス由来の
 * ハイライトまで消えてしまう。
 */
export function AppLibrarySection() {
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [focusSlug, setFocusSlug] = useState<string | null>(null);
  const activeSlug = focusSlug ?? hoverSlug;

  function onActivate(slug: string | null, source: ActivateSource) {
    if (source === "hover") setHoverSlug(slug);
    else setFocusSlug(slug);
  }

  return (
    <>
      <AppsSection activeSlug={activeSlug} onActivate={onActivate} />
      <Stickers activeSlug={activeSlug} onActivate={onActivate} />
    </>
  );
}
