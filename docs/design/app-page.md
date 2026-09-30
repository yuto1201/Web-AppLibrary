# アプリ詳細ページのデザイン

ステータス: 確定
最終更新日: 2026-09-30

`src/app/apps/[slug]/page.tsx` が registry から `/apps/<slug>/` を静的生成する。共通ページを HTML としてコピーしない。CafLog・SubLog・PayCycle はそれぞれ専用コンポーネントとスコープした CSS を使い、アプリの情報は引き続き同じ registry から渡す。

## 共通の紙面（現在は Dev-Tools の詳細と各アプリの法務）

- キャンバス: 法務ページの `.app-shell` は `--paper` / `--ink`。共通の詳細ページだけ `data-tone` で組みを変える。Dev-Tools は冷たい紙の升（ヒーローを 1px の枠で囲み、機能は罫線の格子。640px 以下は 1 列）。見出しの文字色はインクのまま。`[data-theme="dark"]` では共通の詳細も暗い紙へ戻し、アクセントだけ明るくする。`--app-*` の名前は残す。紫ピンクの放射グラデと `color-scheme: light` 固定は持たない。
- Hero: 戻るリンク、名前（`--font-display`・インク・字重 400）、タグライン（`--ink-2`、グラデ文字なし）、紹介、プラットフォーム、outlined pill の CTA。行長は `--measure` で左揃え。ホームの `<Nav />` は載せない。アイコンは標本ビニール 1 枚だけ（`.specimen-slot` 120px。印刷用の `.hero-icon` は置かない）。アイコンが無いアプリには置かない。リンクではない。`aria-hidden`。`src/components/SpecimenSticker.tsx` が `VinylSticker` を `href` なしで載せ、クランプは `.app-shell`（`shellBounds`）。viewport 固定にしない。離した位置に残る。リサイズで机と同様にオフセットを捨てる。法務ページ（アプリ `/privacy/` `/terms/`、サイト `/privacy/` `/terms/`）とトップには置かない。テープ・日付印・手書き合図は置かない。標本スロットはホームの呼吸を継承しない。`status !== release` のときだけ、索引と同じ状態ラベル（`statusLabel(..., i18n.ja)`）をヒーローへ出す。
- Features: registry の `{ title, description }` を 1px 罫線の格子で表示。絵文字は置かない。`icon` は registry の必須欄のまま描かない。英語見出しは Newsreader 400。影のあるカードにはしない。
- Screenshots: `public/apps/<slug>/screenshots/` の実ファイルを registry の順序で、ページ内ギャラリーとして表示する。先頭が featured。2 枚以上ならサムネと Previous / Next、ギャラリー内フォーカス時の左右キー。`dialog` は出さない。枠は 1px 罫線と `--shadow-sticker`。`object-fit: contain`。黒ベタ背景は使わない。alt は日本語。
- Footer: `/apps/<slug>/privacy/` とトップへの導線。字重 400。
- アプリ法務: 言語見出しは `h2`（20px）、条項は `h3`（18px・上余白も一段小さく）。字重はどちらも 400。条項見出しを本文より小さくしない。
- CTA: 共通詳細の配布先は、そのアプリのアクセント色の outlined pill。「機能を見る」はインクの outlined pill。塗りグラデと浮き上がりは持たない。ホームの CTA は [トップページの仕様](top.md) に従う。

## CafLog の専用ページ

Issue #69 のユーザー依頼により、サイトの色と形を実際の CafLog アイコン・アプリ画面へ合わせて作り直す。Issue #63 で採用した Red Bull 参考の写真・濃紺・赤の構成は履歴として残し、現在のページは実画面が主役の明るい構成を使う。

