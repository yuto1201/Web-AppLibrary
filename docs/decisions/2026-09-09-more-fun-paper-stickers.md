# 紙とステッカーに、もう少し面白さを足す

ステータス: 採択
決定日: 2026-09-09

## 背景

2026-09-08 の [紙とステッカーへの再設計](2026-09-08-paper-sticker-redesign.md) でトップページを大幅に簡素化した。所有者から「だいぶシンプルになったので、もう少し面白いサイトにしたい」との要望があった。ただし獲得した「静かで軽い紙面」という美点は失いたくない。検索・フィルタ・重いグラス UI への後戻りは避ける。

Codex (gpt-5.6-sol) と Grok (cursor-grok-4.6-high) の両方に、現在の実装 (`src/components/Stickers.tsx`、`src/lib/drag.ts` 等) を見せた上で相談した。両者は独立に**一覧行とステッカー帯の相互連動**という同じ結論に到達した。Grok は「ステッカーの掴み位置に応じた傾き」、Codex は「フッターの折りたたみ奥付」をそれぞれ独自に提案した。

## 決定

3 点を実装する。

1. **一覧行 ↔ ステッカーの相互ハイライト。** `slug` を鍵に、行にホバー/フォーカスすると対応するステッカーが持ち上がり、逆にステッカーにホバー/フォーカスすると対応する行がハイライトする。共有状態は `src/app/page.tsx` に持ち上げる。
2. **掴み位置に応じた傾きと、掴んでいる間だけ残る点線の跡。** 中心からずれた位置で掴んで横に引くと、てこの原理で回転量が変わる（`src/lib/drag.ts` の `normalizeGrab` / `spinFromGrab`）。掴んでいる間は元の位置に破線の枠（`.sticker-ghost`）が残る。
3. **フッターの折りたたみ「奥付」。** 既定で閉じている `<details>`。開くと、ひとりで作っていること・トラッキング無し・静的サイトであることが読める。

いずれも新しい UI 要素を増やさず、既存の唯一の遊び（ステッカー）を深掘りするか、閉じた状態では何も増えない要素に留めた。外部ライブラリは追加していない。

## 検討した代替案

- **ドラッグで現れる鉛筆注釈（Codex 提案）。** アプリごとの短い注釈をコンポーネントへ個別に埋め込む必要があり、アプリが増えるたびに追随が要る。見送り、将来検討。
- **個別ページの標本ステッカー（Grok 提案）。** 今回のスコープを広げすぎるため見送り。
- **一覧のカード化、Hero への追加演出、紙への質感（ノイズ・染み等）の追加。** 両モデルが独立に、生成 AI デザインの型へ最も逆戻りしやすい場所として警告した。採用しない。

## 影響

- 変更: `src/lib/drag.ts`（`normalizeGrab` / `spinFromGrab` を追加）、`src/components/Stickers.tsx`（掴み位置の記録、`--spin`、`.sticker-slot` によるゴースト表示、slug 連動）、`src/components/AppsSection.tsx`（連動ハイライト）、`src/components/Sections.tsx`（Footer に奥付）、`src/lib/site-data.ts`（奥付の i18n）、`src/styles/standard.css`。
- 追加: `src/components/AppLibrarySection.tsx`（相互ハイライトの共有状態。`page.tsx` は Server Component のまま）、`src/lib/activate.ts`（ホバー / フォーカスの区別）、`tests/drag.test.ts` に `normalizeGrab` / `spinFromGrab` の単体テスト、`tests/e2e/site.spec.ts` に相互ハイライト・掴み位置と傾き・リサイズ中断・奥付の E2E。
- ステッカーへのホバーが行との相互ハイライトを発火させ、0.3s の transition で位置がわずかに動くため、E2E でホバー直後に mouse.down するとタイミング競合が起きうる。テスト側でホバー後に transition の収束を待つ（[トップページのデザイン](../design/top.md) に記録）。

## レビューで直したもの

実装後、Codex (gpt-5.6-sol) と Grok (cursor-grok-4.6-high) の両方に read-only で差分レビューを依頼した。両者が独立に指摘したものを優先して直した。

- **`is-linked` が特異性で `is-held` と `:hover` を常に上書きし、掴んだときの傾き演出とホバーの起き上がりが両方とも見えなくなっていた**（Grok が CSS 行を引いて指摘）。アプリのステッカーはホバーそれ自体が自分を is-linked にもするため、3 つの規則が同時に成立する。`:not(:hover):not(:focus-visible):not(.is-held)` で直接触れている間は is-linked を降ろした。E2E は `--spin` の値だけでなく、実際に描かれた transform の回転角でも差を確認するよう強化した（この回帰はそこを見ていなかったので通っていた）。
- **ホバーとフォーカスを 1 本の `activeSlug` に混ぜていた**（Codex・Grok 両方）。キーボードで行にフォーカスした状態で別の要素にマウスを乗せて離れると、フォーカス由来のハイライトまで消えていた。`hoverSlug` / `focusSlug` に分け、`onActivate(slug, source)` でどちらの系統か伝える。
- **2 本指で別々のステッカーを掴むと、親の `held` が 1 件しか持てず片方の表示が消えていた**（Codex・Grok 両方）。`Set<string>` にした。同じステッカーへの 2 本目の `pointerdown` も無視する。
- **ドラッグ中にリサイズが起きると、古い帯の矩形で clamp し続けていた**（Codex・Grok 両方）。`resetToken` を進めて進行中のドラッグを各 `Sticker` 側でも捨てる。
- **`page.tsx` 全体を client にしていた**（Grok）。兄弟 2 つだけを包む `AppLibrarySection` に閉じ、`page.tsx` は Server Component に戻した。
- `lostpointercapture` にも `pointerup` と同じ後始末を付けた（Codex。`pointercancel` は元から同じ処理だった）。

見送ったもの: CSS `:has()` による state 無し実装（Grok が代替案として挙げたが、3 件でも slug ごとの規則を書く必要があり、React state のほうが件数に依存しない）。

関連: [トップページのデザイン](../design/top.md)、Issue #23
