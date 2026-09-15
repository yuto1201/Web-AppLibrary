# 検証と証拠

ローカル/CI は Node 24.20.0 / npm 11.6.2 を用意して `npm ci` を実行する。`policy` が完全一致を検査する。fnm なら `fnm install` → `fnm use`、シェルの自動切替が働かない場合は `fnm exec --using=24.20.0 npm run verify` を使う。OGP 生成用 Python は `.python-version` の 3.13.3 に固定し、専用の `.venv-ogp` へ hash 検証した Pillow を導入する。npm の OGP script は `.venv-ogp/bin/python` を優先し、CI とローカルで同じ生成経路を使う。

Vercel は Node/npm の minor/patch を固定できないため、install/build は `engines` の Node 24.x / npm 11.x を許容する。`.npmrc` は範囲外の major を拒否するが、クラウドにローカルの完全一致バージョンを要求しない。詳細は [公開手順](deploy/README.md)。

| コマンド | 検証内容 |
|---|---|
| `npm run check:docs` | 方針、ローカル Markdown リンク、受け入れ条件対応、agent wrapper と OGP 生成物の同期 |
| `npm run check:fast` | ESLint、Next 型生成と TypeScript、Vitest |
| `npm run check` | 上記すべてと静的ビルド |
| `npm run test:e2e` | 既にビルドした `out/` の desktop/mobile Chromium テスト |
| `npm run verify` | `check` → `test:e2e`（初回は `npm exec -- playwright install chromium`） |
| `npm run start` | `out/` を 127.0.0.1:3210 で配信。ビルド前は失敗する |
| `npm run generate` | 共通レビュー契約から Codex / Claude 用設定を再生成 |

`next start` は静的 export では使わない。ローカル配信に実行時ダウンロードや SPA fallback を使わない。E2E は既存の別サーバーを再利用せず、ポート競合も失敗として報告する。

CI は Linux の `Repository checks` と `Browser checks` を実行し、ブラウザ失敗時にレポート・trace を保存する。`Repository checks` は commit SHA で固定した setup-python と `.python-version` を使い、システム Python を変更しない。通常モーションを既定とし、reduced-motion は専用テストで確認する。iPhone 15 相当の viewport を Chromium で確認するものであり、Safari / 実機検証を意味しない。

トップ、サイト法務、個別ページ、アプリ法務は紙面トークンの単色キャンバスを使う。E2E の axe `color-contrast` は実装値のまま判定し、背景を単色へ倒さない。`color-contrast` が `incomplete` の場合や pass が 0 件の場合も失敗させる。アプリページ用 CSS は遷移後もブラウザに残るため、各詳細と各アプリ法務を `page.goto` で直接開き、表示中の body / `.app-shell` 配色を検証する。`request.get` は HTML と OGP の実在確認であり、CSS は適用しない。詳細から privacy へのクリック遷移と、トップへ戻った後の `.app-shell` 不在・body 配色も別途確認する。

リンク検証はローカル Markdown のファイル実在を確認する。外部 URL と見出し anchor の内容は検証しない。`docs/decisions/` と `docs/superpowers/completed/` は旧実装を説明する履歴のため対象外。現行文書の壊れた参照は対象外にせず修正する。

結果には実際のコマンド・成否・対象コミットと未検証項目を残す。レビュー前のテストと、その後に変わった Head を混同しない。変更後は関係する検証を再実行する。ライブ公開状態とローカル結果は分ける。