- 構成: `src/components/CafLogPage.tsx` と `src/styles/caflog.css`。ルートは `/apps/caflog/` のまま、`.caflog-site` を境界にする。CafLog の `h1`、大きな `.caflog-headline`「一杯ずつ、自分のペースへ。」、実際のホーム画面を使う `.caflog-hero`、機能、実画面ギャラリー、配布先と戻る導線を持つ。
- 配色: 明るい地色 `#faf9f7`、文字と主要 CTA は `#202024`、CTA の文字は白。実アイコンを反映するオレンジ `#ff911c` とピンク `#ff79b0` を装飾に使い、淡いグレー・ラベンダー・ピーチの丸い面を組み合わせる。本文と操作は読みやすい文字色を使う。保存された light / dark にかかわらず、この明るい専用配色を保つ。テーマや言語の保存値は変更せず、日本語本文のコンテナには `lang="ja"` を付ける。
- 素材: 既存の `public/apps/caflog/icon.png` と `screenshots/4.png` を Hero で紹介する。画面の内容や配色は加工しない。ギャラリーは `1.png` から `5.png` まで registry の順序を維持する。旧生成写真は現行ページから参照せず、[素材の履歴](caflog-assets.md) として保持する。
- 内容: 名前、紹介、6件の機能と配布先は registry に従う。3つの導入カードから対応する機能へ移動できる。Pro 表記と、体内残量がモデルに基づく推定値である旨を維持する。新しいアプリ機能や医療上の効果、利用者数などの根拠のない主張を追加しない。
- 操作: `#features` と `#screenshots` へページ内リンクを設ける。機能は registry の全件を表示し、`ScreenshotGallery` のサムネイル、Previous / Next、左右キー、選択状態、代替テキストを維持する。モーダルは出さない。
- 戻る導線: 実際の App Store URL、`/apps/caflog/privacy/`、`← AppLibrary` を維持する。CafLog の法務ページは引き続き共通の紙面で、保存されたテーマに従う。
- 検証: desktop/mobile で画像、ページ内リンク、ギャラリー操作、実配色のコントラスト、保存 dark、法務・トップとの往復を確認する。320 / 393 / 768 / 1280px で実画面・実アイコンの読込、横方向へのはみ出し、主要 CTA とギャラリーの操作到達性・タッチ領域を確認する。

## SubLog の専用ページ

Issue #67 のユーザー依頼により、[指定された Ventriloc の参照デザイン](https://styles.refero.design/style/f99aca3e-5289-4595-a7cc-77a72052f4b8) の余白と面の構成を参考に刷新する。青を主色、黄緑を差し色とし、実アイコンの「SUB」が組み合わさった丸い立方体を、角の丸い面と立体感に反映する。従来の藤の紙・帳面・標本ビニールの指定は SubLog の詳細に限って置き換える。

- 構成: `src/components/SubLogPage.tsx`、`SubLogOverview.tsx` と `src/styles/sublog.css`。ルートは `/apps/sublog/`、境界は `.sublog-site`。実テキストの `h1` は SubLog、大きな見出しは「サブスクを、すっきりひとまとめ。」。支払いの表示例、紹介、実画面ギャラリー、6件の機能、質問と配布先を持つ。
- 配色: 青 `#087bf4` と濃い青 `#0960d5`、黄緑 `#c6f36a`、明るい地色 `#f7f8f5`。主要 CTA は濃い青地に白文字。保存した light / dark にかかわらず専用配色と `color-scheme: light` を保ち、設定自体は書き換えない。本文のコンテナは `lang="ja"`。
- 表示例: 1,490円・980円・1,200円の3件を、月額合計3,670円と年額合計44,040円で切り替える。「表示例」と年額は12か月分の換算であることを明示し、利用者のデータや節約実績として扱わない。月額・年額ボタンは `aria-pressed`、金額は `aria-live` を持ち、Enter / Space でも操作できる。
- 内容と操作: 名前・機能・配布先は registry に従う。実アイコンと4枚の実スクリーンショットを使い、既存の `ScreenshotGallery` のサムネイル、前後ボタン、左右キーと代替テキストを維持する。`#features`、`#screenshots`、質問へのページ内リンクを設ける。架空の利用人数や節約効果は追加しない。
- 戻る導線: 実際の App Store URL、`/apps/sublog/privacy/`、`← AppLibrary` を維持する。SubLog の法務ページは共通の紙面のままで保存テーマに従う。ホームのドラッグできる SubLog アイコンには変更を加えない。
- 検証: desktop/mobile の実配色・画像・ギャラリー・法務往復に加え、表示例の切替とキーボード操作、320 / 393 / 768 / 1280px の横はみ出しと操作可能性を確認する。共通詳細の標本シールと dark 見出しの検証は Dev-Tools で継続する。

## PayCycle の専用ページ

