# 検証と証拠

ローカル/CI は Node 24.20.0 / npm 11.6.2 を用意して `npm ci` を実行する。`policy` が完全一致を検査する。fnm なら `fnm install` → `fnm use`、シェルの自動切替が働かない場合は `fnm exec --using=24.20.0 npm run verify` を使う。OGP 生成用 Python は `.python-version` の 3.13.3 に固定し、専用の `.venv-ogp` へ hash 検証した Pillow を導入する。npm の OGP script は `.venv-ogp/bin/python` を優先し、CI とローカルで同じ生成経路を使う。

Cloudflare Pages のビルドは `.node-version` で Node 24.20.0 を指定する。npm の major は `engines.npm` と `.npmrc` の `engine-strict` が検査する。実際に選ばれた Node/npm は Pages のビルドログで確認する。ローカル/CI の完全一致検証と公開先のビルド結果は別に確認する。詳細は [公開手順](deploy/README.md)。

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

トップは保存テーマに応じて、空色に黒い文字と夜色に明るい文字の単色キャンバスを切り替える。パステルの各パネルと Nav の明るい面は黒い文字を維持する。Hero の装飾ワードマークはアウトライン SVG の存在・表示・読み上げ除外を確認し、透過ループも読み上げ対象にしない。実際のブランド名と見出し・本文は引き続きテキストとして確認する。8枚のステッカーの初期境界と、下端72pxの操作領域・本文との非重複を320〜1280pxと英語で確認する。ドラッグ後のスクロールは文書座標が変わらないことを検証する。CafLog は実アイコンと実画面を使う明るい地色・濃い文字の専用構成、SubLog は明るい地色に青と黄緑の専用構成、PayCycle は白系の紙・濃紺・赤・黄の専用構成、共通の個別ページと法務は紙面トークンの単色キャンバスを使う。E2E の axe `color-contrast` は実装値のまま判定し、背景を単色へ倒さない。`color-contrast` が `incomplete` の場合や pass が 0 件の場合も失敗させる。アプリページ用 CSS は遷移後もブラウザに残るため、各詳細と各アプリの privacy を `page.goto` で直接開き、表示中の body と各ページのルート要素の配色を検証する。登録済みのアプリ terms（PayCycle と SimplePomo）も同様に直接開く。`request.get` は HTML と OGP の実在確認であり、CSS は適用しない。詳細から privacy へのクリック遷移と、トップへ戻った後の `.app-shell` 不在・body 配色も別途確認する。見出し階層（`h2` > `h3` ≥ 本文）は `h3` を持つ PayCycle と SimplePomo の法務で測る。

SubLog の Issue #67 は、既存の詳細・法務の直接ロード、メタデータ、6件の機能、4枚の実画面とギャラリー操作、配布先、runtime エラー、コントラストの検証を維持する。追加の検証は支払いの表示例に絞り、「表示例」の注記、月額3,670円と年額44,040円の切替、`aria-pressed`、Enter / Space 操作、320 / 393 / 768 / 1280px の横はみ出しと操作可能性を確認する。保存した dark / en でも専用の配色と日本語本文を保ち、privacy との往復で保存テーマが失われないことも確認する。共通詳細の標本シールのドラッグと dark 見出しは Dev-Tools で検証する。実行結果やプレビュー・本番の確認結果は、この文書の検証方法と区別して対象 Head とともに記録する。

PayCycle の Issue #72 / #82 は、新しい実アイコンと5枚の実画面、registry の6機能、公開済み1.1の状態と正しい App Store リンク、準備中の文言とα印の不在、サポート・privacy・terms への導線を確認する。既存の metadata・法務本文・ギャラリー検証を維持し、ページ内リンク、前後ボタンと左右キー、質問のキーボード操作、320 / 390 / 1280px の横はみ出しと主要操作の44px領域を確認する。保存した dark / en のまま専用配色を表示し、privacy と terms へ移ると法務の保存テーマへ戻ることを、実配色のコントラストとともに検証する。

リンク検証はローカル Markdown のファイル実在を確認する。外部 URL と見出し anchor の内容は検証しない。`docs/decisions/` と `docs/superpowers/completed/` は旧実装を説明する履歴のため対象外。現行文書の壊れた参照は対象外にせず修正する。

結果には実際のコマンド・成否・対象コミットと未検証項目を残す。レビュー前のテストと、その後に変わった Head を混同しない。変更後は関係する検証を再実行する。ライブ公開状態とローカル結果は分ける。


SimplePomo の Issue #79 は、未公開状態の3ルート、実アイコン、空のスクリーンショット一覧、日英の全文とメタデータ・見出し階層、法務ページとの往復とテーマ復元、問い合わせ先を確認する。時計の針は computed transform の経時変化で実際の回転を確かめ、一時停止中は変化しないことを確認する。reduced motion、320 / 390 / 768 / 1280px の横はみ出し、実配色のコントラストも維持する。ホームの全ステッカーは遊び場のラベルを含めて非重複を検査し、スクリーンショットがないアプリの一覧・展示では実アイコンへのフォールバックを検証する。公開前の法務本文の所有者確認はテストとは別に記録する。
