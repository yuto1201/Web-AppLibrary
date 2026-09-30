# AppLibrary の文書

ステータス: 確定
最終更新日: 2026-08-31

| 文書 | 内容 |
|---|---|
| [../specs/README.md](../specs/README.md) | プロダクトと受け入れ条件の正本 |
| [workflow.md](workflow.md) | Issue / PR / レビュー / 公開の境界 |
| [verification.md](verification.md) | ローカルと CI の検証コマンド |
| [architecture.md](architecture.md) | Next.js 静的出力の構成 |
| [deploy/README.md](deploy/README.md) | Cloudflare Pages 配信と DNS |
| [design/top.md](design/top.md) | トップページ |
| [design/app-page.md](design/app-page.md) | アプリ詳細ページ |
| [design/components.md](design/components.md) | 共通コンポーネント |
| [apps/README.md](apps/README.md) | アプリ固有の記録 |
| [decisions/README.md](decisions/README.md) | 設計判断の履歴 |
| [TODO.md](TODO.md) | 未完了タスクと直近の完了状況 |
| [superpowers/completed/](superpowers/completed/) | 旧サイトの完了済み仕様・計画（履歴のみ） |

アプリ追加は registry と画像、必要な法務本文を更新する。人が残す経緯がある場合にだけ `docs/apps/` に追記し、空のテンプレートを機械的に増やさない。
UI 変更では対応する design 文書、構成変更では architecture、公開手順では deploy を更新する。規範は AGENTS / specs、作業手順は workflow / verification、過去の判断は decisions に置く。
