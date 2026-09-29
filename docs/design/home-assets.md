# ホームのヒーロー素材

2026-09-29 / Issue #65。採用済みの CafLog ページから、写真・濃紺・赤と大胆な文字組みをホームへ展開する。

## 出力と用途

- `public/home/editorial/tokyo-desk.webp`: PC 向けヒーロー（1672 × 941、56,336 bytes）。
- `public/home/editorial/tokyo-desk-mobile.webp`: 同じ画像を縮小・圧縮したモバイル向け素材（1000 × 563、25,048 bytes）。
- 内蔵 ImageGen で生成した、東京の夜をイメージした架空の制作風景。本人の仕事場を撮影したものではない。
- 装飾背景として空の alt を使用する。人物・実績・提携を示す用途ではない。
- Sharp でサイズ調整と WebP 圧縮のみ実施。元画像は Codex の生成画像フォルダに保持した。
- カタログと切り替えコーナーのアプリ画面・アイコンは既存の `public/apps/` の実素材を使う。

## 生成プロンプト

```text
Use case: photorealistic-natural. Asset type: original photographic background for the homepage of an independent app developer's portfolio, AppLibrary. Cinematic high-end editorial interior photograph, wide landscape 16:9, 2048x1152. A small creative developer workspace in Tokyo at dusk, navy-blue shadows, a restrained red-orange task lamp and warm natural window light. On the RIGHT HALF: a minimal dark desk, the edge of a silver laptop with a softly glowing deliberately out-of-focus screen with no readable interface, a compact keyboard, notebook, and a modest green plant; beyond it a big window with out-of-focus city lights. No people. Authentic quiet atmosphere of making useful small apps. Natural tactile materials, realistic camera photography, subtle film grain. The LEFT HALF is mostly very dark navy negative space for a large white headline. Keep the workspace focal point in the rightmost third, not the center. Composition with depth and strong light, not a flat stock photo. No legible text, no brand logos, no Apple logo, no app mockup, no charts, no numbers, no watermarks, no borders. Dark navy and warm amber with red accent, closely related in mood to the existing CafLog morning coffee photograph but an original different scene.
```
