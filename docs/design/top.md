# トップページのデザイン

ステータス: 確定
最終更新日: 2026-09-15

実装は `src/app/page.tsx` と `src/components/`。意匠は **クリームのポスターを机に置いたまま**。印刷はきれいだが、その上にビニールとテープと鉛筆が乗っている。参照は Drive Capital / Summer Drive の紙面と、Wandor の interactive sticker footer。#31 の「初期配置はフッターの山だけ」は、机の跡の仕様が上書きする。

## 原則

- 構造は影とぼかしではなく **1px の罫線と余白** で作る。
- 影を使うのはステッカーだけ。紙に物が置かれている合図に限る。
- 自動で動くのは **初回訪問の Hero だけ**。スクロール連動の演出は持たない。
- 色の値は `src/styles/tokens.css` に置き、`standard.css` へ重複させない。
- サイトの彩色は電圧ブルー 1 色。アプリ色はシールと一覧ホバーに限る。
- ホーム UI は Inter 300 / 400。Latin 見出しは Newsreader 400。手書きは Klee One 400 だけ。

## トークン

`tokens.css` が `--paper` / `--paper-raised` / `--paper-sunken` / `--ink` / `--ink-2` / `--ink-3` / `--rule` / `--rule-strong` / `--accent` を持つ。既定は light（クリーム `#fff8f1`）で、`[data-theme="dark"]` が同じ役割を濃いインク紙へ差し替える。

`--accent` の light は `#0066ee`。Drive Capital の `#006eff` はクリーム上 4.27:1 のため、16px の操作文字が 4.5:1 を満たす一歩暗い値にしている。dark は `#6eb3ff`（`#006eff` が濃い紙上で 4.5:1 を割るため）。

`--ink-2` / `--ink-3` / `--accent` は `--paper` 上で 4.5:1 以上。E2E は色を上書きせず**実際の配色**で axe の `color-contrast` を判定する。

書体は 4 つ。`--font-sans` (Inter 300/400) が本文と UI、`--font-display` (Newsreader) が Latin のワードマークと英語見出し、`--font-mono` (JetBrains Mono) が日付と件数、`--font-hand` (Klee One 400) が手書き合図と鉛筆メモだけ。Klee One は Fontworks の Regular を SIL OFL 1.1 で自己ホストする（`src/fonts/`、`next/font/local`、`preload: false`）。`next/font/google` の latin subset では日本語が落ちるため使わない。配布物は必要文字だけの woff2（由来と作り方は `src/fonts/README.md`）。本文・ナビ・CTA・ワードマークには使わない。display は latin subset なので、日本語の本文は OS のゴシックへ落ちる。Bricolage Grotesque は使わない。

紙面の行長は `:root` の `--measure` (760px)。`.nav` と `.footer` は `.page` の外にあるため `:root` に置く。CTA は `--radius-pill` (60px) の outlined。

## 画面構成

1. `Nav`: Newsreader のワードマーク、電圧ブルーのアンカー、outlined の言語・テーマ切替。罫線 1 本で紙面と切る。640px 以下ではアンカーを畳む。Nav の z-index は初期配置のシールより上。
2. `Hero`: 役割のメタ、巨大見出し（電圧ブルー）、紹介、拠点、outlined pill の CTA。見出しは 1 文字ずつ立ち上がる。机の印として、右上付近に JetBrains Mono の枠文字 `TOKYO '26`（`.desk-stamp`、`aria-hidden`、Nav を覆わない）と、CTA 下の手書き合図「つまんでみて」/ `Pinch one.`（`.desk-hint`、Klee One、本文サイズで 4.5:1）を置く。どちらもドラッグしない。
3. `AppsSection`: 掲載アプリを**行の索引**として並べる。行全体が個別ページへのリンク。hover の色はアプリ自身の `accent` を使う。ステッカーと `slug` で相互にハイライトする。見出しの**上**に CSS のマスキングテープ（`.desk-tape`）が少し回転して覗く。見出し文字の背面には置かず、コントラストを落とさない。
4. `Stickers`: 既存アイコンを白フチのビニールとして、**最初の画面から紙に乗せる**。配置カタログは `src/lib/sticker-desk.ts` の `DESK_ITEMS`。読み込みごとに乱さない。`page.tsx` では Nav の直後（`main` より前）に置き、最初の画面に見えるシールへキーボード順を寄せる。位置は CSS の `%` で `.poster` 全体に対して取る（ページが長くなると Hero との相対がずれる）。Dev-Tools だけは例外で、`#apps .section-head` を測って `.poster` に `--desk-apps-top` を書く（`setProperty`。React は `.poster` の style を持たないので消えない）。`anchor` はカタログ上の役割で、他のスロットのレイアウト計算には使わない。
5. `Posts` / `Contact` / `Footer`: お知らせ、連絡先、法務ページへの導線。フッターは折りたたみ式の「奥付」を持つ。「ならべ直す」はフッター付近に残し、この机の配置へ戻す。

