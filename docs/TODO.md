# TODO — AppLibrary

最終更新日: 2026-10-04

- [ ] SimplePomo のアプリページ・Privacy Policy・Terms of Use を公開する（Issue #79 / PR #80。ユーザー確認項目への回答、アイコンの受領と OGP 再生成、日英本文の最終承認が残る）
- [ ] PayCycle の Hero を大きな実アイコン中心の構成へ変更する（Issue #77）
- [x] PayCycle を新しいアイコンと現行アプリ画面を使う専用ページへ刷新する（Issue #72 / PR #73、main へ統合・本番確認済み）
- [x] SubLog の青と黄緑の専用ページを公開する（Issue #67 / PR #68、main `86f449c` へ統合・本番確認済み）
- [x] CafLog を実アイコンとアプリ画面の色・形に合わせて刷新する（Issue #69 / PR #70、main へ統合・本番確認済み）

- [x] トップページを触って発見できる小さなアプリ工房に育てる（Issue #61 / PR #62、main へ統合・本番確認済み）
- [x] CafLog を写真主体の力強い専用サイトへリニューアル（Issue #63 / PR #64、main へ統合・本番確認済み。配色は Issue #69 で再調整）
- [x] ホームをパステルの色面と動かせるアイコンが一体になった遊び場へ刷新する（Issue #65 / PR #66、main へ統合・本番確認済み）

- [x] AppLibrary の配信を Cloudflare Pages に移行し、旧配信先を停止した（Issue #55 / PR #56、完了記録: Issue #58）
- [ ] 個別ページをアイコンの色味に合わせる（Issue #52）
- [x] 個別ページにスクショギャラリーを足す（Issue #50 / PR #51）

- [x] 机のシールに、主張しすぎない呼吸を足す（Issue #45 / PR #46）
- [x] Hero 本文・CTA とシールが重ならないようにする（Issue #39 / PR #42）
- [x] 個別ページを同じ紙面の続きとして揃える（Issue #40 / PR #44）
- [x] サイト privacy を現実装へ同期する（Issue #41 / PR #43）
- [x] 個別ページをポスター紙面へ揃える（Issue #38 / PR #37）

仕様: [スクショギャラリー](superpowers/specs/2026-09-25-screenshot-gallery-design.md)
計画: [スクショギャラリー](superpowers/plans/2026-09-25-screenshot-gallery.md)

## 直近の完了

- [x] Issue #34 で PayCycle 固有の日英利用規約、更新済み Privacy Policy、support/privacy/terms 導線を整備
- [x] Issue #31 でシールをフッターの山にし、ページ全体でつまめるようにした
- [x] Issue #30 でトップをクリーム紙と電圧ブルーのポスター紙面へ寄せた
- [x] Issue #25 で PayCycle の紹介・日英プライバシー・app-ads.txt を追加
- [x] Issue #23 で一覧行とステッカーの相互ハイライト、掴み位置に応じた傾き、フッターの奥付を追加
- [x] Issue #21 でトップページを紙とステッカーへ再設計し、検索・フィルタ・モーダル・Liquid Glass・未使用設定を削除
- [x] Issue #16 で Dev-Tools を追加し、iOS / Web の platform filter、外部サイト CTA、画像・privacy coverage を検証
- [x] Issue #14 で OGP、サイト法務ページ、アプリ法務本文、機能カード、metadata、アクセシビリティ、キャッシュを公開向けに整備
- [x] Web-Template の Issue / PR / exact-head review / CI / Ruleset 機構を静的サイト向けに移植し、不要な旧配信物を削除

## 見送った改善

- アプリごとの切り抜きイラスト（机の刷新でも既存アイコンのビニール化に留める）。
- マスキングテープの常時モーション、鉛筆合図の点滅、個別ページ標本の idle、ドラッグ後のオーバーシュート（Issue #45 の諮問で見送り）。

OGP・鉛筆メモ・個別ページの標本は [机の跡](superpowers/specs/2026-09-15-desk-play-refresh-design.md) の範囲へ移した。

完了経緯は [設計判断](decisions/README.md)、[完了済み計画](superpowers/completed/)、GitHub の closed Issue / merged PR に保存します。未確認のローカルアプリ名を候補として列挙しません。
