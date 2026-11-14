import { describe, expect, it } from "vitest";
import { advanceSettle, MAX_STEP_SECONDS } from "../src/lib/pile-settle";

describe("advanceSettle", () => {
  it("通常のフレームはそのまま足す", () => {
    expect(advanceSettle(1, 0.016)).toBeCloseTo(1.016);
  });
  it("タブを 10 秒裏に回しても、足すのは物理 1 歩分だけ", () => {
    expect(advanceSettle(2, 10)).toBeCloseTo(2 + MAX_STEP_SECONDS);
  });
  it("負の時間は足さない", () => {
    expect(advanceSettle(2, -1)).toBe(2);
  });
});
