"use client";

import { useState } from "react";
import Link from "next/link";
import { apps } from "@/data/registry";
import { useSiteState } from "@/lib/state";
import { statusLabel } from "@/lib/labels";

/** 自動送りのない、小さな試し見。掲載情報と画像は registry から読む。 */
export function AppSpotlight() {
  const { prefs, t } = useSiteState();
  const [selected, setSelected] = useState(apps[0]?.slug);
  const app = apps.find((entry) => entry.slug === selected) ?? apps[0];
  if (!app) return null;
  const index = apps.indexOf(app) + 1;
  const screenshot = app.screenshots[0];

  return (
    <section className="spotlight" aria-labelledby="spotlight-heading">
      <div className="spotlight-heading">
        <h2 id="spotlight-heading">{t.spotlight_title}</h2>
        <span className="spotlight-edition" aria-hidden="true">APP STUDY — {String(index).padStart(2, "0")}</span>
      </div>
      <div className="spotlight-stage">
        <div className="spotlight-screen" data-kind={screenshot ? "screen" : "icon"}>
          {/* 静的出力でも実画面を表示する。スクリーンショット内の文言は日本語。 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={app.slug}
            src={screenshot ? `/apps/${app.slug}/screenshots/${screenshot}` : `/apps/${app.slug}/${app.icon}`}
            alt={`${app.name} — ${screenshot ? t.spotlight_screen : t.spotlight_icon}`}
            width={220}
            height={screenshot ? 478 : 220}
          />
        </div>
        <span className="spotlight-seal" aria-hidden="true">Small apps.<br />Made with care.</span>
      </div>
      <div className="spotlight-picker" role="group" aria-label={t.spotlight_choose}>
        {apps.map((entry) => (
          <button
            key={entry.slug}
            type="button"
            aria-label={entry.name}
            aria-pressed={entry.slug === app.slug}
            aria-controls="spotlight-info"
            onClick={() => setSelected(entry.slug)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/apps/${entry.slug}/${entry.icon}`} alt="" width={36} height={36} />
          </button>
        ))}
        <span className="spotlight-pick-hint">{t.spotlight_choose}</span>
      </div>
      <div id="spotlight-info" className="spotlight-info" aria-live="polite" aria-atomic="true">
        <div className="spotlight-meta"><span>{app.platforms.join(" / ")}</span><span>{statusLabel(app.status, t)}</span></div>
        <Link className="spotlight-link" href={`/apps/${app.slug}/`}>
          <span>{app.name}</span><span className="spotlight-link-label">{t.spotlight_open} <span aria-hidden="true">↗</span></span>
        </Link>
        <p lang="ja">{app.tagline}</p>
      </div>
      {screenshot && <span className="visually-hidden" lang={prefs.lang}>{t.spotlight_static}</span>}
    </section>
  );
}
