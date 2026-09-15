import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { apps } from "@/data/registry";
import { i18n } from "@/lib/site-data";

const glyphs = readFileSync(path.join(process.cwd(), "src/fonts/klee-desk-glyphs.txt"), "utf8");

describe("Klee One subset", () => {
  it("手書きに出す文字がサブセットに含まれる", () => {
    const texts = [
      ...apps.map((app) => app.stickerNote),
      i18n.ja.desk_hint,
      i18n.en.desk_hint,
    ];
    for (const text of texts) {
      for (const char of text) {
        expect(glyphs, `missing ${char} from ${text}`).toContain(char);
      }
    }
  });
});
