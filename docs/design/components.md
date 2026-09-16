# 共通コンポーネント

ステータス: 確定
最終更新日: 2026-09-16

ホームは `src/app/page.tsx` が `ActivateProvider` の中で組み立てる。個別ページは registry から静的生成し、ホームの `Nav` / `Stickers` は載せない。`GlassFilter` / `AppCard` / `AppModal` / `useReveal` は現行 `src/` に無い。

- `Nav`: 言語・テーマ切替。旧 Tweaks パネル、検索、フィルタ、モバイル専用メニューは無い。
- `Hero`: 文字 span による初回だけの立ち上がり。見出しの aria-label を維持し、文字 span は aria-hidden。机の印として `TOKYO '26` と手書き合図を置く。どちらもドラッグしない。
- `AppsSection`: registry の索引行。行全体が詳細 URL。ホバー色はアプリ自身の `accent`。
- `Stickers` / `VinylSticker`: 机のビニール。配置は `src/lib/sticker-desk.ts`。クランプは `paperBounds`。アプリ名はシールに書かない。ホームのスロットだけ CSS で呼吸する。
- `SpecimenSticker`: 詳細 Hero の唯一のアイコン（120px の標本ビニール）。リンクではない。クランプは `shellBounds`。法務ページには置かない。idle は持たない。
- `Posts` / `Contact` / `Footer`: お知らせ、連絡先、法務導線。フッターは奥付を持つ。
- `SiteStateProvider`: theme / lang を `applibrary_state` に保存。初回の inline script と hydration 後の属性適用を両方維持する。accent / layout / density / font は UI から切り替えない。

Hero の再生履歴は sessionStorage の `applibrary_hero_seen`。開発時に消して再読み込みすると再生できる。reduced-motion では再生しない。

表示ラベルは `src/lib/site-data.ts` / `labels.ts`。ステータスは alpha / beta / release / archived。未公開 URL は null を維持し、架空の配布先を作らない。
