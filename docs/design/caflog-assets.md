# CafLog の画像素材と履歴

## 現行の素材（Issue #69）

サイトと実アプリの色が離れているというユーザー指摘を受け、既存アイコンと実画面を中心に構成する。画像は既存ファイルをそのまま使用し、新たな画面画像を生成・加工しない。

- `public/apps/caflog/icon.png`: 実際のアプリアイコン（1024 × 1024）。ブランドとアプリ紹介に使用する。
- `public/apps/caflog/screenshots/1.webp`: CafLog 2.0 の実際のホーム画面（1206 × 2622）。Hero の `.caflog-hero-image` に使用する（Issue #119）。
- `public/apps/caflog/screenshots/1.webp`〜`6.webp`: CafLog 2.0 の実際の 6 画面（ホーム、記録、睡眠への影響、振り返り、実績、着せ替え。各 1206 × 2622）。撮り方は [CafLog](../apps/caflog.md) に記録した。ギャラリーでは registry に登録された順序を維持する。1.0 の 5 画面（1179 × 2556 の PNG）は Issue #119 で置き換えた。
- 3つの導入イラストはコード内の SVG。記録・推移・就寝を表す装飾であり、数値や医学的な曲線を示す図表ではない。配色は実アイコンに合わせる。

## 旧ヒーローの生成写真（Issue #63、現行ページでは未使用）

2026-09-29 / Issue #63。ユーザー指定の [Red Bull 日本サイト](https://www.redbull.com/jp-ja) から、写真主体の構成、大きな見出し、赤の CTA を参考にした。ロゴ・写真・スローガンは流用していない。以下のファイルと生成プロンプトは履歴として保持し、Issue #69 のページでは参照しない。

### 出力と当時の用途

- `public/apps/caflog/editorial/morning-ride.webp`: PC 向けヒーロー。
- `public/apps/caflog/editorial/morning-ride-mobile.webp`: 同じ画像を縮小・圧縮したモバイル向け素材。
- 内蔵 ImageGen で生成。架空の朝のコーヒー風景で、利用者の写真・実績を示すものではない。
- WebP は Sharp でサイズ調整と圧縮のみ行った。元画像は Codex の生成画像フォルダに保持した。

### 生成プロンプト

```text
Use case: photorealistic-natural. Asset type: original wide website hero photograph for CafLog, a caffeine tracking iOS app. Create a cinematic editorial photograph, wide 16:9 landscape 2048x1152. Dawn in a Japanese city, a quiet concrete riverside, blue-hour navy shadows and a warm orange sunrise. On the RIGHT HALF of the frame: close-up of a cyclist's hand holding a simple unbranded red takeaway coffee cup, black jacket sleeve, a small part of a matte black bicycle handlebar in the foreground. The background shows an out-of-focus city bridge, soft warm backlight and a little steam above the cup. Cropped human detail only, no face, no full body. Feel active, focused, atmospheric, real tactile photography, natural film grain, restrained red/navy/amber colors. LEFT HALF must be mostly clean dark navy shadow with subtle environment, usable as copy space. Subject is specifically coffee before a morning ride, not a sports drink advertisement. No typography, letters, logos, brand symbols, cans, app interface, watermarks or borders.
```
