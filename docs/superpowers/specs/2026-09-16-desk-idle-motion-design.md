# 机のシールに、主張しすぎない呼吸を足す

ステータス: 採択
最終更新日: 2026-09-16

参照: Issue #45、[トップページのデザイン](../../design/top.md)

## 背景

サイトは静的書き出しのまま動く。シールはつまめるが、眺めているあいだは初回 Hero 以外が止まっている。所有者は、主張しすぎない常時の動きを足して「見ているだけではない」机にしたい。

指定の GPT-6 Astra / Claude Fable 5.1 はこの環境に無い。同じ系統の GPT-5.6 Sol と Claude Opus 5 に諮った。

## 決定

常時モーションは **ホームの `.sticker-slot` の呼吸 1 系統**。初回訪問だけ、既存の `data-hero-opening="play"` で同じスロットが一度着地する。

- 実装は CSS。`@property` で `--breathe-y` / `--breathe-r` / `--settle-*` を動かす。
- `.sticker` の `transform`（`--dx` / `--dy` / `--tilt` / `--lift` / `--spin`）は `@keyframes` で奪わない。
- Hero 本文・CTA・Nav、一覧行、個別ページの標本は動かさない。
- 平行移動は 1.5px 以下、回転は 0.35deg 以下。Hero 隣接（SubLog / CafLog / Tokyo）は縦だけ、回転 0。
- 周期はシールごとに変え、同期させない。着地の stagger は `--layer` ではなく不変の `--settle-order`。
- 掴み中は呼吸だけ pause。着地中に掴んでも delay は巻き戻さない。
- 自動モーションを止める手段は `prefers-reduced-motion`（`animation: none` と変数 0）。既存の 0.01ms 短縮だけに頼らない。

## 入れない

スクロール連動、視差、粒子、CTA パルス、Hero のループ、テープの常時、鉛筆合図の点滅、標本の idle、ドラッグ後のオーバーシュート、JS の rAF 乱数、新規イラスト。

## 受け入れ

- ホームのシールは reduced-motion 以外で呼吸する
- 初回だけ着地が入り、再訪は呼吸のみ
- 標本は静止
- 見出し・CTA を覆わない
- `npm run verify` が通る
