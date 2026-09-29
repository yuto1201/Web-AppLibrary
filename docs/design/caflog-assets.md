# CafLog のヒーロー素材

2026-09-29 / Issue #63。ユーザー指定の [Red Bull 日本サイト](https://www.redbull.com/jp-ja) から、写真主体の構成、大きな見出し、赤の CTA を参考にした。ロゴ・写真・スローガンは流用していない。

## 出力と用途

- `public/apps/caflog/editorial/morning-ride.webp`: PC 向けヒーロー。
- `public/apps/caflog/editorial/morning-ride-mobile.webp`: 同じ画像を縮小・圧縮したモバイル向け素材。
- 内蔵 ImageGen で生成。架空の朝のコーヒー風景で、利用者の写真・実績を示すものではない。
- WebP は Sharp でサイズ調整と圧縮のみ行った。元画像は Codex の生成画像フォルダに保持した。
- アプリ画面とアイコンは既存の `public/apps/caflog/` を使う。画面を生成画像で置き換えない。
- 3 つの導入イラストはコード内の SVG。数値や医学的な曲線を示す図表ではなく、記録・推移・就寝を表す装飾。

## 生成プロンプト

```text
Use case: photorealistic-natural. Asset type: original wide website hero photograph for CafLog, a caffeine tracking iOS app. Create a cinematic editorial photograph, wide 16:9 landscape 2048x1152. Dawn in a Japanese city, a quiet concrete riverside, blue-hour navy shadows and a warm orange sunrise. On the RIGHT HALF of the frame: close-up of a cyclist's hand holding a simple unbranded red takeaway coffee cup, black jacket sleeve, a small part of a matte black bicycle handlebar in the foreground. The background shows an out-of-focus city bridge, soft warm backlight and a little steam above the cup. Cropped human detail only, no face, no full body. Feel active, focused, atmospheric, real tactile photography, natural film grain, restrained red/navy/amber colors. LEFT HALF must be mostly clean dark navy shadow with subtle environment, usable as copy space. Subject is specifically coffee before a morning ride, not a sports drink advertisement. No typography, letters, logos, brand symbols, cans, app interface, watermarks or borders.
```
