# ホームの装飾素材

2026-09-29 / Issue #65。ユーザー指定の [Slush / Refero](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b) の色面・太い文字・立体感を参考に、AppLibrary の遊び場を制作した。参考サイトのロゴ・画像・フォントは転載していない。

## ワードマーク

`src/components/HomeWordmark.tsx` は、既存の Inter 可変フォントの 900 ウェイトから作った SVG アウトライン。立体装飾と重なるロゴを、フォント読込前から同じ形で描く。APP / LIBRARY の2段を中央配置し、黒（夜間は白）で表示する。ロゴは装飾として扱い、ブランド名はナビ、ページの意味は実テキストの h1 が伝える。

## 使わなくなった: 青い立体ループ

Issue #135 で、遊び場の飾り（青い立体ループ `blue-orbit.webp`、星のシール、英語の札）を外した。素材ファイルは削除済みで、ホームでは使わない。遊び場は枠と点の模様のある面になり、大きなワードマークとシールだけを置く。2026-09-29 / Issue #65 の生成記録として、プロンプトだけを残す。

- 1440 × 960 の透過 WebP を内蔵 ImageGen で生成し、Sharp で縮小と圧縮だけをした。
- カード・ステッカー・切り替え展示は既存の `public/apps/` の実素材を使う。

### 生成プロンプト

```text
Create a single original sculptural 3D decorative object for a playful independent app portfolio website: one continuous thick electric sky-blue inflated rubber tube bent into an irregular open orbital loop, oblique oval with a loose sweeping tail curving toward the lower right. Wide horizontal composition, large clear empty hole at center, lively asymmetrical silhouette. Material is tactile softly pebbled grainy matte rubber with very subtle lustrous edge highlights; saturated medium blue (#4da2ff) with deeper cobalt shadow sides, light from upper left. View front with gentle 3D perspective. Contemporary playful collectible toy art, premium physical realism, not a logo, not a letter, not a branded symbol. The object fills most of a 3:2 horizontal canvas with 6% clear padding and NO cast shadow outside the object. Fully transparent background; clean alpha cutout. No text, no letters, no icons, no extra objects, no floor, no photography setting.
```

# 旧案: 制作風景の写真

2026-09-29 / Issue #65 の初案。ユーザーの修正依頼によりホームでは未使用。生成履歴とファイルは保存している。

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
