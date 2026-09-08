"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { i18n, type Lang } from "./site-data";

const STORAGE_KEY = "applibrary_state";

export type Prefs = {
  theme: "light" | "dark";
  lang: Lang;
};

/**
 * 既定は light（紙面）。
 * layout / density / font / accent は UI から切り替えられない死んだ設定だったため削除した。
 * 旧い保存値に残っていても readStorage が DEFAULTS の形へ落とすので害はない。
 */
const DEFAULTS: Prefs = {
  theme: "light",
  lang: "ja",
};

/**
 * localStorage は React の外にある状態なので useSyncExternalStore で購読する。
 * サーバーでは DEFAULTS を返し、hydration 後に保存値へ切り替わる。
 * useEffect + setState では cascading render になり React 19 の lint にも反する。
 */
const listeners = new Set<() => void>();

/** getSnapshot は同一参照を返す必要があるためキャッシュする。 */
let snapshot: Prefs | null = null;

function readStorage(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Prefs>;
      return {
        theme: saved.theme === "dark" ? "dark" : "light",
        lang: saved.lang === "en" ? "en" : "ja",
      };
    }
  } catch {
    // localStorage が使えない環境では既定値で動かす。
  }
  return DEFAULTS;
}

function getSnapshot(): Prefs {
  snapshot ??= readStorage();
  return snapshot;
}

function getServerSnapshot(): Prefs {
  return DEFAULTS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** <html> の data-* 属性へ反映する。初回描画前の適用は layout.tsx のインラインスクリプトが担う。 */
function applyToDocument(prefs: Prefs) {
  const html = document.documentElement;
  html.lang = prefs.lang;
  html.setAttribute("data-theme", prefs.theme);
}

function writePrefs(patch: Partial<Prefs>) {
  const next = { ...getSnapshot(), ...patch };
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 保存できなくても操作自体は継続させる。
  }
  applyToDocument(next);
  for (const listener of listeners) listener();
}

type Ctx = {
  prefs: Prefs;
  setPrefs: (patch: Partial<Prefs>) => void;
  t: (typeof i18n)[Lang];
};

const SiteStateContext = createContext<Ctx | null>(null);

export function SiteStateProvider({ children }: { children: React.ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setPrefs = useCallback((patch: Partial<Prefs>) => writePrefs(patch), []);

  // 保存値が無い初回訪問では layout.tsx のインラインスクリプトが属性を付けないため、
  // ここで必ず既定値を <html> へ反映する。旧 main.js の init 時 applyState() と同じ役割。
  useEffect(() => {
    applyToDocument(prefs);
  }, [prefs]);
  const value = useMemo<Ctx>(() => ({ prefs, setPrefs, t: i18n[prefs.lang] }), [prefs, setPrefs]);

  return <SiteStateContext.Provider value={value}>{children}</SiteStateContext.Provider>;
}

export function useSiteState(): Ctx {
  const ctx = useContext(SiteStateContext);
  if (!ctx) throw new Error("useSiteState は SiteStateProvider の内側でのみ使える");
  return ctx;
}
