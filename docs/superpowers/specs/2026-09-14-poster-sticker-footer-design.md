# ポスター紙面とフッターのシール山

ステータス: Issue #31 実装中
最終更新日: 2026-09-14

参照: [Drive Capital / The Summer Drive](https://styles.refero.design/style/241ebab6-1f3a-4637-8754-4f6b164ea090)（紙面）、[Inspora: Interactive sticker footer](https://www.inspora.design/posts/sticker-footer)（遊び）

## 背景

Issue #21 / #23 でトップは「紙とステッカー」になった。静かな紙面は残っているが、遊びが中央の狭い帯に閉じている。シールは角丸カード＋名前の統一フォーマットで、アプリの個性がアイコン色以外に出ない。

所有者の要望は次の 3 点。

1. つまめる範囲を画面全体へ広げる。
2. サイト全体を Drive Capital 系のポスター（クリーム紙、電圧ブルー、広い余白、影なし）へ寄せる。
3. シールは Wandor 型の切り抜きビニールとしてフッターに山積みし、遊びの例外にする。

カタログとしての探しやすさは残す。一覧行は残し、シールとの相互ハイライトも残す。新規イラストは描かない。既存アイコンをビニール化する。

## 決定

紙面はポスター、シールだけが物理的な遊び、という役割分担にする。実装は Issue を 2 本に分け、**公開の完成形は 2 本目まで揃った状態**とする。

- Issue A: [#30 トップをポスター紙面へ寄せる](https://github.com/yuto1201/Web-AppLibrary/issues/30)
- Issue B: [#31 シールをフッターの山にし、ページ全体でつまめるようにする](https://github.com/yuto1201/Web-AppLibrary/issues/31)

### 1. ポスターの紙面

トークン名は維持し、値を寄せる。`--glass-*` は復活させない。

| トークン | 値 | 役割 |
|---|---|---|
| `--paper` | `#fff8f1` | キャンバス |
| `--ink` | `#000000` | 本文 |
| `--rule` | `#e2e8f0` | 罫線 |
| `--accent` | `#0066ee` (light) / `#6eb3ff` (dark) | 見出し・ナビ・outlined 操作。本文には使わない。Drive Capital の `#006eff` はクリーム上 4.27:1 のため、16px が 4.5:1 を満たす値へ寄せた |

ダークは同じ役割の反転（濃いインク紙）。本文は明るいインク。light の `--accent` は `#0066ee`、dark は `#6eb3ff`。Drive Capital の `#006eff` はクリーム上 4.27:1、濃い紙上でも 16px が 4.5:1 を割る。紙面に影・グラデを足さない。

書体:

- Display（Latin のワードマーク・英語見出し）: `Newsreader` 400（`next/font/google`）。200 以下は本文サイズで潰れるので使わない。Editorial New / Founders Grotesk はライセンスしない。
- 本文・UI: `Inter` 300 / 400。tracking `-0.02em`。UI に 600 以上を使わない。
- 日本語は OS ゴシックへ落とす。hairline 100 の日本語見出しは作らない。
- `Bricolage Grotesque` は外す。

画面:

```
Nav（罫線 / 電圧ブルーのラベル / 言語・テーマ）
Hero（巨大見出し・メタ・outlined pill CTA）
App Library（行の索引。hover 色はアプリ accent）
Notes / Contact
Footer（奥付・法務）
  └ シール山（下端からはみ出し、ページ全体へドラッグ可）
```

Hero の文言は現行のまま（「小さなアプリを、丁寧に。」）。組版だけポスターにする。CTA は 60px 半径、1.5px `--accent` の outlined pill、塗りなし。

個別ページは既存の `app-shell`（独自トークンとグラデ）を維持し、ホームの Nav は置かない。紙面トークン変更で法務と往復が破綻しないことが受け入れ条件。詳細ページをポスター型に揃えるのは別 Issue。シール山はトップだけ。

### 2. フッターのシール山

初期配置はフッター下端の山。紙の外（下）にはみ出してよい。Wandor と同じ「ページの足元に貼ってある」見立て。

見た目:

- 既存 `public/apps/<slug>/icon.png` を白フチのビニールにする。
- ステッカー上のアプリ名は外す。名前は一覧が持つ。
- Swift / Tokyo の飾りはそのまま山に混ぜる。
- 影はシールにだけ使う（紙面の例外）。
- 最後に掴んだ枚が一番上（z-index を上げて保持する）。

ドラッグ:

- クランプ先は `.sticker-band` ではなく **ページの紙**（`main` + `footer` を含むステージ）。viewport 固定にはしない。置いた位置は紙に貼ったままスクロールする。
- 横スクロールは出さない。`overflow-x: clip` を紙の防波堤として残す。
- リサイズで進行中ドラッグを捨て、オフセットを戻す（現行と同じ）。
- しきい値未満はタップとして個別ページへ。キーボードは `<Link>`。
- `touch-action: pan-y`、`prefers-reduced-motion` で不要な補間を止める、2 本指、`lostpointercapture` は現行の契約を維持する。
- 外部ドラッグライブラリは追加しない。

状態:

- 一覧とシールが DOM 上で離れるので、`hoverSlug` / `focusSlug` は薄い client provider に上げる。`page.tsx` は Server Component のまま。専用の大きな Context は増やさない。

### 3. 持たないもの

検索・フィルタ・モーダル、Liquid Glass、新規ダイカットイラスト、鉛筆注釈、個別ページの標本シール、Drive Capital の英文ポスター丸コピー、電圧ブルー以外のサイトアクセント、viewport に張り付く HUD シール。

OGP (`public/ogp.png`) は現行どおり別 Issue。

## 検討した代替案

- **トークンだけ塗り替える。** 中央の帯が残り、参照の足元の山に届かない。
- **シールを `position: fixed` にする。** スクロールで紙から剥がれ、ポスターに見えない。
- **一覧をやめてシールだけをカタログにする。** 見た目は強いが、件数が増えたとき探しにくい。
- **アプリごとに切り抜きイラストを描く。** 工期が公開を止める。アイコンのビニール化で個性は出る。
- **青一色でアイコン色も抑える。** アプリの識別が落ちる。色はシールと一覧ホバーに残す。

## 分割

| 順 | 内容 | 公開 |
|---|---|---|
| [#30](https://github.com/yuto1201/Web-AppLibrary/issues/30) | トークン・書体・Nav / Hero / 余白 / outlined pill。個別ページはトークン追随 | 単独公開すると中央の帯がポスターに残る。**#31 と続けて公開する** |
| [#31](https://github.com/yuto1201/Web-AppLibrary/issues/31) | シールをフッターの山へ。ビニール化。クランプをページ全体へ。E2E を更新 | 完成形 |

ブランチは 1 Issue / 1 PR。#30 を先にマージしてよいかは、#31 が直後に続く前提で所有者が判断する。

## 影響

- 変更: `src/styles/standard.css`、`src/components/AppsSection.tsx`、`src/components/Stickers.tsx`、`src/app/page.tsx`、`src/lib/drag.ts`、`docs/design/top.md`、`docs/TODO.md`。
- 追加: 薄い activate provider（`src/lib/activate.tsx`）。
- 削除: `src/components/AppLibrarySection.tsx`。シール上の名前。中央の `.sticker-band`。
- 削除: `--font-display` の Bricolage 接続。シール上の名前。
- テスト: `tests/drag.test.ts` のクランプ対象。`tests/e2e/site.spec.ts` の帯幅前提（`scrollWidth <= clientWidth` を帯からページへ読み替える）。フッターから Hero 付近までドラッグできること、タップ遷移、リセット、相互ハイライト、`prefers-reduced-motion`。
- axe の `color-contrast` は実際の配色で判定する。`--accent` を本文に使わない。

## 受け入れ条件

### Issue A — ポスター紙面（#30）

- [x] light のキャンバスが `#fff8f1`、本文が黒、サイトの操作色が `#0066ee`。紙面にドロップシャドウがない。
- [x] Latin 見出しに Newsreader、UI に Inter 300/400。Bricolage が HTML に出ない。
- [x] Hero の CTA と主要ボタンが outlined pill（塗りなし、半径 60px 相当）。
- [x] 一覧行から個別ページへ遷移できる。検索・フィルタ・モーダルが無い（現行維持）。
- [x] ダークで本文とナビのコントラストが axe `color-contrast` を通る。
- [x] 個別アプリページと法務が新しい紙面トークンで破綻しない。詳細ページの `app-shell` 意匠はこの Issue の対象外。
- [x] `npm run verify` が通る。

### Issue B — シール山とページ全体ドラッグ（#31）

- [ ] 初期表示でシールがフッター下端に山積みされ、下方向にはみ出す。中央の帯がない。
- [ ] シールを Hero 付近までドラッグでき、離した位置が紙に残る（スクロールしても viewport に張り付かない）。
- [ ] 横スクロールが発生しない。
- [ ] アプリシールはアイコンのビニールで、カード上に名前が無い。タップ / キーボードで個別ページへ行く。
- [ ] 一覧 ↔ シールの相互ハイライトが、ホバーとフォーカスを混ぜない現行契約のまま動く。
- [ ] リセットで山に戻る。リサイズで進行中ドラッグが捨てられる。
- [ ] `npm run verify` が通る。独立レビュー（通常変更: 実装者と別系統）を取る。

## 検証

`npm run verify`、ローカル静的配信での light / dark / 日本語 / 英語、desktop と 640px 幅。シールはフッターからページ上方へドラッグし、スクロール後も紙座標に残ることを目視する。CI の Browser checks は必須。