### 初期配置

desktop（641px 以上）:

| シール | 初期位置 |
|---|---|
| SubLog | Hero 見出しの右外。文字の読みを消さない |
| CafLog | Hero 左余白。本文・CTA・拠点メモのヒット領域は覆わない |
| Dev-Tools | App Library の見出し罫線上。文鎮。最初の索引行は覆わない |
| PayCycle | 右下の小さな山（紙の下へはみ出してよい） |
| Swift | 右下の山 |
| Tokyo | Hero の拠点メモ付近 |
| 一人制作 | 右下の山 |

640px 以下ではアプリシール 1 枚だけ Hero 右端から覗き（見出しグリフと CTA を覆わない）、1 枚は App Library 見出しの脇、残りは画面下の小さな山。横スクロールは出さない。

## ステッカーの実装

計算は `src/lib/drag.ts` の純粋関数（`moveOffset` / `clampOffset` / `isTap` / `baseBox`）に分け、`tests/drag.test.ts` が検証する。ポインタ処理は `src/components/VinylSticker.tsx`。ホームの机は `src/components/Stickers.tsx` が `DESK_ITEMS` とオフセットを持つ。クランプ矩形は `paperBounds`。

- `pointerdown` で掴んだ時点のオフセットと矩形を控え、`setPointerCapture` する。移動量は**掴んだ時点のオフセット**へ足す（現在値へ足すと二重加算になる）。
- オフセットは `.poster`（紙）へクランプする。下方向だけ初期の山のはみ出し分を許す。viewport 固定にはしない。E2E が初期表示とドラッグ後の両方で `scrollWidth <= clientWidth` を確認する。
- 移動量がしきい値未満なら「タップ」として個別ページへ遷移する。各アプリステッカーは `<Link>` なのでキーボードでは通常のリンクとして動く。DOM 順は Nav の次なので、一覧行より先にシールへフォーカスが付く。
- アプリ名はシールに書かない。飾りステッカー（Swift / Tokyo / 一人制作）は装飾なので `aria-hidden`。一人制作は言語を切り替えない。
- 形は slug ごと（`StickerShape`: SubLog 角丸四角、CafLog 円、Dev-Tools squircle、PayCycle やや大きい角丸）。alpha / beta だけ右下に小さな `α` / `β`（`.sticker-stamp`）。release は印なし。
- 掴んでいる間だけ少し大きくする（おおよそ `scale(1.06)`）。`prefers-reduced-motion` では拡大しない。傾きとドラッグ自体は残す。
- アプリシールをホバー / フォーカス / 掴んでいる間、近くに短い鉛筆メモ（`.sticker-caption`、`stickerNote`、`lang="ja"`、Klee One、`pointer-events: none`）を出す。離すと消える。英語 UI でも日本語のまま。飾りシールには出さない。
- 最後に掴んだ枚の `--layer` を上げて一番上へ残す。

レビューで判明した制約と対処。

- **クランプは掴んだ時点の矩形に基づく。** ドラッグ後にウィンドウを変えると保証が切れるため、`html` へ `overflow-x: clip` を掛けて横スクロールの防波堤にし、`resize` で机の配置へ戻す。`clip` は `hidden` と違いスクロールコンテナを作らない。`.poster` には overflow clip を掛けない（下方向のはみ出しを切らないため）。
- **クリック抑止フラグは `onClick` で消費して戻す。** 戻さないと、以降のキーボード Enter や支援技術からの click（`pointerdown` を伴わない）まで抑止し続ける。E2E がドラッグ後の Enter 遷移を確認する。
- **`touch-action` は `none` ではなく `pan-y`。** 縦スクロールはページの主要な操作なので奪わない。指を縦に動かすと `pointercancel` が来てドラッグは中止される。横から始めたジェスチャだけ受け取る。
- **`held` は掴んだ本人だけが解除する。** 2 本指で 2 枚掴んだとき、片方を離しても他方の表示を巻き込まない。
- **FOUC スクリプトも列挙値を検証する。** `readStorage` と同じく `dark` / `en` だけを受け付け、それ以外は既定のままにする。

## 一覧行とステッカーの相互ハイライト

共有状態は `src/lib/activate.tsx` の薄い `ActivateProvider` が持つ。一覧とシールが DOM 上で離れるため props の兄弟共有は使えない。`page.tsx` は Server Component のまま、provider だけを client にする。専用の大きな Context は増やさない。

