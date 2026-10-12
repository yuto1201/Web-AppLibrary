/**
 * 花島（Flower Island: Living Sky）の紹介ページで見せる空の時間帯。
 * 区切りはアプリの空のキーフレーム（iOS-Flower `SkyProfile.swift` の 5・8・17・20 時）に合わせる。
 * 色はページ用のイメージで、アプリの描画色そのものではない。
 */
export const SKY_PHASES = ["morning", "day", "dusk", "night"] as const;
export type SkyPhase = (typeof SKY_PHASES)[number];

/** 時間帯を選んだときに時計へ出す、それらしい時刻。 */
export const SKY_PRESETS: Readonly<Record<SkyPhase, { label: string; clock: string }>> = {
  morning: { label: "朝", clock: "06:30" },
  day: { label: "昼", clock: "12:00" },
  dusk: { label: "夕方", clock: "18:30" },
  night: { label: "夜", clock: "22:00" },
};

export function skyPhase(hour: number): SkyPhase {
  if (hour >= 5 && hour < 8) return "morning";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** アプリの 24 時間表示（`HH:mm`）と同じく、時と分だけを 2 桁で出す。 */
export function clockText(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
