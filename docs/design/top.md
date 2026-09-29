# トップページのデザイン

ステータス: 確定
最終更新日: 2026-09-29

実装は `src/app/page.tsx` と `src/components/`。Issue #65 のレビューで「CafLog に似すぎている」との指摘を受け、[ユーザーが指定した Slush の参照デザイン](https://styles.refero.design/style/8b6b547f-a357-4f1b-9842-4579c62dd42b) をもとに、**空色の遊び場、大きな黒い文字、パステルの作品カード**へ方向を変更する。作品の実画面、制作の背景、ドラッグできるビニールステッカーを引き継ぐ。以下の仕様はホームだけに適用する。CafLog の現在の専用意匠は [アプリ詳細の設計](app-page.md) に記録する。

## Issue #65: 遊び場から作品へ

- 計測前はシールと操作案内を非表示にして旧フッター位置への描画を防ぐ。JavaScript が無効でも作品カードから全アプリへ移動できる。
- Hero 上部は `.hero-playground` としてシールのための高さを確保する。空色の上に、大きな装飾文字 `APP / LIBRARY` とオリジナルの青い立体ループを置く。装飾だけの領域には `isolation: isolate` を付け、ページ全体のシールより前へ描かない。ループは透過 WebP の `/home/playground/blue-orbit.webp`。素材は実績やアプリの画面を表すものではなく、雰囲気を作る装飾。生成・保存の記録は [ホームの画像素材](home-assets.md) に残す。
- `.hero-wordmark` は文字をアウトライン化した SVG の図形、`.hero-orbit` は透過画像。ともに `aria-hidden`、画像は空の `alt`、SVG は `focusable="false"` にする。実際の `h1` は遊び場の下の `.hero-copy` にある日本語の紹介見出しで、既存の文字送りと日英の読み上げ名を維持する。装飾ロゴを二重に読み上げない。ブランド名は Nav のテキストでも伝える。
- 基本の light は空色 `#dceeff`・文字 `#111111`。dark は夜色 `#162330`・文字 `#f2f6fa` とし、キャンバスの見出し・装飾ワードマーク・操作案内も明るくする。パステルのカード・展示・制作の背景・連絡先と明るい Nav の内側は黒い文字を保つ。保存テーマに合わせてキャンバスと面の色を切り替える。ホームの色と素材は個別ページの CSS へ波及させない。
- Nav は丸い面の中にブランド、アンカー、言語・テーマ操作を並べる。CTA と操作は黒いピルを基調にする。作品への主要 CTA は黒地に白文字。見出しと文字を写真へ重ねない。
- 作品一覧は広い画面で2列、スマートフォンでは1列のパステル色の丸いカード。各カードに最初の実スクリーンショット、アイコン、名前、カテゴリ、紹介文、状態、プラットフォーム、年を添える。カード全体は個別ページへの通常のリンク。実画面プレビューは補助的な画像なので `alt=""` とし、アプリ名の重複読み上げを避ける。
- `AppSpotlight` は作品一覧の次のラベンダー色の `.home-showcase` に置く。registry のアイコンを選ぶと、実画面・状態・詳細リンクが一緒に切り替わる。初期値は registry の先頭。画像が未登録ならアイコンで紹介する。自動送り、選択の永続化、乱数、別のデータカタログは持たない。
- 展示のボタンは `aria-pressed`、選択内容は `aria-live` で通知する。キーボードでも選べる。画像内の文字は日本語のまま、操作ラベルは日英に対応する。アプリ自体をこのページで操作するデモではない。
- 制作の背景はミント、連絡先は黄色の面で分ける。更新ノート、実在する X / GitHub、法務リンクと折りたたみ式の奥付を残す。実績・利用人数・販売状況などの架空データは足さない。
- Klee One の `.desk-hint` とステッカーの鉛筆メモを残す。遊び方はシールの下の `.stickers-foot` に置き、Hero の実際の見出しや CTA を覆わない。

## スタイルとアクセシビリティの境界

