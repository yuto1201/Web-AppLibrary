import Link from "next/link";
import type { App } from "@/data/schema";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { SubLogOverview } from "@/components/SubLogOverview";
import "@/styles/sublog.css";

export function SubLogPage({ app }: { app: App }) {
  const iconSrc = `/apps/${app.slug}/${app.icon}`;
  const privacyUrl = `/apps/${app.slug}/privacy/`;

  return (
    <div className="sublog-site" id="sublog-top" lang="ja">
      <a className="sublog-skip" href="#sublog-main">本文へスキップ</a>
      <header className="sublog-header">
        <div className="sublog-wrap sublog-nav">
          <a href="#sublog-top" className="sublog-brand" aria-label="SubLog ページの先頭へ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} alt="" width={40} height={40} />
            <span>{app.name}<span className="sublog-brand-period">.</span></span>
          </a>
          <nav className="sublog-navigation" aria-label="SubLog ページ内ナビゲーション">
            <a href="#screenshots">アプリの画面</a>
            <a href="#features">できること</a>
            <a href="#questions">よくある質問</a>
          </nav>
          {app.appStoreUrl ? <a className="sublog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">ダウンロード <span aria-hidden="true">↗</span></a> : null}
        </div>
      </header>

      <main id="sublog-main" tabIndex={-1}>
        <section className="sublog-hero" aria-labelledby="sublog-title">
          <div className="sublog-wrap">
            <div className="sublog-hero-grid">
              <div className="sublog-hero-copy">
                <div className="sublog-eyebrow"><h1 id="sublog-title">{app.name}</h1><span lang="en">SUBSCRIPTION ORGANIZER</span></div>
                <h2 className="sublog-headline">サブスクを、<br /><span>すっきり</span><br className="sublog-mobile-break" />ひとまとめ。</h2>
                <p className="sublog-intro">いつ、いくら、何に使っている？<br />増えていくサブスクを、ひとつの画面に。<br />毎月の支払いが見えると、見直しも軽やかに。</p>
                <div className="sublog-actions">
                  {app.appStoreUrl ? <a className="sublog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <span aria-hidden="true">↗</span></a> : null}
                  <a href="#screenshots" className="sublog-button sublog-button-ghost">画面を見てみる <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d="M12 4v16m-6-6 6 6 6-6" /></svg></a>
                </div>
                <p className="sublog-meta">{app.platforms.join(" / ")} アプリ <span aria-hidden="true">·</span> {app.price}ではじめる</p>
              </div>
              <SubLogOverview iconSrc={iconSrc} />
            </div>
            <div className="sublog-principles">
              <div><span>01 /</span><strong>まとめる。</strong><p>サービスも、支払いも。</p></div>
              <div><span>02 /</span><strong>見渡す。</strong><p>毎月の流れを、ひと目で。</p></div>
              <div><span>03 /</span><strong>整える。</strong><p>自分に必要なものを。</p></div>
            </div>
          </div>
        </section>

        <section className="sublog-story" aria-labelledby="sublog-story-title">
          <div className="sublog-wrap sublog-story-grid">
            <div>
              <p className="sublog-section-label" lang="en">A PLACE FOR EVERY SUBSCRIPTION</p>
              <h2 id="sublog-story-title">ばらばらの支払いに、<br />ひとつの居場所を。</h2>
              <p>{app.description}</p>
              <a className="sublog-story-link" href="#features">SubLogでできること <span aria-hidden="true">↗</span></a>
            </div>
            <figure className="sublog-story-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconSrc} width={360} height={360} alt="SubLog のアプリアイコン" />
              <figcaption className="sublog-story-caption" lang="en">ONE LITTLE APP.<br />EVERYTHING IN PLACE.</figcaption>
            </figure>
          </div>
        </section>

        {app.screenshots.length > 0 ? (
          <section id="screenshots" className="sublog-screens" aria-labelledby="sublog-screens-title">
            <div className="sublog-wrap">
              <div className="sublog-section-heading">
                <h2 id="sublog-screens-title" lang="en">Screenshots</h2>
                <p>使う毎日を、<br />のぞいてみよう。</p>
              </div>
              <div className="sublog-screen-layout">
                <div className="sublog-screen-copy">
                  <h3>知りたいことが、<br />気持ちよく見つかる。</h3>
                  <p>登録したサービス、次の請求、支出の傾向。<br />普段の確認を、少ない手間で。</p>
                  <ol>
                    <li><span>01</span><div><strong>今日の全体像を。</strong><p>月々の合計と、近づいている支払いを確認。</p></div></li>
                    <li><span>02</span><div><strong>内訳から、気づく。</strong><p>カテゴリや推移を見ながら、契約を振り返る。</p></div></li>
                    <li><span>03</span><div><strong>先の予定まで。</strong><p>カレンダーに並んだ請求日で、今月を見渡す。</p></div></li>
                  </ol>
                  <p className="sublog-screen-note">掲載している画面は実際のアプリのスクリーンショットです。</p>
                </div>
                <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
              </div>
            </div>
          </section>
        ) : null}

        <section id="features" className="sublog-features" aria-labelledby="sublog-features-title">
          <div className="sublog-wrap">
            <div className="sublog-section-heading">
              <h2 id="sublog-features-title" lang="en">Features</h2>
              <p>小さなアプリに、<br />必要なことを。</p>
            </div>
            <ul className="sublog-feature-grid">
              {app.features.map((feature, index) => (
                <li className="feature-row" key={feature.title}>
                  <span className="sublog-feature-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" className="sublog-questions" aria-labelledby="sublog-questions-title">
          <div className="sublog-wrap sublog-faq-layout">
            <div><p className="sublog-section-label" lang="en">A FEW MORE THINGS</p><h2 id="sublog-questions-title">はじめる前に。</h2></div>
            <div className="sublog-faq-list">
              <details><summary>どんな支払いを管理できますか？</summary><p>月額・年額などのサブスクリプションを登録し、複数の通貨をまとめて確認できます。85以上のサービス候補から、日本語・英語で検索できます。</p></details>
              <details><summary>請求日を忘れないようにできますか？</summary><p>請求日や無料トライアルの終了前に、設定したタイミングでローカル通知します。アプリの通知を許可してご利用ください。</p></details>
              <details><summary>データの取り扱いについて知りたい。</summary><p>利用するデータや、任意のiCloud同期・為替レート取得などについて、<Link href={privacyUrl}>プライバシーポリシー</Link>にまとめています。</p></details>
            </div>
          </div>
        </section>

        <section className="sublog-download" aria-labelledby="sublog-download-title">
          <div className="sublog-wrap">
            <div className="sublog-download-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconSrc} alt="" width={88} height={88} />
              <p className="sublog-section-label" lang="en">MAKE ROOM FOR WHAT MATTERS</p>
              <h2 id="sublog-download-title">毎月のことを、<br />もう少し身軽に。</h2>
              <p>{app.tagline}</p>
              {app.appStoreUrl ? <a className="sublog-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <span aria-hidden="true">↗</span></a> : null}
              <p className="sublog-meta">{app.name} · {app.platforms.join(" / ")} · {app.price}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="sublog-footer">
        <div className="sublog-wrap">
          <a href="#sublog-top" className="sublog-brand">SubLog.</a>
          <p>毎月のサブスクを、ひと目で。</p>
          <nav aria-label="SubLog 関連リンク"><Link href={privacyUrl}>プライバシーポリシー</Link><Link href="/">← AppLibrary</Link></nav>
          <small>Made by uesugiyuuto</small>
        </div>
      </footer>
    </div>
  );
}
