import type { Box, Point } from "./drag";

export const STAGE_HANG = 96;

export function boxFromElement(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect();
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

/**
 * ステッカー本体の transform（オフセット・傾き・ホバー）を含まない、紙の上の中心。
 * 本体はスロットいっぱいに描かれるので、スロットの中心を使う。
 * スロットの呼吸（translateY / rotate）は中心をほとんど動かさない。
 */
export function layoutCenter(el: HTMLElement): Point {
  const slot = el.closest(".sticker-slot");
  const rect = (slot instanceof HTMLElement ? slot : el).getBoundingClientRect();
  return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
}

export function paperBounds(el: HTMLElement): Box | null {
  const poster = el.closest(".poster");
  if (!(poster instanceof HTMLElement)) return null;
  const box = boxFromElement(poster);
  return { ...box, bottom: box.bottom + STAGE_HANG };
}

export function shellBounds(el: HTMLElement): Box | null {
  const shell = el.closest(".app-shell");
  if (!(shell instanceof HTMLElement)) return null;
  return boxFromElement(shell);
}
