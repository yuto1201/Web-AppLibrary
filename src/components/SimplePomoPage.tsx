"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { App } from "@/data/schema";
import "@/styles/simplepomo.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function Clock() {
  return <div className="sp-clock-art" aria-hidden="true">
    <svg className="sp-dial" viewBox="0 0 600 600" fill="none" focusable="false">
      <circle cx="300" cy="300" r="283" stroke="currentColor" strokeWidth=".6" />
      <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth=".6" />
      <g>{Array.from({ length: 60 }, (_, tick) => <line key={tick} x1="300" y1="17" x2="300" y2={tick % 5 === 0 ? 33 : 25} transform={`rotate(${tick * 6} 300 300)`} stroke="currentColor" strokeWidth={tick % 5 === 0 ? 1.1 : .6} />)}</g>
      <path className="sp-dial-arc" d="M300 80 A220 220 0 0 1 520 300" stroke="var(--sp-accent)" strokeWidth="2" />
      <g className="sp-dial-hand"><line x1="300" y1="300" x2="300" y2="75" stroke="var(--sp-accent)" strokeWidth="1.5" /><circle cx="300" cy="75" r="5" fill="var(--sp-accent)" /></g>
      <circle cx="300" cy="300" r="4" fill="var(--sp-accent)" />
    </svg>
  </div>;
}

