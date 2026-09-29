# トップページのデザイン

ステータス: 確定
最終更新日: 2026-09-29

実装は `src/app/page.tsx` と `src/components/`。Issue #65 の依頼「CafLog のようにホームももっとオシャレに」に合わせ、**制作机の写真と、濃紺・赤の力強い作品ギャラリー**へ刷新する。Issue #61 で追加した実画面の展示と制作の背景、従来のビニールステッカーの遊びを引き継ぐ。以下の意匠は、従来のクリーム紙・電圧ブルー・細い見出し・行の索引というホームの仕様を更新する。

## Issue #65: 写真と実画面で作品を紹介する

- 画面幅いっぱいのオリジナル制作机写真を Hero に置く。写真は雰囲気を伝える素材で、本人の実際の机やアプリの実画面とは扱わない。実画面は registry のスクリーンショットを使う。生成・保存の記録は [ホームの画像素材](home-assets.md) に残す。
- Nav は濃紺 `#071629`、ブランドは `AppLibrary` と作者名。Hero の紹介文は同じ濃紺の不透明な面に置き、白い太いサンセリフ見出しと赤 `#d7193f` の CTA で作品へ案内する。写真の明暗で本文の可読性が変わらない構造にする。
- ホーム本文の light は背景 `#f5f5f2`・文字 `#12202c`、dark は背景 `#0c1721`・文字 `#f7f7f4`。保存した light / dark の切替は本文にも反映する。Nav と Hero は両テーマとも濃紺を保つ。
- 作品一覧は広い画面で2列、スマートフォンでは1列のカード。各カードに最初の実スクリーンショット、アイコン、名前、カテゴリ、紹介文、未公開などの状態、プラットフォーム、年を添える。カード全体は個別ページへの通常のリンクで、検索・フィルタ・モーダルは持たない。画面のプレビューは補助的な画像なので `alt=""` とし、アプリ名の重複読み上げを避ける。
- `AppSpotlight` は Hero から、作品一覧の次の専用セクション `.home-showcase` へ移す。registry のアイコンを選ぶと、実画面・状態・詳細リンクをまとめて切り替える。初期値は registry の先頭。画像が未登録ならアイコンで紹介する。自動送り、選択の永続化、乱数、別のデータカタログは持たない。
- 展示のボタンは `aria-pressed`、選択内容は `aria-live` で通知する。キーボードでも選べる。画像内の文字は日本語のまま、操作ラベルは日英に対応する。アプリ自体をこのページで操作するデモではない。
- 制作の背景、更新ノート、連絡先、法務リンクと折りたたみ式の奥付を残し、作品ギャラリーに合う余白と文字組みに整える。実績・利用人数・販売状況などの架空データは足さない。問い合わせは実在する X / GitHub のリンクへ誘導する。
- `.desk-tape`、`TOKYO '26` の `.desk-stamp`、Klee One の `.desk-hint` とドラッグできるビニールを残す。新しい写真・カードの上でも文字や操作を覆わない。

## スタイルとアクセシビリティの境界

- ホームの追加意匠は `src/styles/studio.css`。`.poster` を起点にスコープを限定し、共通の `tokens.css` の紙・インクの名前や、詳細・法務の行長・配色を変更しない。ホームの本文背景を body に適用する場合も、ホームがある時だけに限る。
- 主見出しと UI は Inter を含むサンセリフ。日付・番号は JetBrains Mono、手書き合図とステッカーの鉛筆メモは Klee One。本文の日本語は OS のゴシックへフォールバックする。Bricolage Grotesque は使わない。
- Klee One は Fontworks の Regular を SIL OFL 1.1 で自己ホストする（`src/fonts/`、`next/font/local`、`preload: false`）。配布物の由来と作り方は `src/fonts/README.md` に残す。
- 写真や実画面と区別できる不透明な背景で本文のコントラストを保つ。E2E は色を上書きせず、実際の light / dark 配色で axe の `color-contrast` と操作名を判定する。
- 自動で動くのは初回訪問の Hero 文字送りと、ホームのシールのごく小さい呼吸・初回の着地だけ。スクロール連動や自動送りを追加しない。`prefers-reduced-motion` では自動モーションを止める。
- テーマと言語の localStorage、初回描画前の適用、`SiteStateProvider` は維持する。本文が日本語の箇所には `lang="ja"` を残し、操作ラベルを日英で切り替える。

