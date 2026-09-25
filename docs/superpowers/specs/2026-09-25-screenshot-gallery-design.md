# 個別ページにスクショギャラリーを足す

ステータス: 採択
最終更新日: 2026-09-25

参照: Issue #50、[アプリ詳細ページのデザイン](../../design/app-page.md)

## 背景

個別ページの `#screenshots` は、registry の画像を同じ大きさの枠で wrap して並べている。一覧にはなるが、1 枚を選んで見るギャラリーではない。所有者はスクショギャラリーを足したい。

現行の掲載画像はすべて縦長（おおよそ 9 / 19.5）。黒ベタのモックは使わない。プロダクトはモーダルを持たない。

## 検討した案

1. **ページ内の featured + サムネ**（採用）
   大きい 1 枚と、その下のサムネで切り替える。dialog を出さない。紙面の 1 段組に収まる。
2. 横スクロールの snap レール
   モバイルでは自然だが、いまの縦長枠を並べると横幅だけが主張する。選んでいる 1 枚が主役にならない。
3. lightbox / dialog
   製品ロック（検索・フィルタ・モーダルなし）に反する。採用しない。

## 決定

`src/components/ScreenshotGallery.tsx` を client コンポーネントとして詳細ページだけに置く。データは registry の `screenshots`。ホームには置かない。

- セクション id は `#screenshots` のまま。英語見出し `Screenshots` は変えない。
- 先頭が featured。2 枚以上のときだけサムネと Previous / Next を出す。
- サムネをクリックすると featured が同じファイルに変わる。
- ギャラリー内にフォーカスがあるときだけ左右キーで前後する。ページ全体の矢印は奪わない。
- 端は循環する。
- 1 枚だけのアプリは featured のみ。操作は出さない。
- `dialog` / `role="dialog"` は置かない。拡大オーバーレイも置かない。
- 枠は 1px 罫線と `--shadow-sticker`。黒ベタ背景は使わない。`object-fit` は `contain`（枠外へはみ出して切らない）。
- featured の枠は `aspect-ratio: 9 / 19.5`、幅は `min(360px, 100%)`。
- 切替は即時。自動再生もクロスフェードも持たない。`prefers-reduced-motion` 用の例外分岐は不要。
- 英語 chrome（Previous / Next、件数 `1 / 4`）。alt は日本語のまま（`${name} スクリーンショット ${n}`）。
- CTA「機能を見る」は `#features` のまま。ギャラリーへの新しい CTA は足さない。
- 切替の純粋関数は `src/lib/screenshot-gallery.ts` に置き、Vitest で先に固定する。

## 入れない

- lightbox、モーダル、フルスクリーン
- ホームのギャラリー、Play 机へのスクショ
- 新規イラスト、紙ノイズ、デバイスフレーム画像
- 自動スライド、スクロール連動
- 検索、フィルタ、画像の差し替え

## 受け入れ

- スクショがある詳細で、featured 1 枚が registry 先頭を表示する
- 2 枚以上ならサムネ数が registry 件数と一致し、クリックと左右キーで featured の src が変わる
- `dialog` が無い
- 旧 `.shot-row` の wrap 中央揃えテストは、ギャラリーの featured / サムネ検証に置き換える
- `npm run verify` が通る
