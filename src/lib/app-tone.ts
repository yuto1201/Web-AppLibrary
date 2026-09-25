/**
 * 詳細ページだけの色味。値はアイコンの color / accent を紙の上で読めるところまで寄せたもの。
 * CSS の同じ hex とテストが対応する。
 */
export const APP_PAGE_TONE = {
  sublog: { tone: "ledger", wash: "#f3eef8", ink: "#6B5B8E", darkInk: "#cbbbe0" },
  caflog: { tone: "cafe", wash: "#f6efe4", ink: "#8B5E3C", darkInk: "#e4c4a4" },
  "dev-tools": { tone: "bench", wash: "#eef3f6", ink: "#2A657F", darkInk: "#8ec5d8" },
  "pay-cycle": { tone: "cycle", wash: "#f8efe8", ink: "#B5362C", darkInk: "#ff9a90" },
} as const;

export type AppTone = (typeof APP_PAGE_TONE)[keyof typeof APP_PAGE_TONE]["tone"];

export function appPageTone(slug: string) {
  if (!Object.hasOwn(APP_PAGE_TONE, slug)) return undefined;
  return APP_PAGE_TONE[slug as keyof typeof APP_PAGE_TONE];
}

export function appTone(slug: string): AppTone | undefined {
  return appPageTone(slug)?.tone;
}
