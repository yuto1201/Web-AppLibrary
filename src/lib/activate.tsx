"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * 一覧行とステッカーの相互ハイライトが、どちらの操作で発火したか。
 * ホバーとフォーカスを別系統にしないと、片方が離れたときにもう片方由来の
 * ハイライトまで消えてしまう。
 */
export type ActivateSource = "hover" | "focus";

type ActivateValue = {
  activeSlug: string | null;
  onActivate: (slug: string | null, source: ActivateSource) => void;
};

const ActivateContext = createContext<ActivateValue | null>(null);

/**
 * 一覧とシール山が DOM 上で離れるための、薄い共有状態。
 * page.tsx は Server Component のまま、この provider だけを client にする。
 */
export function ActivateProvider({ children }: { children: React.ReactNode }) {
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const [focusSlug, setFocusSlug] = useState<string | null>(null);
  const activeSlug = focusSlug ?? hoverSlug;

  const onActivate = useCallback((slug: string | null, source: ActivateSource) => {
    if (source === "hover") setHoverSlug(slug);
    else setFocusSlug(slug);
  }, []);

  const value = useMemo(() => ({ activeSlug, onActivate }), [activeSlug, onActivate]);

  return <ActivateContext.Provider value={value}>{children}</ActivateContext.Provider>;
}

export function useActivate(): ActivateValue {
  const value = useContext(ActivateContext);
  if (!value) {
    throw new Error("useActivate は ActivateProvider の中で使う");
  }
  return value;
}