- **ホバーとフォーカスは別系統で持つ**（`hoverSlug` / `focusSlug`、表示は `focusSlug ?? hoverSlug`）。1 本にまとめると、キーボードで行にフォーカスした状態で別の要素にマウスを乗せて離れただけで、フォーカス由来のハイライトまで消える。`onActivate(slug, source)` の `source`（`src/lib/activate.tsx`）でどちらの系統か伝える。
- 一致した側に `is-linked` を付ける。行は既存の hover 見た目（`paper-sunken` 背景 + `accent` 文字色）をセレクタ追加だけで再利用する。ステッカーは持ち上げるだけで、回転・拡大はしない（実際に掴んだときの反応と混同させないため）。
- **`.sticker.is-linked` は `:not(:hover):not(:focus-visible):not(.is-held)` を付ける。** アプリのステッカーはホバーそれ自体が自分を is-linked にもする（行を介さず直接触れているだけでも slug が一致する）ため、特異性が同じ `:hover` / `.is-held` / `.is-linked` のうち最後に書かれた is-linked が常に勝ち、掴んだときの傾き演出とホバーの起き上がりが両方とも見えなくなっていた（レビューで発見）。直接触れている間は is-linked を降ろし、行経由のときだけ効かせる。
- 装飾ステッカー（Swift / Tokyo / 一人制作）は `slug` を持たないため、この連動には参加しない。

## ステッカーの掴み位置と傾き（てこの原理）

`src/lib/drag.ts` の `normalizeGrab`（掴んだ点を矩形の中心から -1〜1 に正規化）と `spinFromGrab`（そこから回転量を出す）が計算を持つ。中心から離れた点を掴んで横へ引くほど大きく回る。掴んでいる間だけ `--spin` を `--tilt` へ足し、離すと 0 へ戻る（`VinylSticker` 内のローカル state。オフセットと違い親と共有しない）。

掴んでいる間、元の位置に `.sticker-ghost`（1px 破線）を重ねる。ステッカー本体は `transform` で動くが、`.sticker-slot`（机の初期位置に留まる）へ `inset:0` で重ねているため、常に元の位置と正確に一致する。`.stickers` と `.sticker-stage` は `display: contents`。塗りもヒットも持たない。inset の透明オーバーレイは axe が本文の color-contrast を bgOverlap にする。スロットは `.poster`（`position: relative`）を含むブロックに対して絶対配置する。ヒットはシール自身だけが受ける。ドラッグ中のシールは本文の上へ出てよい。

複数ポインタと中断への備え（レビューで指摘され対処）。

- `held` は `Set<string>`。2 本指で別々のステッカーを同時に掴んでも、片方の `is-held` と跡が消えない。
- 同じステッカーへの 2 本目の `pointerdown` は無視する（`drag.current` が残っていれば早期 return）。1 本目の掴み位置を上書きしない。
- `lostpointercapture` は `pointerup` と同じ後始末をする。`pointercancel` はそれに加え `dragged` を戻す（次の Enter を止めない）。他ポインタの cancel では触らない。
- リサイズは `offsets` と `held` を戻したうえで `resetToken` を進め、進行中のドラッグがあれば各 `VinylSticker` 側でも `drag.current` を捨てる。掴んだ時点の紙の矩形は無効になっているため、そのまま move/up を処理させない。

**E2E を書く際の注意。** ステッカーへマウスを乗せると、上記の相互ハイライトが `is-linked` を発火させ、0.3s の `transform` transition で位置が数 px 動く。この収束を待たずに `mouse.down()` すると、掴んだ位置の計算がずれて回転の符号まで変わることがある（実機のユーザー操作では発生しない、機械的な自動操作特有のタイミング問題）。`tests/e2e/site.spec.ts` はホバー後に transition 分だけ待ってから押している。

## 持たないもの

検索、プラットフォーム／カテゴリのフィルタ、チップ、空状態、モーダル、`layout` / `density` / `font` / `accent` の設定、Liquid Glass の SVG 歪みフィルタ、スクロール連動の reveal、紙の粒子・染み・コーヒー輪、新規ダイカットイラスト、シール位置の localStorage 永続化。掲載アプリが 10 件を超えたら一覧の絞り込みを再検討する。

経緯は [紙とステッカーへの再設計](../decisions/2026-09-08-paper-sticker-redesign.md)、[もう少し面白くする](../decisions/2026-09-09-more-fun-paper-stickers.md)、[ポスターの上に机の跡を残す](../superpowers/specs/2026-09-15-desk-play-refresh-design.md)、[完了済み仕様](../superpowers/completed/specs/2026-05-09-home-hero-opening-design.md) に残す。
