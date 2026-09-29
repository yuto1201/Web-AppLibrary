"use client";

import { useSiteState } from "@/lib/state";
import { profile } from "@/lib/site-data";
import { apps } from "@/data/registry";
import { HomeWordmark } from "./HomeWordmark";

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
  const { t, prefs } = useSiteState();
  const lineACount = Array.from(t.hero_h1_a).length;

  return (
    <section className="hero" id="top">
      <p className="hero-tag" lang="en">LITTLE APPS. LOTS OF POSSIBILITIES.</p>
      <div className="hero-playground">
        {/* 静的出力用に圧縮済みの透過素材を直接配信する。 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-orbit" src="/home/playground/blue-orbit.webp" alt="" aria-hidden="true" width={1440} height={960} fetchPriority="high" draggable={false} />
        <HomeWordmark />
        <svg className="playground-spark" aria-hidden="true" viewBox="0 0 100 100" width="76" height="76"><path d="M50 2 62 38 98 50 62 62 50 98 38 62 2 50 38 38Z" fill="currentColor" stroke="black" strokeWidth="1.5" /></svg>
        <p className="playground-label" aria-hidden="true" lang="en">PICK. MOVE. PLAY.</p>
      </div>
      <div className="hero-copy">
        <h1 className="hero-h1" aria-label={[t.hero_h1_a, t.hero_h1_b].join(prefs.lang === "en" ? " " : "")}>
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
        <p className="desk-hint">{t.desk_hint}</p>
      </div>
      <div className="studio-strip">
        <span><span className="studio-dot" aria-hidden="true" />{t.studio_intro}</span>
        <span>{t.studio_apps.replace("{count}", String(apps.length))}</span>
        <span>{t.studio_made}</span>
      </div>
    </section>
  );
}
