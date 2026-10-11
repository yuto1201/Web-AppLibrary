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

/** アプリのタイマー画面（Classic テーマ）を写した装飾。実際のタイマーではない。 */
function TimerScreen() {
  return <div className="sp-screen" aria-hidden="true">
    <div className="sp-drain" />
    <div className="sp-disc">
      <span className="sp-disc-phase">集中 <span>›</span></span>
      <span className="sp-cycle-dots"><i /><i /><i /><i /></span>
      <span className="sp-disc-time">25:00</span>
      <span className="sp-play"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor" /></svg></span>
    </div>
  </div>;
}

const phases = [
  { key: "focus", label: "集中", note: "目の前のひとつに向き合う時間。", filled: 1 },
  { key: "break", label: "休憩", note: "手を止めて、ひと息つく時間。", filled: 2 },
  { key: "long", label: "長い休憩", note: "何度か繰り返したら、しっかり休む。", filled: 4 },
] as const;

export function SimplePomoPage({ app }: { app: App }) {
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const [paused, setPaused] = useState(false);
  const motionPaused = reducedMotion || paused;
  return <div className="simplepomo-site" id="simplepomo-top" lang="ja" data-motion={motionPaused ? "paused" : "running"}>
    <a className="sp-skip-link" href="#simplepomo-main">本文へ移動</a>
    <header className="sp-header">
      <a className="sp-wordmark" href="#simplepomo-top" aria-label="SimplePomo ページの先頭へ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/${app.icon}`} width={34} height={34} alt="" />SimplePomo
      </a>
      <nav aria-label="SimplePomo ページ内ナビゲーション"><a href="#concept">コンセプト</a><a href="#rhythm">リズム</a><a href="#features">できること</a></nav>
      <span className="sp-release">リリース準備中</span>
    </header>
    <main id="simplepomo-main" tabIndex={-1}>
      <section className="sp-hero" aria-labelledby="simplepomo-title">
        <div className="sp-hero-copy">
          <p className="sp-eyebrow">iPhone・iPad のためのポモドーロタイマー</p>
          <h1 id="simplepomo-title"><span className="sp-sr-only">{app.name} — </span><span className="sp-phrase">目の前のことに、</span><span className="sp-phrase">ただ集中する。</span></h1>
          <p className="sp-lead">時間を区切る。それだけで、日々は少し変わる。<br className="sp-wide-break" />あなたの集中に、そっと寄り添うタイマーです。</p>
          <div className="sp-hero-actions">
            <a className="sp-button" href="#rhythm">集中のかたちを見る</a>
            <button className="sp-button sp-motion-toggle" type="button" aria-label="MOTION（アニメーションを一時停止）" aria-pressed={motionPaused} disabled={reducedMotion} onClick={() => setPaused(value => !value)}>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={motionPaused ? "M4 2v12l9-6z" : "M5 2v12M11 2v12"} /></svg>
              動き <span>{motionPaused ? "OFF" : "ON"}</span>
            </button>
          </div>
        </div>
        <figure className="sp-hero-visual">
          <TimerScreen />
          <figcaption>タイマー画面のイメージ。色が時計回りに減って、残り時間を知らせます。</figcaption>
        </figure>
      </section>

      <section className="sp-section sp-concept" id="concept" aria-labelledby="simplepomo-concept-title">
        <p className="sp-eyebrow">コンセプト</p>
        <div className="sp-concept-grid">
          <h2 id="simplepomo-concept-title"><span className="sp-phrase">タイマーのことは、</span><span className="sp-phrase">忘れていい。</span></h2>
          <div className="sp-card sp-concept-card">
            <p>やることを決めて、タイマーを始める。<br />あとは、目の前のことに向き合うだけ。</p>
            <p>残り時間は、Dynamic Islandやロック画面でちらっと確認。アプリを開く必要はありません。</p>
          </div>
        </div>
      </section>

      <section className="sp-section sp-rhythm" id="rhythm" aria-labelledby="simplepomo-rhythm-title">
        <p className="sp-eyebrow">リズム</p>
        <h2 id="simplepomo-rhythm-title"><span className="sp-phrase">集中する時間も、</span><span className="sp-phrase">ひと息つく時間も。</span></h2>
        <p className="sp-section-lead">フェーズごとに画面の色が変わるから、いまが集中か休憩か、ひと目でわかります。</p>
        <ol className="sp-phase-list">
          {phases.map(phase => <li className="sp-card sp-phase" data-phase={phase.key} key={phase.key}>
            <span className="sp-phase-swatch" aria-hidden="true"><span /></span>
            <div><h3>{phase.label}</h3><p>{phase.note}</p></div>
            <span className="sp-cycle-dots" aria-hidden="true">{[0, 1, 2, 3].map(dot => <i key={dot} data-on={dot < phase.filled || undefined} />)}</span>
          </li>)}
        </ol>
        <p className="sp-example-note">色は標準テーマ「Classic」の表示例です。</p>
      </section>

      <section className="sp-section sp-features" id="features" aria-labelledby="simplepomo-features-title">
        <p className="sp-eyebrow">できること</p>
        <h2 id="simplepomo-features-title" className="sp-sr-only">SimplePomo でできること</h2>
        <div className="sp-feature-grid">{app.features.map((feature, index) => <div className="sp-card sp-feature feature-row" key={feature.title}>
          <span className="sp-feature-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </div>)}</div>
        <p className="sp-availability">{app.platforms.join(" / ")} · iOS 26.4以降 · 日本語 / English<br />現在開発中です。配布開始後、このページにApp Storeへのリンクを掲載します。</p>
      </section>
    </main>
    <footer className="sp-footer">
      <div className="sp-card sp-footer-card">
        <a className="sp-footer-mark" href="#simplepomo-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/apps/${app.slug}/${app.icon}`} width={28} height={28} alt="" />SimplePomo
        </a>
        <nav aria-label="SimplePomo 関連リンク"><a href="https://app.yutodev.com/#contact">サポート</a><Link href={`/apps/${app.slug}/terms/`}>利用規約</Link><Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link><Link href="/">← AppLibrary</Link></nav>
        <span className="sp-credit">Made by uesugiyuuto · 2026</span>
      </div>
    </footer>
  </div>;
}
