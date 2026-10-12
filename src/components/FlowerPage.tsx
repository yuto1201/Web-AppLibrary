"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { FLOWER_NAME } from "@/data/flower-name";
import type { App } from "@/data/schema";
import { SKY_PHASES, SKY_PRESETS, clockText, skyPhase, type SkyPhase } from "@/lib/flower-sky";
import "@/styles/flower.css";

/** 図鑑の 6 種（iOS-Flower `FlowerCatalog.swift` の順・名前・紹介文、`FlowerAccess.swift` の無料 3 種）。 */
const FLOWERS = [
  { id: "rose", name: "バラ", english: "Rose", note: "花弁が中心へ巻き込む。見下ろす角度にすると渦が正面に来る", paid: false },
  { id: "camellia", name: "椿", english: "Camellia", note: "紅い花弁が幾重にも開き、中心に黄の雄しべが立つ。厚い葉が左右に張る", paid: false },
  { id: "dahlia", name: "ダリア", english: "Dahlia", note: "幾重にも重なる花弁が、中心から放射状に広がる", paid: false },
  { id: "anemone", name: "アネモネ", english: "Anemone", note: "薄い花弁が開き、濃い色の中心を囲む", paid: true },
  { id: "hibiscus", name: "ハイビスカス", english: "Hibiscus", note: "大きく開く花弁から、長い雄しべが伸びる", paid: true },
  { id: "spider-lily", name: "彼岸花", english: "Red Spider Lily", note: "細く反る花弁と長い雄しべが、茎の先で広がる", paid: true },
] as const;

type SkyChoice = "now" | SkyPhase;

