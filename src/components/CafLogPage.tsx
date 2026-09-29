import Link from "next/link";
import Image from "next/image";
import type { App } from "@/data/schema";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import "@/styles/caflog.css";

const moments = [
  { number: "01", label: "LOG YOUR CUP", title: "まずは、一杯の記録から。", copy: "いつものコーヒーも、新しいドリンクも。飲んだ瞬間を、手軽に残す。", feature: 0, symbol: "cup" },
  { number: "02", label: "KNOW YOUR FLOW", title: "見えなかった流れを、知る。", copy: "今、体内にどれくらい残っている？ 時間とともに変わる推定量を確認。", feature: 1, symbol: "flow" },
  { number: "03", label: "LOOK AHEAD", title: "今日の夜まで、見通そう。", copy: "次の一杯を決める前に。就寝予定時刻の推定残量をチェック。", feature: 2, symbol: "moon" },
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
          <a href="#features">機能</a>
          <a href="#screenshots">アプリの画面</a>
        </nav>
        {app.appStoreUrl ? <a className="caflog-button caflog-nav-download" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">ダウンロード <ArrowIcon /></a> : null}
      </header>

      <main id="caflog-main" tabIndex={-1}>
        <section className="caflog-hero" aria-labelledby="caflog-title">
          <picture className="caflog-hero-picture">
            <source media="(max-width: 640px)" srcSet="/apps/caflog/editorial/morning-ride-mobile.webp" />
            <img className="caflog-hero-image" src="/apps/caflog/editorial/morning-ride.webp" width="1672" height="941" alt="朝の街を背景に、自転車のそばでコーヒーを手にするひととき" fetchPriority="high" />
          </picture>
          <div className="caflog-hero-content">
            <div className="caflog-hero-copy">
              <span className="caflog-hero-edge" aria-hidden="true" />
              <div className="caflog-eyebrow"><span className="caflog-live-dot" aria-hidden="true" /><h1 id="caflog-title">{app.name}</h1><span lang="en">CAFFEINE TRACKER</span></div>
              <p className="caflog-headline">その一杯を、<br />自分のリズムに。</p>
              <p className="caflog-hero-description">{app.tagline}<br />飲む、記録する、自分を知る。今日の一杯から。</p>
              <div className="caflog-hero-actions">
                {app.appStoreUrl ? <a className="caflog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <ArrowIcon /></a> : null}
                <span className="caflog-platform">{app.platforms.join(" / ")} · {app.price}ではじめる</span>
              </div>
            </div>
            <span className="caflog-photo-note" lang="en">A NEW DAY. YOUR OWN PACE.</span>
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
              <div><p className="caflog-kicker" lang="en">MAKE IT YOUR ROUTINE</p><h2 id="rhythm-title">いつもの一杯に、<br />新しい気づきを。</h2></div>
              <p>{app.description}</p>
            </div>
            <div className="caflog-moments">
              {moments.map((moment) => <a className={`caflog-moment caflog-moment-${moment.symbol}`} href={`#caflog-feature-${moment.feature + 1}`} key={moment.number}>
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
              <p className="caflog-display" lang="en">KNOW<br />YOUR<br /><span>RHYTHM.</span></p>
              <h3>感覚だけだった習慣を、<br />自分のデータで。</h3>
              <p>飲んだ時間。いつもの量。日々の傾向。<br />記録を重ねて、自分の飲み方を見つけよう。</p>
              <div className="caflog-gallery-hint"><ArrowIcon direction="both" /> 画面を切り替えて、CafLogをのぞいてみよう。</div>
            </div>
            <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
          </div>
        </section>

        <section className="caflog-features caflog-light" id="features" aria-labelledby="features-title">
          <div className="caflog-container">
            <div className="caflog-section-heading"><div><p className="caflog-kicker" lang="en">BUILT FOR YOUR EVERYDAY</p><h2 id="features-title">小さな記録。<br />広がる発見。</h2></div><p>すばやく残して、じっくり振り返る。<br />毎日の一杯に寄り添う、CafLogの機能。</p></div>
            <ul className="caflog-feature-list">
              {app.features.map((feature, index) => <li className="feature-row" id={`caflog-feature-${index + 1}`} key={feature.title}>
                <span className="caflog-feature-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div>{index === 5 ? <span className="caflog-pro" lang="en">PRO</span> : null}<h3>{feature.title}</h3><p>{feature.description}</p></div>
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
