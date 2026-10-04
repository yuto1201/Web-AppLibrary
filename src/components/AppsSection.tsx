"use client";

import Link from "next/link";
import type { App } from "@/data/schema";
import { apps } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import { statusLabel } from "@/lib/labels";
import { useActivate } from "@/lib/activate";

/**
 * 実画面を添えた作品カードとして描く。
 * 検索・絞り込み・モーダルは掲載数に対して過剰だったため持たない。
 * カード全体が個別ページへのリンクで、詳細（機能・スクリーンショット・配布先）はそちらが持つ。
 *
 * シール山との相互ハイライトは ActivateProvider が持つ。
 * 行にホバー/フォーカスすると対応するステッカーが反応し、逆方向も同様に動く。
 * ホバーとフォーカスは別系統として伝える（片方が離れても、もう片方由来の
 * ハイライトを消さないため）。
 */
export function AppsSection() {
  const { activeSlug, onActivate } = useActivate();
  const { prefs, t } = useSiteState();

  return (
    <section className="section" id="apps">
      <div className="section-head">
        <span className="desk-tape" aria-hidden="true" />
        <h2 className="section-title">{t.section_apps}</h2>
        <span className="section-count">{apps.length}</span>
      </div>
      <p className="section-intro">{t.apps_intro}</p>
      <ul className="app-list">
        {apps.map((app, index) => (
          <li key={app.slug}>
            <Link
              className={`app-row${app.slug === activeSlug ? " is-linked" : ""}`}
              href={`/apps/${app.slug}/`}
              // hover 時の色はアプリ自身の accent を使う。サイトの 1 色で塗り潰さない。
              style={{ "--row-accent": app.accent } as React.CSSProperties}
              onMouseEnter={() => onActivate(app.slug, "hover")}
              onFocus={() => onActivate(app.slug, "focus")}
              onMouseLeave={() => onActivate(null, "hover")}
              onBlur={() => onActivate(null, "focus")}
            >
              <span className="app-row-visual" aria-hidden="true">
                <span className="app-row-visual-label">{String(index + 1).padStart(2, "0")} / {app.name.toUpperCase()}</span>
                <AppPreview app={app} />
              </span>
              <span className="app-row-body">
                <span className="app-row-icon">
                  {app.icon ? (
                    // 静的出力のため素の img を使う。next/image の最適化は使わない。
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/apps/${app.slug}/${app.icon}`} alt="" loading="lazy" />
                  ) : (
                    <span className="app-row-glyph" aria-hidden="true">{app.iconGlyph}</span>
                  )}
                </span>
                <span className="app-row-main">
                  <span className="app-row-category"><span aria-hidden="true">{String(index + 1).padStart(2, "0")} / </span><span lang="ja">{app.category}</span></span>
                  <span className="app-row-name">{app.name}</span>
                  <span className="app-row-tagline" lang="ja">{app.tagline}</span>
                </span>
                <span className="app-row-meta">
                  <StatusMark app={app} lang={prefs.lang} label={statusLabel(app.status, t)} />
                  <span className="app-row-platforms">{app.platforms.join(" ")}</span>
                  <span className="app-row-year">{app.year}</span>
                </span>
                <span className="app-row-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 18 18 6M6 6h12v12" /></svg></span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 実画面を優先し、無ければアイコン、どちらも無ければ iconGlyph を置く。 */
function AppPreview({ app }: { app: App }) {
  const screenshot = app.screenshots[0];
  if (screenshot) {
    return (
      <span className="app-preview-phone" data-kind="screen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/screenshots/${screenshot}`} alt="" width={260} height={564} loading="lazy" />
      </span>
    );
  }
  if (app.icon) {
    return (
      <span className="app-preview-phone" data-kind="icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/${app.icon}`} alt="" width={260} height={260} loading="lazy" />
      </span>
    );
  }
  return (
    <span className="app-preview-phone" data-kind="glyph">
      <span className="app-preview-glyph">{app.iconGlyph}</span>
    </span>
  );
}

/** リリース済みは既定なので印を出さない。開発中・テスト中・公開終了だけ知らせる。 */
function StatusMark({ app, lang, label }: { app: App; lang: string; label: string }) {
  if (app.status === "release") return null;
  return <span className="app-row-status" lang={lang}>{label}</span>;
}
