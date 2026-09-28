# デプロイ — Cloudflare Pages

## 現在の構成

| 項目 | 設定 |
|---|---|
| 本番 URL | <https://app.yutodev.com/> |
| Pages プロジェクト | `applibrary`（Cloudflare account `Yuto Dev`） |
| Pages ホスト名 | `applibrary-ag2.pages.dev` |
| DNS | `app` CNAME → `applibrary-ag2.pages.dev`、DNS only、TTL 自動 |
| ソース | `yuto1201/Web-AppLibrary` の Git 連携 |
| 本番ブランチ | `main`（自動本番デプロイ有効） |
| プレビュー | PR ブランチの Pages preview deployment |
| ビルド | `npm run build`、出力ディレクトリ `out` |
| Node | `.node-version` の `24.20.0`（Pages の build image v3） |

Next.js は `output: "export"` で静的ファイルを生成する。Pages Functions、DB、認証は使わない。Cloudflare の build image は `.node-version` を読み、Node のバージョンを切り替える。`engines` は互換 major 範囲、ローカルと CI は `policy` で Node/npm の完全一致を検査する。

## 公開切替の記録（2026-09-28 / Issue #55）

- PR #56 の本番コミットは `26e19fe8613349378ceff16dd20b5a43cec54947`、Pages deployment は `3d836bf0-01fb-48c1-943a-b23e565a369e`。
- `app.yutodev.com` を Pages の Custom domains に登録後、自動更新された CNAME を DNS only に戻した。権威 DNS と公開リゾルバーの両方で Pages 向きを確認した。
- Pages は「アクティブ」「SSL 有効」。切替直後の検証中には一時的に 522 が返り、2026-09-28 12:45 UTC に 200 応答へ移行した。
- 本番ドメインでトップ、アプリ詳細、アプリ privacy、サイト privacy、terms、404、CSP、セキュリティヘッダ、HTML の `Cache-Control: public, max-age=0, must-revalidate`、404 の `no-store`、ハッシュ付き JS の `public, max-age=31536000, immutable` を観測した。PC / モバイル表示で JavaScript と console のエラーはなかった。
- 12:46:34〜12:56:38 UTC の10分間、30秒間隔の21回すべてで HTTP 200、Cloudflare 配信、CSP を確認した。HTML に解析 / Zaraz script や Set-Cookie はなく、別の新規 Chromium セッションでも Cookie と外部 script は空だった。
- 12:57 UTC に旧 Vercel `yuto16/applibrary` プロジェクトを削除（API 204）。再取得は Project not found（404）、旧標準 URL と旧本番 deployment URL も DEPLOYMENT_NOT_FOUND（404）を返した。削除後に本番ドメインの主要ページ・ヘッダを再検証した。
- 切替後にダッシュボードと権威 DNS で再確認したゾーン設定は、Web Analytics 有効、Bot Fight Mode 無効、Rocket Loader 無効、CAA なし。ゾーン設定は変更せず、DNS only と実際の公開応答で解析の自動挿入がないことを確認した。
- 旧配信先の削除後は、下記の旧 CNAME に戻す復旧手順は使えない。今後の復旧は Pages の正常な deployment を使う。

検証範囲は Chromium の PC / モバイル表示と上記 HTTP / DNS 観測。全地域の DNS キャッシュの反映完了や Safari 実機確認を意味しない。

## 移行時の手順（Issue #55）

