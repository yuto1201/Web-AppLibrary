# 設計: サイトを yutodev.com へ移す

日付: 2026-11-14
Issue: #145
状態: 侑斗さんが会話で承認（2026-11-14「この設計で進める」）

## 1. 目的と理由

yutodev.com を、個人のポートフォリオとアプリの紹介を置く「外に見せる前提」のサイトにする（2026-11-14 の 侑斗さんの決定、A 案「1 つのサイトを広げる」）。今の AppLibrary（`https://app.yutodev.com/`）を yutodev.com 全体に広げる。このリポジトリ（`yuto1201/Web-yutodev`、旧 `Web-AppLibrary`）を yutodev.com のサイトのリポジトリとする。

今回は個人サイトの中身は作らない。`yutodev.com/` には `/apps/` へのリンクだけを置き、まずドメインを移す。

## 2. ゴール・やらないこと・失敗とみなすこと

ゴール:

- `https://yutodev.com/apps/` で今のトップ（作品・制作の背景・アプリの更新・連絡先 `#contact`）が見える。
- `https://yutodev.com/` に `/apps/` へのリンクがある。
- 一度公開した URL を壊さない。`app.yutodev.com` の URL はすべて `yutodev.com` の同じ中身へ 301 で転送される。

やらないこと:

- 個人サイトの中身、トップのデザインの変更。
- 承認済みの法務本文の書き換え（本文の `https://app.yutodev.com/...` は転送で動かす）。
- App Store Connect の登録 URL、iOS-Template の URL の変更（後から別に扱う）。
- 表示名「AppLibrary」、localStorage のキーの変更。

失敗とみなすこと:

- App Store Connect に登録したサポート・プライバシーの URL、法務本文のリンク、アプリ内のリンクのどれかが 404 になる、または別の中身に着く。
- `app.yutodev.com/#contact` が連絡先に着かない。
- Cloudflare が HTML に解析やスクリプトを差し込む。

## 3. 制約

- Next.js の静的出力（`output: "export"`）、Cloudflare Pages `applibrary`（`applibrary-ag2.pages.dev`）、`main` への push で自動デプロイ。
- 静的出力は絶対パス。サブディレクトリ配信（`basePath`）はしない。`/apps/` は同じサイトの中のページ。
- `main` へのマージ、Pages の公開設定、DNS の変更は、その都度 侑斗さんの明示の承認が要る（CLAUDE.md）。
- Cloudflare は Free プラン。ゾーン `yutodev.com` には MX（Email Routing）、SPF・DKIM の TXT、`web-template`（Vercel）、`test` の AAAA がある。これらは変えない。

## 4. URL の形

| URL | 中身 |
|---|---|
| `yutodev.com/` | `/apps/` へのリンクだけのページ |
| `yutodev.com/apps/` | 今の `app.yutodev.com/` のトップ |
| `yutodev.com/apps/<slug>/`、`/privacy/`・`/terms/`・`/support/` | 今と同じ |
| `yutodev.com/privacy/`・`/terms/`・`/app-ads.txt`・`/sitemap.xml`・`/robots.txt` | 今と同じパス |
| `app.yutodev.com/` | 301 → `https://yutodev.com/apps/` |
| `app.yutodev.com/<その他>` | 301 → `https://yutodev.com/<同じパス>`（クエリも保つ） |
| `www.yutodev.com/<パス>` | 301 → `https://yutodev.com/<同じパス>` |

`#contact` などのフラグメントはサーバーに届かず、ブラウザが転送先に持ち越す。`app.yutodev.com/#contact` は `yutodev.com/apps/#contact` に着く。

## 5. 検討した方法と選んだもの

- **Cloudflare の Redirect Rules（選んだ）。** ゾーンの `http_request_dynamic_redirect` に、ホストが `app.yutodev.com` のとき「パスが `/` なら `/apps/`、それ以外は同じパス」で転送するルールを置く。コードが要らない。`app` の CNAME を proxied にする必要があるが、`app` は転送だけで HTML を返さないので、Cloudflare の差し込みの心配がない。`www` も同じ仕組みで足す。
- **Pages Functions でホストを見て転送する。** DNS only のままでよいが、静的サイトに実行するコードが入り、方針から外れるので採らない。
- **転送せず両方で同じ中身を出す。** `app.yutodev.com/` と `/#contact` が連絡先に着かなくなるので採らない。
- **Pages の `_redirects`。** ホスト単位の転送ができないので使えない。

## 6. コードの変更

1. 今の `src/app/page.tsx` を `src/app/apps/page.tsx` に移す。`src/app/page.tsx` は `/apps/` へのリンクだけのページにする（空色の机の地、`noindex` にはしない）。
2. サイトの中の「トップ」へのリンク（`← AppLibrary`、法務ページのナビ、アプリの枠の戻るリンク、`/#contact`）を `/apps/`・`/apps/#contact` に向ける。
3. `config/project.json` の `productionUrl` を `https://yutodev.com/` にし、`tools/project-config.mjs` の検査を合わせる。canonical・OGP・sitemap・robots は `productionUrl` から作られるので、それに従う。sitemap に `/apps/` を入れる。
4. `src/lib/legal-markdown.ts` は自サイトの URL を相対リンクにしている。古いオリジン `https://app.yutodev.com` も自サイトとして扱い、表示は原文のまま、遷移先は相対にする。`app.yutodev.com/` と `/#contact` は相対にすると `/` に着いてしまうので、`/apps/`・`/apps/#contact` に読み替える。
5. 残す URL の一覧を設定ファイルにし、「一覧のパスがビルドの出力にある」ことをテストで検査する。
6. ADR を足し、`AGENTS.md`・`CLAUDE.md`・`README.md`・`docs/deploy/README.md` を新しいドメインとリポジトリの役割に合わせる。

## 7. 切り替えの順番（各段で 侑斗さんの承認を得る）

1. Pages `applibrary` の独自ドメインに `yutodev.com` を足す。作られた DNS レコードを DNS only に戻す（今の `app` と同じ方針）。この時点では今の中身が `yutodev.com` でも出るだけで、何も壊れない。
2. PR を main にマージし、本番の反映を確かめる。
3. 直後に、転送のルールを入れ、`app` の CNAME を proxied にする。`www` の CNAME（proxied）と転送を足す。2 と 3 の間の数分は、`app.yutodev.com/` に `/apps/` へのリンクだけのページが出る。
4. 本番で、残す URL の一覧を新旧両方のホストで確かめる（状態コード、転送先、CSP、Cookie、差し込まれたスクリプトがないこと）。
5. GitHub の Website 欄を `https://yutodev.com/apps/` にする。

## 8. 影響

- オリジンが変わるので、見に来た人のテーマと言語の設定（localStorage）が 1 回だけ消える。
- 301 はブラウザに強く記憶される。戻すときは転送のルールを外しても、一度来た人のブラウザには転送が残る。
- iOS-Template と派生アプリは `https://app.yutodev.com/apps/<slug>/…` を決め打ちしている。転送で動くが、後で書き換える。

## 9. 作る人に任せること

- `/` のページの文言と見た目（机の地とリンク 1 つ、の範囲で）。
- 残す URL の一覧のファイル名と形式、テストの置き場所。
- Redirect Rules の式の書き方（4 章の表と同じ結果になること）。
