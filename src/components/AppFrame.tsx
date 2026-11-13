"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { App } from "@/data/schema";
import { apps } from "@/data/registry";
import { appLinks } from "@/lib/app-links";
import { statusLabel } from "@/lib/labels";
import { useSiteState } from "@/lib/state";

function colorStyle(color: string): React.CSSProperties {
  return { "--app-color": color } as React.CSSProperties;
}

/** アプリのページの上の帯。トップへ戻る道、小さいシール、アプリ名、分類。 */
export function AppFrameStrip({ app }: { app: App }) {
  const { t } = useSiteState();
  return (
    <div className="app-frame-strip" style={colorStyle(app.accent)}>
      <div className="app-frame-wrap app-frame-strip-in">
        <Link className="app-frame-back" href="/">
          {t.frame_back}
        </Link>
        <span className="app-frame-crumb">
          <span className="app-frame-seal" aria-hidden="true">
            <img src={`/apps/${app.slug}/${app.icon}`} alt="" width={28} height={28} />
          </span>
          <b>{app.name}</b>
          <span lang="ja">{app.category}</span>
        </span>
      </div>
    </div>
  );
}

/** 帯 → 中身 → 「このアプリについて」→「ほかのアプリ」。 */
export function AppFrame({ app, light, children }: { app: App; light: boolean; children: ReactNode }) {
  const { t } = useSiteState();
  const links = appLinks(app);
  const others = apps.filter((other) => other.slug !== app.slug);

  return (
    <div className="app-frame" data-frame-light={light ? "" : undefined} style={colorStyle(app.accent)}>
      <AppFrameStrip app={app} />
      {children}
      <section className="app-frame-about app-frame-wrap" aria-labelledby="app-frame-about-h">
        <h2 id="app-frame-about-h">{t.about_title}</h2>
        <div className="app-frame-facts">
          <dl>
            <dt>{t.about_price}</dt>
            <dd lang="ja">{app.price}</dd>
            <dt>{t.about_version}</dt>
            <dd>{app.version}</dd>
            <dt>{t.about_platforms}</dt>
            <dd>{app.platforms.join(" / ")}</dd>
            <dt>{t.about_status}</dt>
            <dd>{statusLabel(app.status, t)}</dd>
            <dt>{t.about_category}</dt>
            <dd lang="ja">{app.category}</dd>
          </dl>
          <div className="app-frame-side">
            {links.store ? (
              <a className="app-frame-store" href={links.store} target="_blank" rel="noopener noreferrer">
                {t.about_store} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            <Link href={links.support}>
              {t.about_support} <span aria-hidden="true">→</span>
            </Link>
            <Link href={links.privacy}>
              {t.about_privacy} <span aria-hidden="true">→</span>
            </Link>
            {links.terms ? (
              <Link href={links.terms}>
                {t.about_terms} <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      <section className="app-frame-others app-frame-wrap" aria-labelledby="app-frame-others-h">
        <h2 id="app-frame-others-h">{t.others_title}</h2>
        <div className="app-frame-grid">
          {others.map((other) => (
            <Link key={other.slug} className="app-frame-card" href={`/apps/${other.slug}/`} style={colorStyle(other.accent)}>
              <img src={`/apps/${other.slug}/${other.icon}`} alt="" width={44} height={44} loading="lazy" />
              <b>{other.name}</b>
              <span lang="ja">{other.tagline}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