/** 1 分単位の現在時刻。静的出力の HTML には時刻を焼き込まない。 */
function subscribeMinute(callback: () => void) {
  const timer = window.setInterval(callback, 10_000);
  return () => window.clearInterval(timer);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noMinute = () => null;

/** アプリのホーム画面（浮かぶ島・時計・花）を写した装飾。実際の 3D 表示ではない。 */
function SkyWindow({ clock }: { clock: string }) {
  return <div className="fl-window" aria-hidden="true">
    {SKY_PHASES.map(phase => <span className="fl-sky" data-layer={phase} key={phase} />)}
    <span className="fl-stars" />
    <span className="fl-cloud" data-cloud="a" /><span className="fl-cloud" data-cloud="b" />
    <svg className="fl-islands" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
      <path className="fl-island-rock" d="M30 72h76l-6 18-12 6-6 26-10-20-10 12-8-22-14-8z" />
      <path className="fl-island-top" d="M30 72h76v5H30z" />
      <path className="fl-island-rock" d="M182 92h40l-4 12-8 4-4 18-8-14-6 6-4-14z" />
      <path className="fl-island-top" d="M182 92h40v4h-40z" />
      <path className="fl-island-tree" d="M202 92v-12M196 80a6 6 0 1 0 12 0a6 6 0 1 0-12 0" />
      <path className="fl-island-rock" d="M292 60h92l-8 22-14 8-6 30-12-24-12 14-10-26-18-10z" />
      <path className="fl-island-top" d="M292 60h92v6h-92z" />
      <path className="fl-island-tree" d="M360 60v-18M350 40a10 9 0 1 0 20 0a10 9 0 1 0-20 0" />
    </svg>
    {/* 絵の一部の文字。CSS の生成内容で描き、本文のコントラスト検査の対象から外す。 */}
    <span className="fl-clock" data-clock={clock} />
    <span className="fl-clock-flower" data-name="バラ" />
    <svg className="fl-ground" viewBox="0 0 400 200" preserveAspectRatio="none">
      <path className="fl-stem" d="M200 200C204 160 196 116 201 66" />
      <path className="fl-leaf" d="M200 150c-30-4-58-22-70-44 30 2 58 16 70 44z" />
      <path className="fl-leaf" d="M202 128c26-10 50-30 58-54-26 6-50 24-58 54z" />
      <path className="fl-grass" d="M0 200V150c60-26 130-34 200-30s140 14 200 34v46z" />
    </svg>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="fl-hero-flower" src="/apps/flower/flowers/rose.webp" width={240} height={240} alt="" />
  </div>;
}

export function FlowerPage({ app }: { app: App }) {
  const minute = useSyncExternalStore(subscribeMinute, currentMinute, noMinute);
  const [choice, setChoice] = useState<SkyChoice>("now");
  const now = minute === null ? null : new Date(minute * 60_000);
  const phase: SkyPhase = choice !== "now" ? choice : now ? skyPhase(now.getHours()) : "day";
  const clock = choice !== "now" ? SKY_PRESETS[choice].clock : now ? clockText(now) : "";

  return <div className="flower-site" id="flower-top" lang="ja" data-sky={phase}>
    <a className="fl-skip-link" href="#flower-main">本文へ移動</a>
    <header className="fl-header">
      <a className="fl-wordmark" href="#flower-top" aria-label={`${FLOWER_NAME.ja} ページの先頭へ`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/apps/${app.slug}/${app.icon}`} width={34} height={34} alt="" />{FLOWER_NAME.ja}<span lang="en">{FLOWER_NAME.en}</span>
      </a>
      <nav aria-label={`${FLOWER_NAME.ja} ページ内ナビゲーション`}><a href="#flowers">花たち</a><a href="#features">できること</a><a href="#quiet">プライバシー</a></nav>
      <span className="fl-release">リリース準備中</span>
    </header>
    <main id="flower-main" tabIndex={-1}>
      <section className="fl-hero" aria-labelledby="flower-title">
        <div className="fl-hero-copy">
          <p className="fl-eyebrow">iPhone・iPad で、花を眺めるアプリ</p>
          <h1 id="flower-title"><span className="fl-sr-only">{app.name} — </span><span className="fl-phrase">浮かぶ島で、</span><span className="fl-phrase">花と空を眺める。</span></h1>
          <p className="fl-name">{FLOWER_NAME.ja}<span lang="en">{FLOWER_NAME.en}</span></p>
          <p className="fl-lead">浮かぶ島に咲く花と時計を、空の時刻や天気とともに眺めるアプリです。<br className="fl-wide-break" />花を調べるのではなく、ただ眺める時間のために。</p>
          <a className="fl-button" href="#flowers">咲いている花を見る</a>
        </div>
        <div className="fl-hero-visual">
          <figure>
            <SkyWindow clock={clock} />
            <figcaption>{choice !== "now" ? `${SKY_PRESETS[choice].label}の空のイメージ。` : now ? "いまの時刻に合わせた空のイメージ。" : "空のイメージ。"}アプリでは、空が時刻と天気に合わせて移り変わります。</figcaption>
          </figure>
          <div className="fl-sky-picker" role="group" aria-label="空の時間を選ぶ">
            {(["now", ...SKY_PHASES] as const).map(option => <button type="button" key={option} aria-pressed={choice === option} onClick={() => setChoice(option)}>
              {option === "now" ? "いま" : SKY_PRESETS[option].label}
            </button>)}
          </div>
        </div>
      </section>

      <section className="fl-section" id="flowers" aria-labelledby="flower-flowers-title">
        <p className="fl-eyebrow">花たち</p>
        <h2 id="flower-flowers-title"><span className="fl-phrase">島に咲く、</span><span className="fl-phrase">6つの花。</span></h2>
        <p className="fl-section-lead">椿・バラ・ダリアは、はじめから島に咲いています。アネモネ・ハイビスカス・彼岸花は、買い切りのアプリ内課金で加えられます。</p>
        <ul className="fl-flower-list">
          {FLOWERS.map(flower => <li className="fl-flower" data-flower={flower.id} key={flower.id}>
            <span className="fl-flower-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/apps/${app.slug}/flowers/${flower.id}.webp`} width={240} height={240} alt="" loading="lazy" />
            </span>
            <div className="fl-flower-text">
              <h3>{flower.name}<span lang="en">{flower.english}</span></h3>
              <p>{flower.note}</p>
              <span className="fl-flower-tag" data-paid={flower.paid || undefined}>{flower.paid ? "アプリ内課金で追加" : "はじめから"}</span>
            </div>
          </li>)}
        </ul>
        <p className="fl-note">花の画像はアプリの図鑑のものです。追加してほしい花は、図鑑の「リクエスト」から送れます。</p>
      </section>

      <section className="fl-section" id="features" aria-labelledby="flower-features-title">
        <p className="fl-eyebrow">できること</p>
        <h2 id="flower-features-title"><span className="fl-phrase">眺めるための、</span><span className="fl-phrase">小さな工夫。</span></h2>
        <div className="fl-feature-grid">{app.features.map(feature => <div className="fl-card fl-feature feature-row" key={feature.title}>
          <h3>{feature.title}</h3><p>{feature.description}</p>
        </div>)}</div>
      </section>

      <section className="fl-section fl-quiet" id="quiet" aria-labelledby="flower-quiet-title">
        <p className="fl-eyebrow">プライバシー</p>
        <h2 id="flower-quiet-title"><span className="fl-phrase">静かに、</span><span className="fl-phrase">眺められるように。</span></h2>
        <ul className="fl-quiet-list">
          <li className="fl-card"><h3>アカウントはいりません</h3><p>名前やメールアドレスを入力することはありません。</p></li>
          <li className="fl-card"><h3>位置情報は、オンにしたときだけ</h3><p>太陽と月・現在地の天気の設定をオンにしたときだけ、おおよその位置を使います。天気はAppleのWeatherKitに位置を送って受け取ります。開発者には届かず、アプリにも保存しません。</p></li>
          <li className="fl-card"><h3>解析・広告・追跡はしません</h3><p>利用状況の解析や広告を行わず、ほかのアプリやウェブサイトをまたいだ追跡もしません。</p></li>
        </ul>
        <p className="fl-note">くわしくは<Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link>をご覧ください。</p>
      </section>

      <p className="fl-availability">{app.platforms.join(" / ")} 27以降 · 日本語 / English<br />現在開発中です。配布開始後、このページにApp Storeへのリンクを掲載します。</p>
    </main>
    <footer className="fl-footer">
      <div className="fl-card fl-footer-card">
        <a className="fl-footer-mark" href="#flower-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/apps/${app.slug}/${app.icon}`} width={28} height={28} alt="" />{FLOWER_NAME.ja}<span lang="en">{FLOWER_NAME.en}</span>
        </a>
        <nav aria-label={`${FLOWER_NAME.ja} 関連リンク`}><Link href={`/apps/${app.slug}/support/`}>サポート</Link><Link href={`/apps/${app.slug}/terms/`}>利用規約</Link><Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link><Link href="/">← AppLibrary</Link></nav>
        <span className="fl-credit">Made by uesugiyuuto · 2026</span>
      </div>
    </footer>
  </div>;
}
