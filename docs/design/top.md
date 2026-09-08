# トップページのデザイン

ステータス: 確定
最終更新日: 2026-09-08

実装は `src/app/page.tsx` と `src/components/`。意匠は **紙 (paper) の上にステッカーが貼られている**という一枚の見立て。

## 原則

- 構造は影とぼかしではなく **1px の罫線と余白** で作る。
- 影を使うのはステッカーだけ。紙に物が置かれている合図に限る。
- 自動で動くのは **初回訪問の Hero だけ**。スクロール連動の演出は持たない。
- 色の値は `src/styles/tokens.css` に置き、`standard.css` へ重複させない。

## トークン

`tokens.css` が `--paper` / `--paper-raised` / `--paper-sunken` / `--ink` / `--ink-2` / `--ink-3` / `--rule` / `--rule-strong` / `--accent` を持つ。既定は light（紙）で、`[data-theme="dark"]` が同じ役割を濃いインク紙へ差し替える。

`--ink-2` / `--ink-3` / `--accent` は `--paper` 上で 4.5:1 以上になる値を選んでいる。E2E は色を上書きせず**実際の配色**で axe の `color-contrast` を判定するため、明るくする方向へ動かしたら `npm run test:e2e` で確認する。

書体は 3 つ。`--font-sans` (Inter) が本文と UI、`--font-display` (Bricolage Grotesque) が見出し・アプリ名・ワードマーク、`--font-mono` (JetBrains Mono) が日付と件数。display は latin subset なので、日本語は OS のゴシックへ落ちる。

紙面の行長は `:root` の `--measure` (760px)。`.nav` と `.footer` は `.page` の外にあるため `:root` に置く。

## 画面構成

1. `Nav`: ワードマーク、アンカー、言語・テーマ切替。罫線 1 本で紙面と切る。640px 以下ではアンカーを畳む（本文がすぐ下にあるためメニューは持たない）。
2. `Hero`: 役割のタグ、見出し、紹介、拠点と技術、一覧への導線。見出しは 1 文字ずつ立ち上がる。
3. `AppsSection`: 掲載アプリを**行の索引**として並べる。行全体が個別ページへのリンク。hover の色はアプリ自身の `accent` を使う。
4. `Stickers`: アプリアイコンを傾いたステッカーとして重ね、掴んで動かせる。ここだけが `--measure` を破って広がる。
5. `Posts` / `Contact` / `Footer`: お知らせ、連絡先、法務ページへの導線。

## ステッカーの実装

計算は `src/lib/drag.ts` の純粋関数（`moveOffset` / `clampOffset` / `isTap` / `baseBox`）に分け、`tests/drag.test.ts` が検証する。ポインタ処理は `src/components/Stickers.tsx`。

- `pointerdown` で掴んだ時点のオフセットと矩形を控え、`setPointerCapture` する。移動量は**掴んだ時点のオフセット**へ足す（現在値へ足すと二重加算になる）。
- オフセットは帯の内側へクランプする。E2E が初期表示とドラッグ後の両方で `scrollWidth <= clientWidth` を確認する。
- 移動量がしきい値未満なら「タップ」として個別ページへ遷移する。各ステッカーは `<Link>` なのでキーボードでは通常のリンクとして動く。
- 飾りステッカー（Swift / Tokyo）は装飾なので `aria-hidden`。
- `prefers-reduced-motion` では補間を止める。ドラッグ自体は利用者の操作なので残す。
- アプリの `accent` は明色紙面向けの値なので、dark では `--ink` へ戻す。

レビューで判明した制約と対処。

- **クランプは掴んだ時点の矩形に基づく。** ドラッグ後にウィンドウを変えると保証が切れるため、帯へ `overflow: clip` を掛けて防波堤を二重にし、`resize` で並びを戻す。`clip` は `hidden` と違いスクロールコンテナを作らない。
- **クリック抑止フラグは `onClick` で消費して戻す。** 戻さないと、以降のキーボード Enter や支援技術からの click（`pointerdown` を伴わない）まで抑止し続ける。E2E がドラッグ後の Enter 遷移を確認する。
- **`touch-action` は `none` ではなく `pan-y`。** 縦スクロールはページの主要な操作なので奪わない。指を縦に動かすと `pointercancel` が来てドラッグは中止される。横から始めたジェスチャだけ受け取る。
- **`held` は掴んだ本人だけが解除する。** 2 本指で 2 枚掴んだとき、片方を離しても他方の表示を巻き込まない。
- **FOUC スクリプトも列挙値を検証する。** `readStorage` と同じく `dark` / `en` だけを受け付け、それ以外は既定のままにする。

## 持たないもの

検索、プラットフォーム／カテゴリのフィルタ、チップ、空状態、モーダル、`layout` / `density` / `font` / `accent` の設定、Liquid Glass の SVG 歪みフィルタ、スクロール連動の reveal。掲載アプリが 10 件を超えたら一覧の絞り込みを再検討する。

経緯は [紙とステッカーへの再設計](../decisions/2026-09-08-paper-sticker-redesign.md) と [完了済み仕様](../superpowers/completed/specs/2026-05-09-home-hero-opening-design.md) に残す。
