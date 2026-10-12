import { describe, expect, it } from "vitest";
import { SKY_PRESETS, clockText, skyPhase } from "@/lib/flower-sky";

describe("Flower の空", () => {
  it("アプリの空のキーフレーム（5・8・17・20 時）で時間帯を分ける", () => {
    expect([0, 4, 5, 7, 8, 12, 16, 17, 19, 20, 23].map((hour) => skyPhase(hour))).toEqual([
      "night", "night", "morning", "morning", "day", "day", "day", "dusk", "dusk", "night", "night",
    ]);
  });

  it("選んだ時間帯の時計は、その時間帯に入る時刻を出す", () => {
    for (const [phase, preset] of Object.entries(SKY_PRESETS)) {
      expect(skyPhase(Number(preset.clock.split(":")[0]))).toBe(phase);
    }
  });

  it("時計は時と分だけを 24 時間表示で出す", () => {
    expect(clockText(new Date(2026, 9, 12, 6, 5, 59))).toBe("6:05");
    expect(clockText(new Date(2026, 9, 12, 22, 48))).toBe("22:48");
  });
});
