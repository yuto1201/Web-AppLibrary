export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function stepIndex(index: number, delta: number, length: number): number {
  return wrapIndex(index + delta, length);
}

export function screenshotSrc(slug: string, file: string): string {
  return `/apps/${slug}/screenshots/${file}`;
}

export function screenshotAlt(name: string, index: number): string {
  return `${name} スクリーンショット ${index + 1}`;
}
