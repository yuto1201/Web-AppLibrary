"use client";

import { useSiteState } from "@/lib/state";
import { profile } from "@/lib/site-data";

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
      {/* 役割はステッカー型のタグで示す。大文字のアイブロウは置かない。 */}
      <p className="hero-tag">{profile.tagline}</p>
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
        <a className="cta-btn" href="#apps">{t.hero_cta}</a>
      </p>
    </section>
  );
}