export function SimplePomoPage({ app }: { app: App }) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const [paused, setPaused] = useState(false);
  const motionPaused = reducedMotion || paused;
  return <div className="simplepomo-site" id="simplepomo-top" lang="ja" data-motion={motionPaused ? "paused" : "running"}>
    <a className="sp-skip-link" href="#simplepomo-main">本文へ移動</a>
    <header className="sp-header">
      <a className="sp-wordmark" href="#simplepomo-top" aria-label="SimplePomo ページの先頭へ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/${app.icon}`} width={30} height={30} alt="" />SimplePomo
      </a>
      <nav aria-label="SimplePomo ページ内ナビゲーション"><a href="#concept">CONCEPT <span>コンセプト</span></a><a href="#experience">EXPERIENCE <span>集中のかたち</span></a></nav>
      <span className="sp-release">リリース準備中 <span className="sp-accent-dot" aria-hidden="true" /></span>
    </header>
    <main id="simplepomo-main" tabIndex={-1}>
      <section className="sp-hero" aria-labelledby="simplepomo-title">
        <div className="sp-hero-meta"><p><span className="sp-accent-dot" aria-hidden="true" /> A LITTLE TIMER. A LITTLE MORE FOCUS.</p><p>DESIGNED FOR iPHONE & iPAD</p></div>
        <div className="sp-hero-composition">
          <h1 id="simplepomo-title" className="sp-sr-only">{app.name}</h1>
          <h2 className="sp-headline" lang="en"><span className="sp-headline-line"><span>MAKE ROOM</span></span><span className="sp-headline-second"><em>for</em><span className="sp-headline-line"><span>FOCUS.</span></span></span></h2>
          <Clock /><span className="sp-composition-note" lang="en">LESS NOISE.<br />MORE YOU.</span>
        </div>
        <div className="sp-hero-bottom">
          <div className="sp-hero-copy"><h3>目の前のことに、ただ集中する。</h3><p>時間を区切る。それだけで、日々は少し変わる。<br />あなたの集中に、そっと寄り添うポモドーロタイマー。</p></div>
          <a className="sp-text-link" href="#experience">集中のかたちを見る <span aria-hidden="true">↘</span></a>
          <div className="sp-hero-counter" aria-hidden="true"><span>YOUR NEXT CHAPTER</span><strong>25<span>:00</span></strong><span>ONE SESSION AT A TIME</span></div>
        </div>
        <div className="sp-hero-foot"><span lang="en">SCROLL TO FIND YOUR FLOW</span><span className="sp-scroll-indicator" aria-hidden="true"><svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 3v18m-5-5 5 5 5-5" /></svg></span><button className="sp-motion-toggle" type="button" aria-label="MOTION（アニメーションを一時停止）" aria-pressed={motionPaused} disabled={reducedMotion} onClick={() => setPaused(value => !value)}>MOTION <span>{motionPaused ? "OFF" : "ON"}</span><svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d={motionPaused ? "M4 2v12l9-6z" : "M5 2v12M11 2v12"} /></svg></button></div>
      </section>
      <section className="sp-concept" id="concept" aria-labelledby="simplepomo-concept-title">
        <div className="sp-section-label" lang="en"><span>(01 — THE CONCEPT)</span><span>SIMPLICITY IS THE POINT.</span></div>
        <div className="sp-concept-grid"><div><h2 id="simplepomo-concept-title" lang="en">DO LESS.<br /><em>Focus</em> MORE.</h2></div><div className="sp-concept-copy"><span className="sp-asterisk" aria-hidden="true">✳</span><h3>タイマーのことは、<br />忘れていい。</h3><p>やることを決めて、タイマーを始める。<br />あとは、目の前のことに向き合うだけ。</p><p>残り時間は、Dynamic Islandやロック画面で<br className="sp-desktop-break" />ちらっと確認。アプリを開く必要はありません。</p><p className="sp-concept-signature" lang="en">A quiet companion for a focused life.</p></div></div>
      </section>
      <section className="sp-experience" id="experience" aria-labelledby="simplepomo-experience-title">
        <div className="sp-section-label" lang="en"><span>(02 — FIND YOUR RHYTHM)</span><span>FOCUS. REST. REPEAT.</span></div>
        <div className="sp-experience-heading"><h2 id="simplepomo-experience-title" lang="en">Small rituals.<br /><em>Real focus.</em></h2><p>集中する時間も、ひと息つく時間も。<br />自分にちょうどいいリズムで。</p></div>
        <div className="sp-rhythm-layout">
          <div className="sp-rhythm-visual"><div role="img" aria-label="25分の集中と5分の休憩を繰り返すリズムのイメージ。実際のタイマーではなく表示例です。"><div className="sp-rhythm-caption" aria-hidden="true"><span className="sp-accent-dot" /><span>TIME TO FOCUS</span><span>01 / 04</span></div><div className="sp-rhythm-time" aria-hidden="true"><span>25</span><em>:</em><span>00</span></div><div className="sp-rhythm-ticks" aria-hidden="true" /><div className="sp-rhythm-caption" aria-hidden="true"><span>MAKE THIS MOMENT YOURS.</span><span>↗</span></div></div><p className="sp-example-note">集中のリズムを示す表示例</p></div>
          <div className="sp-feature-list" id="features">{app.features.map((feature, index) => <div className="sp-feature feature-row" key={feature.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span aria-hidden="true">↗</span></div>)}</div>
        </div>
        <p className="sp-availability">{app.platforms.join(" / ")} · iOS 26.4以降 · 日本語 / English<br />現在開発中です。配布開始後、このページにApp Storeへのリンクを掲載します。</p>
      </section>
    </main>
    <footer className="sp-footer">
      <div className="sp-footer-top"><a className="sp-wordmark" href="#simplepomo-top"><span className="sp-brand-mark" aria-hidden="true" />SimplePomo</a><p lang="en">A little space to do your best.</p><a className="sp-back-top" href="#simplepomo-top" aria-label="ページの先頭へ"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 21V3m-6 6 6-6 6 6" /></svg></a></div>
      <div className="sp-footer-bottom"><span>Made by uesugiyuuto · 2026</span><nav aria-label="SimplePomo 関連リンク"><a href="https://app.yutodev.com/#contact">サポート</a><Link href={`/apps/${app.slug}/terms/`}>利用規約</Link><Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link><Link href="/">← AppLibrary</Link></nav></div>
    </footer>
  </div>;
}
