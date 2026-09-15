# アプリ詳細ページのデザイン

ステータス: 確定
最終更新日: 2026-09-15

`src/app/apps/[slug]/page.tsx` が registry から `/apps/<slug>/` を静的生成する。HTML やアプリ別の script/style ファイルをコピーしない。

- Hero: 戻るリンク、アイコン、名前、紹介、プラットフォーム、配布先 CTA。Hero 右上にそのアプリの標本ビニールを 1 枚置く（`.specimen-slot`）。リンクではない。`aria-hidden`。`src/components/SpecimenSticker.tsx` が `VinylSticker` を `href` なしで載せ、クランプは `.app-shell`（`shellBounds`）。viewport 固定にしない。離した位置に残る。リサイズで机と同様にオフセットを捨てる。法務ページ（アプリ `/privacy/`、サイト `/privacy/` `/terms/`）とトップ以外には置かない。詳細ページ全体をポスター型に組み直すのは対象外。
- Features: registry の `{ icon, title, description }` を共通カードで表示。
- Screenshots: `public/apps/<slug>/screenshots/` の実ファイルを registry の順序で表示。flex wrap した各行を中央配置し、lazy loading と alt を付ける。
- Footer: `/apps/<slug>/privacy/` とトップへの導線。

共通 CSS は `src/styles/app-page.css`、基本トークンは `src/styles/tokens.css`。App Router は遷移後も読み込んだ global CSS を保持するため、アプリ詳細とアプリ別 privacy は `.app-shell` で包み、各コンポーネント規則をその配下へスコープする。例外として、詳細表示中のブラウザ余白とオーバースクロールを同じ明色にする `body:has(.app-shell)` だけを条件付きで使う。`:root` や無条件の `body`、汎用の `.hero` などへアプリ固有の規則を追加しない。`--app-*` / `--glass-*` の既存名を維持する。掲載画像は正方形アイコン（128px 以上）と縦長スクリーンショットを使用する。

プライバシー本文は `src/data/privacy/<slug>.ts` に保持し、`src/data/privacy/registry.ts` へ同じ slug で登録する。現在の詳細ページは常に privacy リンクを表示するので、追加時には本文と生成 URL が実在することを必ず検証する。registry のアプリと本文の対応はテストで完全一致を要求する。

URL・見出し・戻り導線・画像読み込みに加え、アプリ詳細からトップとサイト法務ページへ client-side navigation した後の配色を `tests/e2e/site.spec.ts` で確認する。過去の設計は [旧仕様](../superpowers/completed/specs/2026-05-09-app-page-design.md) に残すが、現行の実装手順ではない。