## 画面構成

1. `Nav`: AppLibrary と作者名、各セクションへのアンカー、言語・テーマ切替。640px 以下ではアンカーを畳む。Nav は初期配置のシールより上に置く。
2. `Hero`: 横幅いっぱいの写真、濃紺の紹介面、太い見出し・紹介・拠点・赤い CTA。`#top`、`.hero-h1`、`.hero-note`、`.cta-btn` はシール計測の基点として維持する。
3. `AppsSection`: `#apps` の見出しと件数、2列／1列の作品カード。`.app-row` を保ち、ステッカーと `slug` で相互にハイライトする。`.desk-tape` は見出し文字の背面に置かない。
4. `AppSpotlight`: 一覧の後の `.home-showcase.section`。実画面を選んで見る専用の展示。
5. `Workshop` / `Posts` / `Contact`: 制作の考え方、更新ノート、作者への連絡先。
6. `Footer`: 折りたたみ式の奥付、著作権表示、プライバシーと利用規約への導線。「ならべ直す」はフッター付近に残し、シールを初期位置へ戻す。

### シールの配置と計測

`Stickers` は Nav の次（`main` より前）に置き、初期表示で見えるシールへキーボード順を寄せる。`.poster` 全体を机として扱い、ページが長くなっても viewport 固定にはしない。

配置カタログは `src/lib/sticker-desk.ts` の `DESK_ITEMS`。SubLog と CafLog は Hero 周辺、Dev-Tools は一覧見出し付近、PayCycle・Swift・一人制作はフッター付近の山、Tokyo は余白のある幅では拠点メモの脇に置く。狭い幅では一部を山へ戻す。初期配置は Hero 本文・CTA・展示のボタンとリンク・最初の作品カードを覆わず、横スクロールを作らない。

`useLayoutEffect` が見出し・拠点メモ・CTA・`#apps .section-head` を測って `.poster` に `--desk-h1-right` / `--desk-h1-top` / `--desk-note-right` / `--desk-note-top` / `--desk-cta-bottom` / `--desk-apps-top` を書き、`data-desk="ready"` を付ける。React は `.poster` の style / data-desk を持たない。言語・幅の変更でも測り直す。`anchor` はカタログ上の役割で、他のスロットのレイアウト計算には使わない。

受け入れ検証は AC-3 に対応する `tests/e2e/site.spec.ts`。写真とスクリーンショットの読込、カードの列数とリンク、展示の選択、320〜1280px の操作到達性、初期配置の非重複、ドラッグ・リセット・スクロール・キーボード、保存テーマと言語、詳細・法務からの往復を確認する。

## ステッカーの実装

計算は `src/lib/drag.ts` の純粋関数（`moveOffset` / `clampOffset` / `isTap` / `baseBox`）に分け、`tests/drag.test.ts` が検証する。ポインタ処理は `src/components/VinylSticker.tsx`。ホームの机は `src/components/Stickers.tsx` が `DESK_ITEMS` とオフセットを持つ。クランプ矩形は `paperBounds`。

