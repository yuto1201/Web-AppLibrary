# Klee One（手書き用）

用途はホームの手書き合図（`.desk-hint`）と鉛筆メモ（`.sticker-caption`）だけ。本文・ナビ・CTA・ワードマークには使わない。

- 由来: [Fontworks Klee](https://github.com/fontworks-fonts/Klee) Regular。SIL OFL 1.1（`OFL.txt`）
- 配置: `KleeOne-Regular.woff2`。`next/font/local` で自己ホストし、`preload: false`（全ルートへ 6MB 超の TTF を先読みしない）
- サブセット: `klee-desk-glyphs.txt` の文字だけ残す。ひらがな・カタカナ・Basic Latin と、現行の `stickerNote` / `desk_hint` に出る漢字
- 元ファイル SHA-256（Fontworks `fonts/KleeOne-Regular.ttf`）: `92e95355d5af1d686c4493ce08ed95d9389abac826d03540dcadc3c768388498`
- 現行 woff2 SHA-256: `e129fccab64098d6034c13b0a0922395f6b54d48b348badab6cdc4c66f280727`

`next/font/google` の `subsets: ["latin"]` ではひらがなが落ちるため、Google 経由には戻さない。

新しい漢字を `stickerNote` に足したら `klee-desk-glyphs.txt` を更新し、`pyftsubset` で woff2 を作り直す。`tests/klee-glyphs.test.ts` が文字の包含を見る。
