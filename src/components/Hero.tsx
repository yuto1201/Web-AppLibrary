"use client";

import { useSiteState } from "@/lib/state";
import { profile } from "@/lib/site-data";
import { apps } from "@/data/registry";

/**
 * 1 行のテキストを 1 文字ずつ span へ分割する。
 * CSS 側が --i を遅延に使って文字送りアニメーションを行う。
 * サロゲートペア対応のため Array.from を使う。
 */
function Letters({ text, baseIndex }: { text: string; baseIndex: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={`${baseIndex + i}-${ch}`} className="hero-letter" style={{ "--i": baseIndex + i } as React.CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const { t } = useSiteState();
  const lineACount = Array.from(t.hero_h1_a).length;

  return (
    <section className="hero" id="top">
      <picture className="home-hero-picture">
        <source media="(max-width: 640px)" srcSet="/home/editorial/tokyo-desk-mobile.webp 1000w, /home/editorial/tokyo-desk.webp 1672w" sizes="100vw" />
        <img className="home-hero-image" src="/home/editorial/tokyo-desk.webp" alt="" width={1672} height={941} fetchPriority="high" />
      </picture>
      <div className="hero-frame">
        <div className="hero-copy">
          <span className="home-hero-blend" aria-hidden="true" />
          <p className="hero-tag" lang="en">INDEPENDENT APP STUDIO / TOKYO</p>
          <h1 className="hero-h1" aria-label={t.hero_h1_a + t.hero_h1_b}>
            <span className="hero-line" aria-hidden="true">
              <Letters text={t.hero_h1_a} baseIndex={0} />
            </span>
            <span className="hero-line accent" aria-hidden="true">
              <Letters text={t.hero_h1_b} baseIndex={lineACount} />
            </span>
          </h1>
          <p className="hero-bio" lang="ja">{profile.bio}</p>
          <p className="hero-note">{t.hero_note}</p>
          <p className="hero-cta-wrap">
            <a className="cta-btn" href="#apps">{t.hero_cta}<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a>
          </p>
          <p className="desk-stamp" aria-hidden="true">{`TOKYO '26`}</p>
          <p className="desk-hint">{t.desk_hint}</p>
        </div>
      </div>
      <div className="studio-strip">
        <span><span className="studio-dot" aria-hidden="true" />{t.studio_intro}</span>
        <span>{t.studio_apps.replace("{count}", String(apps.length))}</span>
        <span>{t.studio_made}</span>
      </div>
    </section>
  );
}