- `pointerdown` で掴んだ時点のオフセットと矩形を控え、`setPointerCapture` する。移動量は**掴んだ時点のオフセット**へ足す（現在値へ足すと二重加算になる）。
- オフセットは `.poster`（紙）へクランプする。下方向だけ初期の山のはみ出し分を許す。viewport 固定にはしない。E2E が初期表示とドラッグ後の両方で `scrollWidth <= clientWidth` を確認する。
- 移動量がしきい値未満なら「タップ」として個別ページへ遷移する。各アプリステッカーは `<Link>` なのでキーボードでは通常のリンクとして動く。DOM 順は Nav の次なので、作品カードより先にシールへフォーカスが付く。
- アプリ名はシールに書かない。飾りステッカー（Swift / Tokyo / 一人制作）は装飾なので `aria-hidden`。一人制作は言語を切り替えない。
- 形は slug ごと（`StickerShape`: SubLog 角丸四角、CafLog 円、Dev-Tools squircle、PayCycle やや大きい角丸）。alpha / beta だけ右下に小さな `α` / `β`（`.sticker-stamp`）。release は印なし。
- 掴んでいる間だけ少し大きくする（おおよそ `scale(1.06)`）。`prefers-reduced-motion` では拡大しない。傾きとドラッグ自体は残す。
- アプリシールをホバー / フォーカス / 掴んでいる間、近くに短い鉛筆メモ（`.sticker-caption`、`stickerNote`、`lang="ja"`、Klee One、`pointer-events: none`）を出す。離すと消える。英語 UI でも日本語のまま。飾りシールには出さない。
- 最後に掴んだ枚の `--layer` を上げて一番上へ残す。
- ホームの `.sticker-slot` だけ、`--breathe-y` / `--breathe-r` で常時わずかに呼吸する（平行移動 1.5px 以下、回転 0.35deg 以下。Hero 隣接の SubLog / CafLog / Tokyo は縦だけ）。本体の `--dx` / `--tilt` / `--spin` は触らない。着地の stagger は不変の `--settle-order`。掴み中は呼吸だけ pause。初回の `data-hero-opening="play"` のときだけ、同じスロットが一度着地する。自動モーションを止める手段は `prefers-reduced-motion`（`animation: none` と変数 0）。個別ページの標本スロットは静止。

レビューで判明した制約と対処。

- **クランプは掴んだ時点の矩形に基づく。** ドラッグ後にウィンドウを変えると保証が切れるため、`html` へ `overflow-x: clip` を掛けて横スクロールの防波堤にし、`resize` で机の配置へ戻す。`clip` は `hidden` と違いスクロールコンテナを作らない。`.poster` には overflow clip を掛けない（下方向のはみ出しを切らないため）。
- **クリック抑止フラグは `onClick` で消費して戻す。** 戻さないと、以降のキーボード Enter や支援技術からの click（`pointerdown` を伴わない）まで抑止し続ける。E2E がドラッグ後の Enter 遷移を確認する。
- **`touch-action` は `none` ではなく `pan-y`。** 縦スクロールはページの主要な操作なので奪わない。指を縦に動かすと `pointercancel` が来てドラッグは中止される。横から始めたジェスチャだけ受け取る。
- **`held` は掴んだ本人だけが解除する。** 2 本指で 2 枚掴んだとき、片方を離しても他方の表示を巻き込まない。
- **FOUC スクリプトも列挙値を検証する。** `readStorage` と同じく `dark` / `en` だけを受け付け、それ以外は既定のままにする。

## 作品カードとステッカーの相互ハイライト

共有状態は `src/lib/activate.tsx` の薄い `ActivateProvider` が持つ。一覧とシールが DOM 上で離れるため props の兄弟共有は使えない。`page.tsx` は Server Component のまま、provider だけを client にする。専用の大きな Context は増やさない。

- **ホバーとフォーカスは別系統で持つ**（`hoverSlug` / `focusSlug`、表示は `focusSlug ?? hoverSlug`）。1 本にまとめると、キーボードで行にフォーカスした状態で別の要素にマウスを乗せて離れただけで、フォーカス由来のハイライトまで消える。`onActivate(slug, source)` の `source`（`src/lib/activate.tsx`）でどちらの系統か伝える。
- 一致した側に `is-linked` を付ける。作品カードは通常の hover と同じ反応を使う。ステッカーは持ち上げるだけで、回転・拡大はしない（実際に掴んだときの反応と混同させないため）。
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
