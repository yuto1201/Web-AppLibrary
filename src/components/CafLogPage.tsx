import Link from "next/link";
import Image from "next/image";
import type { App } from "@/data/schema";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import "@/styles/caflog.css";

const moments = [
  { number: "01", label: "A LITTLE RECORD", title: "飲んだら、さっと記録。", copy: "いつものコーヒーも、新しいドリンクも。飲んだ時間と量を、手軽に残す。", featureTitle: "10 秒で記録", target: "caflog-feature-log", symbol: "cup" },
  { number: "02", label: "YOUR DAILY FLOW", title: "からだの中の、今を知る。", copy: "今、体内にどれくらい残っている？ 時間とともに変わる推定量を確認。", featureTitle: "体内残量をリアルタイム計算", target: "caflog-feature-flow", symbol: "flow" },
  { number: "03", label: "A QUIETER EVENING", title: "夜のことも、少し意識。", copy: "次の一杯を決める前に。就寝予定時刻の推定残量をチェック。", featureTitle: "睡眠への影響を確認", target: "caflog-feature-sleep", symbol: "moon" },
] as const;

function ArrowIcon({ direction = "out" }: { direction?: "out" | "down" | "both" }) {
  const path = direction === "down" ? "M12 4v16m-6-6 6 6 6-6" : direction === "both" ? "M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4" : "M5 19 19 5M5 5h14v14";
  return <svg className="caflog-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={path} /></svg>;
}

