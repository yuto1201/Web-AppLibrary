ステータス：運用中
最終更新日：2026-09-01

---

# AppLibrary

個人開発したアプリを紹介する Web サイト。iOS に限らず、macOS / Web / CLI などプラットフォームを問わず掲載する。liquid-glass デザインを標準採用。

- 制作: [@Yuto_Program](https://x.com/Yuto_Program)
- リポジトリ: <https://github.com/yuto1201/Web-AppLibrary>
- 公開先: <https://app.yutodev.com/>（Cloudflare Pages）

Next.js の静的出力を Cloudflare Pages で配信する。サーバー処理・DB・認証は使わない。

---

## セットアップ

```bash
npm ci
python3 -m venv .venv-ogp
.venv-ogp/bin/python -m pip install --disable-pip-version-check --no-deps --require-hashes -r tools/requirements-ogp.txt
npm run dev
# → http://localhost:3000
```

## コマンド

| コマンド | 用途 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 静的出力を `out/` へ生成 |
| `npm run check` | 方針・文書・生成物・lint・型・テスト・静的 build |
| `npm run check:fast` | 実装中の lint・型・テスト |
| `npm run verify` | check + desktop/mobile E2E |
| `npm run start` | out/ を localhost:3210 で静的配信 |
| `npm run generate` | 共通レビュー契約からエージェント設定を生成 |
| `npm run test` | Vitest |
| `npm run test:e2e` | Playwright（`out/` を配信して実行） |

ローカル/CI は Node 24.20.0 / npm 11.6.2 に固定。fnm を使う場合は `fnm install` → `fnm use` で `.node-version` を適用する。公開環境は minor/patch 更新を許容する Node 24.x / npm 11.x。初回 E2E 前に `npm exec -- playwright install chromium` を実行する。`test:e2e` 単独なら先に `npm run build`。

### Hero オープニング演出を再生する

DevTools コンソールで:

```js
sessionStorage.removeItem('applibrary_hero_seen'); location.reload();
```

---

## アプリを追加する

`src/data/registry.ts` へ 1 件追加し、`public/apps/<slug>/` に画像、`src/data/privacy/` に本文を置いて `privacy/registry.ts` へ同じ slug で登録する。詳細ページとプライバシーページは静的生成され、全掲載アプリに本文があることをテストで検証する。

手順の詳細は [AGENTS.md](AGENTS.md) を参照。

---

## 構成

| パス | 内容 |
|---|---|
| `src/app/` | ルーティング（App Router） |
| `src/components/` | UI コンポーネント |
| `src/data/registry.ts` | 掲載アプリの唯一の真実（zod で検証） |
| `src/lib/site-data.ts` | プロフィール / お知らせ / SNS / i18n |
| `src/styles/` | デザインシステム |
| `public/apps/<slug>/` | アイコンとスクリーンショット |

---

## 現状

- SubLog / CafLog / Dev-Tools の 3 本を掲載
- iOS と Web のプラットフォーム絞り込みを実データで検証

未完了項目は [docs/TODO.md](docs/TODO.md) を参照。2026-09-01 時点では 0 件。

---

## 関連ドキュメント

| ドキュメント | 内容 |
|---|---|
| [AGENTS.md](AGENTS.md) | 開発規約（root 契約） |
| [docs/deploy/README.md](docs/deploy/README.md) | 公開とデプロイ |
| [specs/README.md](specs/README.md) | プロダクトと受け入れ条件 |
| [docs/workflow.md](docs/workflow.md) | Web-Template 由来の Issue / PR / レビュー方式 |
| [docs/verification.md](docs/verification.md) | ローカルと CI の検証 |
| [docs/decisions/](docs/decisions/) | 設計判断の記録 |
