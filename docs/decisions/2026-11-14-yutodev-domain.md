# サイトを yutodev.com へ移し、このリポジトリを yutodev.com のサイトにする

ステータス: 採択
最終更新日: 2026-11-14
関連: [設計: サイトを yutodev.com へ移す](../superpowers/specs/2026-11-14-yutodev-domain-move-design.md)、Issue #143、Issue #145、[デプロイ](../deploy/README.md)

---

## 背景

yutodev.com を、個人のポートフォリオとアプリの紹介を置く「外に見せる前提」のサイトにすると決めた（2026-11-14）。これまでの AppLibrary は `https://app.yutodev.com/` にあり、`yutodev.com` と `www` は何も配信していなかった。`app.yutodev.com` の URL は App Store Connect の登録、承認済みの法務本文、アプリの中のリンクに入っていて、壊せない。

## 決定

- このリポジトリ（2026-11-14 に `yuto1201/Web-AppLibrary` から `yuto1201/Web-yutodev` に改名）を yutodev.com のサイトのリポジトリとする。サブディレクトリのサイトを別のリポジトリに分けず、1 つのサイトとして広げる。
- URL の形:
  - `yutodev.com/` は入口。個人サイトを作るまでは `/apps/` へのリンクだけを置く。
  - `yutodev.com/apps/` はアプリの一覧（AppLibrary）。
  - `/apps/<slug>/` と、サイト共通の `/privacy/`・`/terms/` は今のパスのまま。
- 正式な URL は `https://yutodev.com/`（`config/project.json` の `productionUrl`）。
- 一度公開した URL は壊さない。一覧を `config/kept-urls.json` に置き、すべてが 200 で返ることを e2e で検査する。
- `app.yutodev.com` は Cloudflare の Redirect Rules で 301 転送する。`/` は `https://yutodev.com/apps/` へ、それ以外は同じパスへ。`www.yutodev.com` は `yutodev.com` へ転送する。
- 承認済みの法務本文に残る `https://app.yutodev.com/...` は書き換えず、描画時にサイト内のリンクとして扱う（`src/lib/legal-markdown.ts` の `siteLocalPath`）。

## 検討した代替案

- **サイトごとにリポジトリを分け、パスで振り分ける。** Pages の独自ドメインはホスト単位なので Worker の中継と `basePath` が要り、見た目や `_headers` もずれやすい。分けるならサブドメインにする。
- **Pages Functions でホストを見て転送する。** DNS only のままでよいが、静的サイトに実行するコードが入るので採らない。
- **転送せず、両方のホストで同じ中身を出す。** `app.yutodev.com/` と `/#contact` が連絡先に着かなくなるので採らない。
- **Pages の `_redirects`。** ホスト単位の転送ができない。

## 影響

- `app` の CNAME は転送のために proxied になる。`app` は HTML を返さないので、Cloudflare の差し込みは起きない。`yutodev.com` 本体は今までの `app` と同じく DNS only で配信する。
- オリジンが変わるので、テーマと言語の保存値が 1 回だけ消える。
- 301 はブラウザに残るので、戻すときは転送を外しても一度来た人には転送が残る。
- iOS-Template と派生アプリが決め打ちしている `https://app.yutodev.com/apps/<slug>/…` は転送で動く。書き換えは別に扱う。
