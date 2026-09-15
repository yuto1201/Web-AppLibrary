ステータス：確定
最終更新日：2026-09-01

---

# アーキテクチャ概要

AppLibrary は Next.js の静的出力を Vercel で配信する紹介サイト。サーバー処理・DB・認証を持たない。

## サイトマップ

| ルート | 内容 | 生成方法 |
|---|---|---|
| `/` | トップページ（Hero / App Library / Notes / Contact） | 静的 |
| `/apps/<slug>/` | アプリ詳細 | registry から静的生成 |
| `/apps/<slug>/privacy/` | プライバシーポリシー | registry + 個別本文から静的生成 |
| `/apps/<slug>/terms/` | 登録済みアプリの固有利用規約 | registry + 承認済み個別本文から静的生成 |
| `/privacy/` | サイト全体のプライバシーポリシー | 静的 |
| `/terms/` | サイト全体の利用規約 | 静的 |
| `/robots.txt` | 全公開ルートのクロール許可と sitemap の場所 | 静的 metadata route |
| `/sitemap.xml` | トップ、法務、全アプリ詳細・privacy の URL | registry から静的生成 |

`<slug>` は `src/data/registry.ts` の登録内容から決まり、アプリごとのルートを手で増やす必要はない。サイト共通の法務ページは独立した静的ルートとして管理する。

## ファイルツリー（主要部分）

```
src/
  app/
    layout.tsx              html/head、フォント、テーマ復元スクリプト
    page.tsx                トップページの組み立て
    globals.css             デザインシステムの読み込み
    robots.ts               robots.txt
    sitemap.ts              sitemap.xml
    apps/[slug]/page.tsx    アプリ詳細
    apps/[slug]/privacy/    プライバシーポリシー
    apps/[slug]/terms/      登録済みアプリの固有利用規約
    privacy/page.tsx        サイト全体のプライバシーポリシー
    terms/page.tsx          サイト全体の利用規約
  components/
    Nav / Hero / AppsSection / AppCard / AppModal / Sections
    GlassFilter.tsx         Liquid Glass の SVG フィルタ
    icons.tsx               インライン SVG アイコン
  data/
    schema.ts               zod スキーマ
    registry.ts             掲載アプリの唯一の真実
    privacy/<slug>.ts       アプリ固有の法務文書
    privacy/registry.ts     掲載 slug と法務本文の対応
    terms/<slug>.ts         承認済みのアプリ固有利用規約
    terms/registry.ts       利用規約を持つ slug の対応
  lib/
    site-data.ts            プロフィール / お知らせ / SNS / i18n
    state.tsx               設定の永続化
    labels.ts               ステータス表示の変換
    use-reveal.ts           スクロール表示
  styles/                   tokens / standard / app-page / legal
public/apps/<slug>/         アイコンとスクリーンショット
public/ogp.png               共通 OGP 画像
```

## 主要モジュール

**registry** — `src/data/registry.ts` が掲載アプリの唯一の真実。`schema.ts` の zod スキーマでビルド時に検証され、違反はビルドを落とす。フィルタの選択肢（プラットフォーム軸・カテゴリ軸）も実データから導出される。

**state** — `src/lib/state.tsx` が theme / accent / layout / density / font / lang を保持する。`localStorage` は React の外にある状態なので `useSyncExternalStore` で購読し、サーバーでは既定値を返す。

**reveal** — `src/lib/use-reveal.ts` が IntersectionObserver で `.in` を付ける。className を DOM へ直接書き込むと React の再描画で失われるため、状態として保持する。

**GlassFilter** — SVG フィルタをサーバー側で描画する。旧実装の注入スクリプトは廃止した。

## データフロー

```
registry.ts (zod 検証)
      │
      ├─→ AppsSection ─→ AppCard ─→ AppModal
      │        └ 検索 / プラットフォーム軸 / カテゴリ軸で絞り込み
      │
      ├─→ /apps/[slug]/        generateStaticParams で全件を事前生成
      └─→ privacy/registry.ts ─→ /apps/[slug]/privacy/ の本文を描画
```

`/privacy/` と `/terms/` は registry に依存しない静的ページ。全ルートの共通 OGP 画像は `public/ogp.png` を使い、各ページが固有のタイトル・説明・URL を metadata に設定する。画像の構成・素材・更新手順は [design/ogp.md](design/ogp.md) に記録する。

設定変更は `SiteStateProvider` → `<html>` の `data-*` 属性 → CSS の順に伝わる。CSS 側はトークンを属性セレクタで切り替える。

## FOUC 対策の二重構造

初回描画前のテーマ適用は `layout.tsx` のインラインスクリプトが担当する。保存値が無い場合は属性を付けないため、既定値の適用は `SiteStateProvider` の effect が行う。**どちらか一方だけを消さないこと。**

## デプロイと配信

`main` への push で Vercel が自動ビルド・デプロイする。詳細は [deploy/README.md](deploy/README.md)。

## 関連ドキュメント

- [../AGENTS.md](../AGENTS.md) — 開発規約
- [deploy/README.md](deploy/README.md) — 公開とデプロイ
- [decisions/2026-08-31-nextjs-vercel-migration.md](decisions/2026-08-31-nextjs-vercel-migration.md) — 移行の経緯