- ホームの追加意匠は `src/styles/studio.css`。`.poster` を起点にスコープを限定し、共通の `tokens.css` の紙・インクの名前や、詳細・法務の行長・配色を変更しない。body の背景も `body:has(.poster)` に限る。
- 装飾ワードマークは Inter の太字をアウトライン化した SVG、実際の主見出しは Inter を含むサンセリフの太字。日付・番号は JetBrains Mono、手書きとステッカーの鉛筆メモは Klee One。日本語は OS のゴシックへフォールバックする。Bricolage Grotesque は使わない。
- Klee One は Fontworks の Regular を SIL OFL 1.1 で自己ホストする（`src/fonts/`、`next/font/local`、`preload: false`）。配布物の由来と作り方は `src/fonts/README.md` に残す。
- 本文と操作は不透明なキャンバスとパステルの面に置く。E2E は色を上書きせず、実際の light / dark 配色で axe の `color-contrast` と操作名を判定する。キーボードのフォーカスは明るい面で青 `#164bca`、夜色のキャンバスで水色 `#91c7ff` の輪郭を使う。
- 自動で動くのは初回訪問の Hero 文字送りと、ホームのシールのごく小さい呼吸・初回の着地だけ。スクロール連動や自動送りを追加しない。`prefers-reduced-motion` では自動モーションを止める。
- テーマと言語の localStorage、初回描画前の適用、`SiteStateProvider` は維持する。本文が日本語の箇所には `lang="ja"` を残し、操作ラベルを日英で切り替える。

## 画面構成

1. `Nav`: AppLibrary と作者名、各セクションへのアンカー、言語・テーマ切替。狭い幅ではアンカーを畳む。Nav は初期配置のシールより上に置く。
2. `Hero`: 大きな装飾ワードマークと青いループ、7枚のシールの遊び場。その下に実際の見出し・紹介・拠点・黒い CTA。遊び場と本文は分ける。
3. `AppsSection`: `#apps` の見出しと件数、2列／1列の丸い作品カード。`.app-row` を保ち、ステッカーと `slug` で相互にハイライトする。
4. `AppSpotlight`: 一覧の後の `.home-showcase.section`。実画面を選んで見るラベンダー色の展示。
5. `Workshop` / `Posts` / `Contact`: ミント色の制作の背景、更新ノート、黄色の連絡先。
6. `Footer`: 折りたたみ式の奥付、著作権表示、プライバシーと利用規約への導線。

### シールの配置と計測

`Stickers` は Nav の次（`main` より前）に置き、初期表示で見えるシールへキーボード順を寄せる。初期位置は Hero の遊び場へ集め、ドラッグの範囲は `.poster` 全体を維持する。viewport 固定にはしない。

配置カタログは `src/lib/sticker-desk.ts` の `DESK_ITEMS`。4枚のアプリと3枚の装飾の計7枚を、全幅で `.hero-playground` の予約領域に置く。全項目の `anchor` は `hero`、`lift` は 0。遊び場の下端72pxは `.stickers-foot` の遊び方と「ならべ直す」のために空け、シールと重ねない。Hero 本文・CTA・展示の操作・作品カードを初期配置で覆わず、横スクロールを作らない。各シールを動かした後は「ならべ直す」で遊び場へ戻せる。

`useLayoutEffect` が `.hero-playground` を測り、`.poster` からの相対座標 `--desk-play-left` / `--desk-play-top` と `--desk-play-width` / `--desk-play-height` を書き、`data-desk="ready"` を付ける。React は `.poster` の style / data-desk を持たない。幅・言語・Hero の寸法が変わると測り直す。見出し・一覧見出し・フッターから初期位置を求める旧計測は使わない。

受け入れ検証は AC-3 に対応する `tests/e2e/site.spec.ts`。透過ループと実スクリーンショットの読込、カードの列数とリンク、展示の選択、320〜1280px と英語で7枚が予約領域内に収まること、操作と本文の非重複、ドラッグ・リセット・文書座標でのスクロール・キーボード、保存テーマと言語、詳細・法務からの往復を確認する。

## Issue #67: SubLog の専用ページとの境界

