import type { Box } from "./drag";

export const STAGE_HANG = 96;

export function boxFromElement(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect();
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
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
