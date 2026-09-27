# デプロイ — Cloudflare Pages

## 目標構成

| 項目 | 設定 |
|---|---|
| 本番 URL | <https://app.yutodev.com/> |
| Pages プロジェクト | `applibrary`（Cloudflare account `Yuto Dev`） |
| ソース | `yuto1201/Web-AppLibrary` の Git 連携 |
| 本番ブランチ | `main` |
| プレビュー | PR ブランチの Pages preview deployment |
| ビルド | `npm run build`、出力ディレクトリ `out` |
| Node | `.node-version` の `24.20.0`（Pages の build image v3） |

Next.js は `output: "export"` で静的ファイルを生成する。Pages Functions、DB、認証は使わない。Cloudflare の build image は `.node-version` を読み、Node のバージョンを切り替える。`engines` は互換 major 範囲、ローカルと CI は `policy` で Node/npm の完全一致を検査する。

## 移行手順（Issue #55）

1. `npm run verify`、OpenAI / Anthropic の独立レビュー、対象 Head の GitHub `Repository checks` / `Browser checks` を確認する。
2. Cloudflare Pages に `applibrary` を作成し、上記の GitHub repository・production branch・build command・出力ディレクトリを設定する。GitHub App の権限とプレビューが有効か実際に確認する。
3. PR の preview URL でトップ・アプリ詳細・法務・404 を表示し、`public/_headers` の CSP とキャッシュ方針が応答に反映されることを確認する。
4. 公開対象の PR と Head について承認を得てから `main` へ squash merge する。本番 Pages deployment の成功と内容を `*.pages.dev` で確認する。
5. Pages の Custom domains で `app.yutodev.com` を登録する。Cloudflare が管理する `yutodev.com` の `app` CNAME を Pages へ切り替える。**CNAME だけを先に変更しない。** DNS・custom domain の操作には別の明示承認を得る。
6. `https://app.yutodev.com/` の TLS、主要ページ、404、CSP、キャッシュ、DNS と Pages の domain status を確認する。ローカルの build 成功を本番の証拠に流用しない。
7. 新しい配信経路を確認した後、旧 Vercel の `applibrary` プロジェクトの自動デプロイとドメイン設定を停止し、プロジェクトを整理する。対象を特定して別の明示承認を得る。

2026-09-27 の移行開始時点では Cloudflare Pages プロジェクトは 0 件で、`app` は Vercel の CNAME `392c47f2b226d996.vercel-dns-017.com`（DNS only）を指し、公開応答の `server` は `Vercel` だった。完了を報告する際は上記の状態を再取得し、各操作と結果を記録する。

## ヘッダとキャッシュ

`public/_headers` は Next.js の `out/_headers` にコピーされ、Pages の静的応答に適用される。

- 全パス: CSP、`X-Frame-Options: DENY`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`
- `/_next/static/*`: 1 年 immutable。ファイル名にハッシュを持つ資産だけを長期キャッシュする
- `/apps/*`: `public, max-age=0, must-revalidate`。HTML と固定名のアイコン・スクリーンショットを再検証する

CSP を緩める変更は理由を PR に書く。Pages の `_headers` は Pages Functions の応答には適用されないため、Functions を導入する場合はヘッダ設計を見直す。

## 検証と履歴

PR の `Repository checks` / `Browser checks` と独立レビューの実際の出力を確認してから、承認された対象をマージする。両 check は active な GitHub Ruleset で必須化され、正規化した設定は `config/github-ruleset.json` に保存する。この export は取得時点の記録であり、実効状態は GitHub API で別途確認する。[../workflow.md](../workflow.md) を参照。

2026-08-31 の Next.js 化と旧配信先への移行は [履歴 ADR](../decisions/2026-08-31-nextjs-vercel-migration.md) に記録する。Cloudflare Pages に戻す判断は [新しい ADR](../decisions/2026-09-27-cloudflare-pages-migration.md) に記録する。