function MomentGraphic({ symbol }: { symbol: (typeof moments)[number]["symbol"] }) {
  return (
    <svg className="caflog-moment-art" viewBox="0 0 360 220" fill="none" aria-hidden="true">
      {symbol === "cup" ? <>
        <path d="M80 173H285M110 75H228L215 165H123L110 75Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <path d="M232 89H245C274 89 273 132 236 132M133 52L144 32M165 52L176 32M197 52L208 32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M168 87L144 125H168L155 154L193 114H172L185 87H168Z" fill="currentColor" />
      </> : symbol === "flow" ? <>
        <path d="M44 169H318M44 44V169" stroke="currentColor" strokeWidth="2" opacity=".35" />
        <path d="M49 160C92 154 84 70 121 62C174 50 173 148 314 151" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="121" cy="62" r="9" fill="currentColor" />
        <path d="M121 86V170M215 131V170" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" opacity=".5" />
      </> : <>
        <path d="M208 42A68 68 0 1 0 260 136A62 62 0 0 1 208 42Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <path d="M266 45V75M251 60H281M97 47V67M87 57H107" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </>}
    </svg>
  );
}

export function CafLogPage({ app }: { app: App }) {
  return (
    <div className="caflog-site" lang="ja" id="caflog-top">
      <a className="caflog-skip" href="#caflog-main">本文へスキップ</a>
      <header className="caflog-header">
        <a className="caflog-brand" href="#caflog-top" aria-label="CafLog ページの先頭へ">
          {app.icon ? <Image src={`/apps/${app.slug}/${app.icon}`} width={36} height={36} alt="" /> : null}
          <span>{app.name}<span className="caflog-brand-dot">.</span></span>
        </a>
        <nav className="caflog-navigation" aria-label="CafLog ページ内ナビゲーション">
          <a href="#rhythm">CafLogとは</a>
          <a href="#screenshots">アプリの画面</a>
          <a href="#features">機能</a>
        </nav>
        {app.appStoreUrl ? <a className="caflog-button caflog-nav-download" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">ダウンロード <ArrowIcon /></a> : null}
      </header>

      <main id="caflog-main" tabIndex={-1}>
        <section className="caflog-hero" aria-labelledby="caflog-title">
          <div className="caflog-container caflog-hero-grid">
            <div className="caflog-hero-copy">
              <div className="caflog-eyebrow"><h1 id="caflog-title">{app.name}</h1><span>毎日のカフェイン記録</span></div>
              <p className="caflog-headline">一杯ずつ、<br /><span>自分のペースへ。</span></p>
              <p className="caflog-hero-description">{app.tagline}<br />好きな一杯を楽しみながら、<br />自分に合うリズムを見つけよう。</p>
              <div className="caflog-hero-actions">
                {app.appStoreUrl ? <a className="caflog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <ArrowIcon /></a> : null}
                <a className="caflog-button caflog-button-ghost" href="#screenshots">画面を見てみる <ArrowIcon direction="down" /></a>
              </div>
              <p className="caflog-platform">{app.platforms.join(" / ")} · 基本機能{app.price} / Pro 機能あり</p>
            </div>
            <figure className="caflog-hero-stage">
              <span className="caflog-hero-halo" aria-hidden="true" />
              <div className="caflog-icon-card">
                <Image src={`/apps/${app.slug}/${app.icon}`} width={124} height={124} alt="CafLog のアプリアイコン" />
              </div>
              <div className="caflog-hero-phone">
                <Image className="caflog-hero-image" src={`/apps/${app.slug}/screenshots/4.png`} width={1179} height={2556} alt="CafLog の実際のホーム画面。今日の摂取量と体内カフェインの推定量、飲んだ記録を表示" priority />
              </div>
              <figcaption className="caflog-stage-caption">CafLogの実際のホーム画面</figcaption>
            </figure>
          </div>
          <div className="caflog-hero-index">
            <a href="#rhythm"><span>01</span><strong>一杯から、はじめよう</strong><ArrowIcon direction="down" /></a>
            <a href="#screenshots"><span>02</span><strong>アプリで見えること</strong><ArrowIcon direction="down" /></a>
            <a href="#features"><span>03</span><strong>続けたくなる機能</strong><ArrowIcon direction="down" /></a>
          </div>
        </section>

        <section className="caflog-rhythm caflog-light" id="rhythm" aria-labelledby="rhythm-title">
          <div className="caflog-container">
            <div className="caflog-section-heading">
              <div><p className="caflog-kicker" lang="en">A SMALL DAILY HABIT</p><h2 id="rhythm-title">いつもの一杯を、<br />ちいさな気づきに。</h2></div>
              <p>{app.description}</p>
            </div>
            <div className="caflog-moments">
              {moments.map((moment) => <a className={`caflog-moment caflog-moment-${moment.symbol}`} href={`#${moment.target}`} key={moment.number}>
                <div className="caflog-moment-visual"><span className="caflog-moment-number">{moment.number}</span><MomentGraphic symbol={moment.symbol} /></div>
                <div className="caflog-moment-copy"><p className="caflog-kicker" lang="en">{moment.label}</p><h3>{moment.title}</h3><p>{moment.copy}</p><span className="caflog-text-link">機能を詳しく <ArrowIcon /></span></div>
              </a>)}
            </div>
          </div>
        </section>

        <section className="caflog-showcase" id="screenshots" aria-labelledby="screenshots-title">
          <div className="caflog-container caflog-showcase-grid">
            <div className="caflog-showcase-copy">
              <h2 className="caflog-kicker" id="screenshots-title" lang="en">Screenshots</h2>
              <p className="caflog-display">からだのリズムを、<br /><span>見えるかたちに。</span></p>
              <h3>今日の一杯から、<br />日々の傾向まで。</h3>
              <p>飲んだ時間。いつもの量。日々の傾向。<br />記録を重ねて、自分の飲み方を見つけよう。</p>
              <div className="caflog-gallery-hint"><ArrowIcon direction="both" /> 5枚の実際のアプリ画面を見てみよう。</div>
            </div>
            <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
          </div>
        </section>

        <section className="caflog-features caflog-light" id="features" aria-labelledby="features-title">
          <div className="caflog-container">
            <div className="caflog-section-heading"><div><p className="caflog-kicker" lang="en">MADE FOR YOUR EVERYDAY</p><h2 id="features-title">気軽に続く、<br />うれしい機能。</h2></div><p>すばやく残して、じっくり振り返る。<br />毎日の一杯に寄り添う、CafLogの機能。</p></div>
            <ul className="caflog-feature-list">
              {app.features.map((feature, index) => <li className="feature-row" id={moments.find((moment) => moment.featureTitle === feature.title)?.target ?? `caflog-feature-${index + 1}`} key={feature.title}>
                <span className="caflog-feature-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>{feature.title === "Pro 連携機能" ? <span className="caflog-pro" lang="en">PRO</span> : null}<h3>{feature.title}</h3><p>{feature.description}</p></div>
              </li>)}
            </ul>
            <p className="caflog-estimate-note">体内残量はモデルに基づく推定値です。個人差があり、医療上の診断や判断を行うものではありません。</p>
          </div>
        </section>

        <section className="caflog-download" aria-labelledby="download-title">
          <div className="caflog-container caflog-download-inner">
            <div><p className="caflog-kicker" lang="en">YOUR NEXT CUP STARTS HERE</p><h2 id="download-title">次の一杯から、<br />はじめよう。</h2></div>
            <div className="caflog-download-action">
              {app.icon ? <Image src={`/apps/${app.slug}/${app.icon}`} width={76} height={76} alt="CafLog のアプリアイコン" loading="lazy" /> : null}
              {app.appStoreUrl ? <a className="caflog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <ArrowIcon /></a> : null}
              <p>{app.name} · {app.platforms.join(" / ")}<br />基本機能{app.price} / Pro 機能あり</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="caflog-footer">
        <div className="caflog-container caflog-footer-inner"><span className="caflog-footer-brand">CafLog<span>.</span></span><p>カフェインと、自分らしく。</p><nav aria-label="CafLog 関連リンク"><Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link><Link href="/">← AppLibrary</Link></nav></div>
      </footer>
    </div>
  );
}
