"use client";

import Link from "next/link";
import type { App } from "@/data/schema";
import { apps } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import { statusLabel } from "@/lib/labels";

/**
 * 一覧は行の索引として描く。
 * 検索・絞り込み・モーダルは掲載数に対して過剰だったため持たない。
 * 行全体が個別ページへのリンクで、詳細（機能・スクリーンショット・配布先）はそちらが持つ。
 */
export function AppsSection() {
  const { prefs, t } = useSiteState();

  return (
    <section className="section" id="apps">
      <div className="section-head">
        <h2 className="section-title">{t.section_apps}</h2>
        <span className="section-count">{apps.length}</span>
      </div>
      <ul className="app-list">
        {apps.map((app) => (
          <li key={app.slug}>
            <Link
              className="app-row"
              href={`/apps/${app.slug}/`}
              // hover 時の色はアプリ自身の accent を使う。サイトの 1 色で塗り潰さない。
              style={{ "--row-accent": app.accent } as React.CSSProperties}
            >
              <span className="app-row-icon">
                {/* 静的出力のため素の img を使う。next/image の最適化は使わない。 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/apps/${app.slug}/${app.icon}`} alt="" loading="lazy" />
              </span>
              <span className="app-row-main">
                <span className="app-row-name">{app.name}</span>
                <span className="app-row-tagline" lang="ja">{app.tagline}</span>
              </span>
              <span className="app-row-meta">
                <StatusMark app={app} lang={prefs.lang} label={statusLabel(app.status, t)} />
                <span className="app-row-platforms">{app.platforms.join(" ")}</span>
                <span className="app-row-year">{app.year}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** リリース済みは既定なので印を出さない。開発中・テスト中・公開終了だけ知らせる。 */
function StatusMark({ app, lang, label }: { app: App; lang: string; label: string }) {
  if (app.status === "release") return null;
  return <span className="app-row-status" lang={lang}>{label}</span>;
}