Issue #72 のユーザー依頼により、[指定された参照デザイン](https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e) の文字組みと余白を参考に全面刷新する。新しい P のアイコンと現行アプリの実画面を使い、従来の給与日の赤線と標本ビニールの指定を PayCycle の詳細に限って置き換える。

- 構成: `src/components/PayCyclePage.tsx` と `src/styles/paycycle.css`。ルートは `/apps/pay-cycle/`、境界は `.paycycle-site`。実テキストの `h1` は PayCycle、大きな見出しは「お金の流れに、見通しを。」。実画面を使う Hero、紹介、機能、実画面ギャラリー、質問、サポートと法務への導線を持つ。
- 配色: 明るい紙 `#f6f4f0` と濃紺 `#0f141b` に赤・黄のアクセントを組み合わせる。保存したテーマによらず専用の配色を保ち、本文は `lang="ja"`。保存テーマと言語は書き換えず、法務ページへ戻ると既存のテーマが適用される。
- 素材: `public/apps/pay-cycle/icon.png` を iOS アプリの `AppIcon.appiconset/AppIcon-Default.png` にある新しい P のアイコンへ更新する。実スクリーンショット `1.png`〜`5.png` は、2026-09-30 に現行アプリ（commit `244638d0`）のサンプルデータで撮影した `screenshots-1.1-retake` を使用する。Hero は `screenshots/1.png` を使う。アイコンはPCでは紹介文の上、スマートフォンでは実画面の上に独立して置き、画面と重ねない。実画面に機能や数値を描き足さない。ギャラリーは registry の登録順で5枚を表示し、サムネイル・前後ボタン・左右キーと日本語の代替テキストを維持する。
- 内容: 紹介と6件の機能は registry を参照する。現在の案内は `1.1（準備中）`、状態は `alpha`、App Store URL は `null`。アプリを配布中と表示せず、ダウンロード先を捏造しない。紹介ページの公開とアプリの配布状態を混同しない。
- 操作と導線: `#screenshots`、`#features`、`#questions` へ移動でき、質問は標準の `details` を使う。`サポート`、`/apps/pay-cycle/privacy/`、`/apps/pay-cycle/terms/`、`AppLibrary` への導線を維持する。日英の法務本文・問い合わせ先・公開 URL は変更しない。共通の OGP 画像 `public/ogp.png` は新しいアイコンを反映して再生成する。
- 検証: 既存の直接ロード・metadata・機能・実画面・法務往復・runtime・コントラストに、ページ内リンクとギャラリーのキーボード操作、320 / 390 / 1280px の横はみ出し、保存した dark / en と法務から戻った後の配色確認を加える。標本シールの静止・ドラッグは Dev-Tools で引き続き検証する。

## 共通の境界と公開情報

共通 CSS は `src/styles/app-page.css`、基本トークンは `src/styles/tokens.css`。App Router は遷移後も読み込んだ global CSS を保持するため、共通のアプリ詳細と全アプリの privacy / terms は `.app-shell`、CafLog 詳細は `.caflog-site`、SubLog 詳細は `.sublog-site`、PayCycle 詳細は `.paycycle-site` で包み、各コンポーネント規則をその配下へスコープする。ブラウザ余白とオーバースクロールの色は `body:has(.app-shell)` / `body:has(.caflog-site)` / `body:has(.sublog-site)` / `body:has(.paycycle-site)` の条件付き指定に限る。`:root` や無条件の `body`、汎用の `.hero` などへアプリ固有の規則を追加しない。`--app-*` / `--glass-*` の既存名を維持する。掲載画像は正方形アイコン（128px 以上）と縦長スクリーンショットを使用する。

プライバシー本文は `src/data/privacy/<slug>.ts` に保持し、`src/data/privacy/registry.ts` へ同じ slug で登録する。現在の詳細ページは常に privacy リンクを表示するので、追加時には本文と生成 URL が実在することを必ず検証する。registry のアプリと本文の対応はテストで完全一致を要求する。

URL・見出し・戻り導線・画像読み込みに加え、アプリ詳細からトップとサイト法務ページへ client-side navigation した後の配色を `tests/e2e/site.spec.ts` で確認する。過去の設計は [旧仕様](../superpowers/completed/specs/2026-05-09-app-page-design.md) に残すが、現行の実装手順ではない。