SubLog の詳細は、[ユーザー指定の Ventriloc の参照デザイン](https://styles.refero.design/style/f99aca3e-5289-4595-a7cc-77a72052f4b8) を参考に独立した `.sublog-site` へ刷新する。青を主色、黄緑を差し色とし、実アイコンの「SUB」の文字が組み合わさった角の丸い立方体を、立体感のある面と余白に反映する。明るい地色は `#f7f8f5`。ブランドの配色は保存したテーマによらず一定にし、法務へ戻ると既存の保存テーマを適用する。

- 見出しは実テキストの `SubLog` と「サブスクを、すっきりひとまとめ。」。装飾の形は読み上げ対象から外す。
- 月額・年額を切り替えられる支払いの表示例を置く。3件の例（1,490円・980円・1,200円）は月額合計3,670円、年額合計44,040円とし、「表示例」と明示する。ボタンは `aria-pressed` で選択を伝え、キーボードでも操作できる。アプリや利用者の実データ、節約実績として扱わない。
- 6件の機能説明、配布先、4枚の実スクリーンショットは registry を参照する。既存の `ScreenshotGallery` のサムネイル・前後操作・キーボード操作を維持し、表示例とは区別する。
- 専用意匠は `src/styles/sublog.css` の `.sublog-site` 内へ限定する。ホームの7枚のシールと作品カード、CafLog、共通詳細、法務本文・URL・OGP はこの刷新で変更しない。SubLog の詳細に共通の標本シールは置かず、共通詳細のドラッグ検証は Dev-Tools で継続する。

## ステッカーの実装

計算は `src/lib/drag.ts` の純粋関数（`moveOffset` / `clampOffset` / `isTap` / `baseBox`）に分け、`tests/drag.test.ts` が検証する。ポインタ処理は `src/components/VinylSticker.tsx`。ホームの机は `src/components/Stickers.tsx` が `DESK_ITEMS` とオフセットを持つ。クランプ矩形は `paperBounds`。

- `pointerdown` で掴んだ時点のオフセットと矩形を控え、`setPointerCapture` する。移動量は**掴んだ時点のオフセット**へ足す（現在値へ足すと二重加算になる）。
- オフセットは `.poster`（紙）へクランプする。上下左右の既存クランプを維持する。viewport 固定にはしない。E2E が初期表示とドラッグ後の両方で `scrollWidth <= clientWidth` を確認する。
- 移動量がしきい値未満なら「タップ」として個別ページへ遷移する。各アプリステッカーは `<Link>` なのでキーボードでは通常のリンクとして動く。DOM 順は Nav の次なので、作品カードより先にシールへフォーカスが付く。
- アプリ名はシールに書かない。飾りステッカー（Swift / Tokyo / 一人制作）は装飾なので `aria-hidden`。一人制作は言語を切り替えない。
- 形は slug ごと（`StickerShape`: SubLog 角丸四角、CafLog 円、Dev-Tools squircle、PayCycle やや大きい角丸）。alpha / beta だけ右下に小さな `α` / `β`（`.sticker-stamp`）。release は印なし。
- 掴んでいる間だけ少し大きくする（おおよそ `scale(1.06)`）。`prefers-reduced-motion` では拡大しない。傾きとドラッグ自体は残す。
- アプリシールをホバー / フォーカス / 掴んでいる間、近くに短い鉛筆メモ（`.sticker-caption`、`stickerNote`、`lang="ja"`、Klee One、`pointer-events: none`）を出す。離すと消える。英語 UI でも日本語のまま。飾りシールには出さない。
- 最後に掴んだ枚の `--layer` を上げて一番上へ残す。
- ホームの `.sticker-slot` だけ、`--breathe-y` / `--breathe-r` で常時わずかに呼吸する（平行移動 1.5px 以下、回転 0.35deg 以下。SubLog / CafLog / Tokyo は縦だけ）。本体の `--dx` / `--tilt` / `--spin` は触らない。着地の stagger は不変の `--settle-order`。掴み中は呼吸だけ pause。初回の `data-hero-opening="play"` のときだけ、同じスロットが一度着地する。自動モーションを止める手段は `prefers-reduced-motion`（`animation: none` と変数 0）。個別ページの標本スロットは静止。

レビューで判明した制約と対処。

- **クランプは掴んだ時点の矩形に基づく。** ドラッグ後にウィンドウを変えると保証が切れるため、`html` へ `overflow-x: clip` を掛けて横スクロールの防波堤にし、`resize` で机の配置へ戻す。`clip` は `hidden` と違いスクロールコンテナを作らない。`.poster` には overflow clip を掛けない（ドラッグ中のシールを切らないため）。
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
