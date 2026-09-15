# アプリ詳細ページのデザイン

ステータス: 確定
最終更新日: 2026-09-15

`src/app/apps/[slug]/page.tsx` が registry から `/apps/<slug>/` を静的生成する。HTML やアプリ別の script/style ファイルをコピーしない。

- キャンバス: `.app-shell` と `body:has(.app-shell)` は `--paper` / `--ink`。`--app-*` の名前は残し、値は紙面トークンへ寄せる。紫ピンクの放射グラデと `color-scheme: light` 固定は持たない。`[data-theme="dark"]` は `tokens.css` に従う。
- Hero: 戻るリンク、120px アイコン（グローなし）、名前（インク・字重 400）、タグライン（`--ink-2`、グラデ文字なし）、紹介、プラットフォーム、outlined pill の CTA。行長は `--measure`。左揃え。ホームの `<Nav />` は載せない。Hero 右上にそのアプリの標本ビニールを 1 枚置く（`.specimen-slot`、内側の `.sticker-slot` は 96px でホームの机スロット規則から切り離す）。アイコンが無いアプリには置かない。リンクではない。`aria-hidden`。`src/components/SpecimenSticker.tsx` が `VinylSticker` を `href` なしで載せ、クランプは `.app-shell`（`shellBounds`）。viewport 固定にしない。離した位置に残る。リサイズで机と同様にオフセットを捨てる。法務ページ（アプリ `/privacy/` `/terms/`、サイト `/privacy/` `/terms/`）とトップには置かない。テープ・日付印・手書き合図は置かない。
- Features: registry の `{ icon, title, description }` を塗りなし・1px 罫線のブロックで表示。白いカード影は持たない。英語見出しは Newsreader 400。
- Screenshots: `public/apps/<slug>/screenshots/` の実ファイルを registry の順序で表示。flex wrap した各行を中央配置し、lazy loading と alt を付ける。1px 罫線と `--shadow-sticker`。黒ベタ背景は使わない。
- Footer: `/apps/<slug>/privacy/` とトップへの導線。字重 400。
- CTA: 配布先は電圧ブルーの outlined pill。「機能を見る」はインクの outlined pill。塗りグラデと浮き上がりは持たない。

共通 CSS は `src/styles/app-page.css`、基本トークンは `src/styles/tokens.css`。App Router は遷移後も読み込んだ global CSS を保持するため、アプリ詳細とアプリ別 privacy / terms は `.app-shell` で包み、各コンポーネント規則をその配下へスコープする。例外として、詳細表示中のブラウザ余白とオーバースクロールを同じ紙にする `body:has(.app-shell)` だけを条件付きで使う。`:root` や無条件の `body`、汎用の `.hero` などへアプリ固有の規則を追加しない。`--app-*` / `--glass-*` の既存名を維持する。掲載画像は正方形アイコン（128px 以上）と縦長スクリーンショットを使用する。

プライバシー本文は `src/data/privacy/<slug>.ts` に保持し、`src/data/privacy/registry.ts` へ同じ slug で登録する。現在の詳細ページは常に privacy リンクを表示するので、追加時には本文と生成 URL が実在することを必ず検証する。registry のアプリと本文の対応はテストで完全一致を要求する。

URL・見出し・戻り導線・画像読み込みに加え、アプリ詳細からトップとサイト法務ページへ client-side navigation した後の配色を `tests/e2e/site.spec.ts` で確認する。過去の設計は [旧仕様](../superpowers/completed/specs/2026-05-09-app-page-design.md) に残すが、現行の実装手順ではない。