1. `npm run verify` と OpenAI / Anthropic の独立レビューを済ませる。Cloudflare の DNS、Web Analytics、Bot Management、Zaraz、Rocket Loader、CAA の現状を読み取りで確認する。
2. 対象を示して承認を得た後、Vercel `yuto16/applibrary` の Git 連携だけを解除する。**既存の本番 deployment と custom domain は保持する。** 解除後も `app.yutodev.com` が従来の CSP・法務本文で正常に配信され、新しい Git push では Vercel がデプロイしないことを確認する。
3. 対象を示して承認を得た後、Cloudflare Pages `applibrary` を作り、`yuto1201/Web-AppLibrary`、production branch `main`、build command `npm run build`、出力 `out` を設定する。移行中は**自動本番デプロイを無効**、PR preview を有効にする。Pages Web Analytics は有効にしない。GitHub App 権限を確認してからブランチを push し、PR を作る。
4. 対象 Head の `Repository checks` / `Browser checks` と独立レビューを確認する。PR preview でトップ・アプリ詳細・法務・404・`public/_headers` の応答を検証し、Pages build log の Node/npm を確認する。
5. 公開対象の PR と Head について承認を得た後、Pages の自動本番デプロイを有効にして `main` へ squash merge する。Pages の本番 `*.pages.dev` で新しい本文・ヘッダ・404 を確認する。この時点の公開ドメインは、Git 連携を解除した Vercel の最後の deployment を引き続き配信する。
6. Pages の Custom domains に `app.yutodev.com` を登録し、直後に `app` CNAME の向きと proxy status を確認する。Cloudflare が CNAME を自動で変更し proxied にする場合は、同じ切替操作の中で **DNS only** に戻してから次へ進む。既存 CNAME との競合で登録が拒否された場合は、先にレコードを消さず切替方法を再検討する。この一連の操作には別の明示承認を得る。**CNAME だけを先に変更しない。**
7. `https://app.yutodev.com/` の TLS、主要ページ、404、CSP、キャッシュ、DNS、Pages domain status を確認する。HTML に解析・Zaraz の script が挿入されていないこと、ブラウザ console に CSP 違反がないこと、想定外の Cookie がないことも確認する。ローカルの build 成功を本番の証拠に流用しない。
8. 切替後 10 分間の疎通確認を終えてから、旧 Vercel の domain 設定とプロジェクトを整理する。対象を特定して別の明示承認を得る。切替中に問題があれば Vercel の最後の正常な deployment を残したまま、`app` CNAME を旧値へ戻し、DNS only で復旧する。

2026-09-27 の移行開始時点では Cloudflare Pages プロジェクトは 0 件で、`app` は Vercel の CNAME `392c47f2b226d996.vercel-dns-017.com`（DNS only）を指し、公開応答の `server` は `Vercel` だった。Cloudflare ゾーンの Web Analytics は on、Bot Fight Mode と Rocket Loader は off、CAA レコードは 0 件だった。DNS only を目標にするのは、ゾーンで有効な解析が本サイトへ自動挿入されるのを避けるためでもある。完了を報告する際は上記の状態を再取得し、各操作と結果を記録する。

## ヘッダとキャッシュ

`public/_headers` は Next.js の `out/_headers` にコピーされ、Pages の静的応答に適用される。

- 全パス: CSP、`X-Frame-Options: DENY`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`
- `/_next/static/*`: 1 年 immutable。ファイル名にハッシュを持つ資産だけを長期キャッシュする
- `/apps/*`: `public, max-age=0, must-revalidate`。HTML と固定名のアイコン・スクリーンショットを再検証する

CSP を緩める変更は理由を PR に書く。Pages の `_headers` は Pages Functions の応答には適用されないため、Functions を導入する場合はヘッダ設計を見直す。

## 検証と履歴

PR の `Repository checks` / `Browser checks` と独立レビューの実際の出力を確認してから、承認された対象をマージする。両 check は active な GitHub Ruleset で必須化され、正規化した設定は `config/github-ruleset.json` に保存する。この export は取得時点の記録であり、実効状態は GitHub API で別途確認する。[../workflow.md](../workflow.md) を参照。

2026-08-31 の Next.js 化と旧配信先への移行は [履歴 ADR](../decisions/2026-08-31-nextjs-vercel-migration.md) に記録する。Cloudflare Pages に戻す判断は [新しい ADR](../decisions/2026-09-27-cloudflare-pages-migration.md) に記録する。
