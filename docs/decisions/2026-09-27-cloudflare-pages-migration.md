# AppLibrary の配信を Cloudflare Pages に統一する

ステータス: 採択
日付: 2026-09-27
関連: [旧配信判断](2026-08-31-nextjs-vercel-migration.md)、Issue #55

---

## 背景

サイトは Next.js の静的出力だけで構成され、動的サーバー、DB、認証を使わない。利用者が今後 Vercel を使わず、Cloudflare に配信を統一することを指定した。DNS ゾーン `yutodev.com` は既に Cloudflare が管理する。

## 決定

`output: "export"` と `out/` を保ち、Cloudflare Pages の Git 連携で `main` を本番ブランチ、PR ブランチをプレビューとして配信する。ヘッダは `public/_headers` に置く。`app.yutodev.com` は Pages custom domain として登録し、DNS only で運用する。旧配信サービスの Git 連携を先に止めて最後の正常な本番 deployment を残し、プレビューと Pages 本番を検証してからドメインを切り替える。

## 検討した代替案

Workers で Next.js を実行する構成は、この静的サイトに不要な実行時層を増やすため採用しない。Cloudflare Pages は公式に Next.js の静的出力を `out/` から配信できる。

## 影響

配信設定、DNS、TLS、ブラウザ動作、セキュリティヘッダ、キャッシュを別々に検証する必要がある。Cloudflare ゾーンでは Web Analytics が有効なため、DNS only と Pages 側で解析を有効にしない設定により、公開サイトへの自動挿入を避ける。公開操作は Issue #55 の手順と会話中の対象別承認に従う。2026-08-31 の ADR は当時の判断記録として残し、配信先に関する採択状態をこの ADR が上書きする。
