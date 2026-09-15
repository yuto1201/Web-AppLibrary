import { apps } from "@/data/registry";
import type { App } from "@/data/schema";

export type StickerShape = "round-rect" | "circle" | "squircle" | "round-lg";
export type DeskAnchor = "hero" | "apps" | "pile";

export type DeskAppItem = {
  key: string;
  kind: "app";
  slug: string;
  shape: StickerShape;
  anchor: DeskAnchor;
};

export type DeskWordItem = {
  key: string;
  kind: "word";
  word: string;
  anchor: DeskAnchor;
};

export type DeskItem = DeskAppItem | DeskWordItem;

const APP_DESK: Record<string, Pick<DeskAppItem, "shape" | "anchor">> = {
  // 各 key に src/styles/standard.css の `.sticker-slot[data-key="…"]` が必要。
  // 無いとデフォルトの右下の山へ落ちる。anchor はカタログ上の役割で、位置は CSS が持つ。
  sublog: { shape: "round-rect", anchor: "hero" },
  caflog: { shape: "circle", anchor: "hero" },
  "dev-tools": { shape: "squircle", anchor: "apps" },
  "pay-cycle": { shape: "round-lg", anchor: "pile" },
};

const WORDS: DeskWordItem[] = [
  { key: "note-Swift", kind: "word", word: "Swift", anchor: "pile" },
  { key: "note-Tokyo", kind: "word", word: "Tokyo", anchor: "hero" },
  { key: "note-solo", kind: "word", word: "一人制作", anchor: "pile" },
];

export const DESK_ITEMS: readonly DeskItem[] = [
  ...apps.map((app) => {
    const desk = APP_DESK[app.slug];
    if (!desk) throw new Error(`机の配置が無い slug: ${app.slug}`);
    return { key: app.slug, kind: "app" as const, slug: app.slug, ...desk };
  }),
  ...WORDS,
];

export function deskApp(slug: string): DeskAppItem {
  const item = DESK_ITEMS.find((entry): entry is DeskAppItem => entry.kind === "app" && entry.slug === slug);
  if (!item) throw new Error(`机に無い slug: ${slug}`);
  return item;
}

export function statusStamp(status: App["status"]): "α" | "β" | null {
  if (status === "alpha") return "α";
  if (status === "beta") return "β";
  return null;
}
