import Link from "next/link";
import type { App } from "@/data/schema";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import "@/styles/paycycle.css";

function Arrow({ direction = "up-right", className }: { direction?: "up-right" | "down" | "right"; className?: string }) {
  const path = direction === "down" ? "M12 4v16m-6-6 6 6 6-6" : direction === "right" ? "M4 12h16m-6-6 6 6-6 6" : "M5 19 19 5M5 5h14v14";
  return <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false"><path d={path} /></svg>;
}

export function PayCyclePage({ app }: { app: App }) {
  const iconSrc = `/apps/${app.slug}/${app.icon}`;
  const privacyUrl = `/apps/${app.slug}/privacy/`;
  const termsUrl = `/apps/${app.slug}/terms/`;

  return (
    <div className="paycycle-site" id="paycycle-top" lang="ja">
      <a className="paycycle-skip" href="#paycycle-main">本文へスキップ</a>
      <header className="paycycle-header">
        <div className="paycycle-wrap paycycle-nav">
          <a className="paycycle-brand" href="#paycycle-top" aria-label="PayCycle ページの先頭へ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} width={36} height={36} alt="" />
            <span>PayCycle</span>
          </a>
          <nav className="paycycle-navigation" aria-label="PayCycle ページ内ナビゲーション">
            <a href="#screenshots">アプリの画面</a>
            <a href="#features">できること</a>
            <a href="#questions">よくある質問</a>
          </nav>
          {app.appStoreUrl ? (
            <a className="paycycle-button paycycle-button-small" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <Arrow /></a>
          ) : <span className="paycycle-release"><span aria-hidden="true" />リリース準備中</span>}
        </div>
      </header>

      <main id="paycycle-main" tabIndex={-1}>
        <section className="paycycle-hero" aria-labelledby="paycycle-title">
          <div className="paycycle-wrap">
            <div className="paycycle-hero-copy">
              <div className="paycycle-eyebrow"><span className="paycycle-dot" aria-hidden="true" /><h1 id="paycycle-title">{app.name}</h1><span lang="en">A LITTLE CLARITY, EVERY PAYDAY.</span></div>
              <h2 className="paycycle-headline">お金の流れに、<br /><span>見通しを。</span></h2>
              <p className="paycycle-intro">給料が入る日。支払いが出ていく日。<br />そのあいだを見渡せると、毎日は少し落ち着く。</p>
              <div className="paycycle-actions">
                <a className="paycycle-button" href="#screenshots">新しいPayCycleを見る <Arrow direction="down" /></a>
                <a className="paycycle-text-link" href="#features">できること <Arrow /></a>
              </div>
              <p className="paycycle-meta">{app.platforms.join(" / ")} <span aria-hidden="true">·</span> {app.version}</p>
            </div>

            <div className="paycycle-stage">
              <div className="paycycle-stage-note">
                <p className="paycycle-label" lang="en">YOUR MONEY, IN PERSPECTIVE</p>
                <p className="paycycle-stage-serif" lang="en">From one<br />payday<br /><em>to the next.</em></p>
                <p>給料日からはじまる、<br />自分のための見通し。</p>
              </div>
              <figure className="paycycle-hero-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="paycycle-hero-image" src={iconSrc} width={1024} height={1024} alt="PayCycle のアプリアイコン" fetchPriority="high" />
              </figure>
              <div className="paycycle-cycle-note">
                <p className="paycycle-label" lang="en">ONE PAY CYCLE</p>
                <div className="paycycle-date-line"><span><strong>25</strong><small>今月の給料日</small></span><Arrow className="paycycle-date-arrow" direction="right" /><span><strong>24</strong><small>次の給料日の前日</small></span></div>
                <p>月の区切りを、<br />暮らしのリズムに。</p>
                <small>毎月25日が給料日の場合の例</small>
              </div>
            </div>
            <div className="paycycle-principles">
              <div><span>01</span><p><strong>給料日を、起点に。</strong><small>カレンダーの月より、自分のサイクル。</small></p></div>
              <div><span>02</span><p><strong>支払いを、ひと目で。</strong><small>予定も確認待ちも、流れのなかに。</small></p></div>
              <div><span>03</span><p><strong>その先を、見通す。</strong><small>登録した収入と支払いから差額を確認。</small></p></div>
            </div>
          </div>
        </section>

        <section id="screenshots" className="paycycle-screens" aria-labelledby="paycycle-screens-title">
          <div className="paycycle-wrap paycycle-screen-layout">
            <div className="paycycle-screen-copy">
              <p className="paycycle-label" lang="en">A CLOSER LOOK</p>
              <h2 id="paycycle-screens-title" lang="en">Screenshots</h2>
              <h3>いまと、次。<br />ひとつの画面で。</h3>
              <p>収入と支払いを登録すると、<br />次の給料日までの見込みが見えてくる。<br />落ち着いた画面で、必要なことから。</p>
              <ol className="paycycle-screen-index">
                <li><span>01</span><div><strong>ホーム</strong><p>サイクル全体と、近づく支払い。</p></div></li>
                <li><span>02</span><div><strong>統計</strong><p>カレンダーとグラフで、前後の流れまで。</p></div></li>
                <li><span>03—05</span><div><strong>支払いと設定</strong><p>繰り返しの終了や、データの管理も。</p></div></li>
              </ol>
              <p className="paycycle-screen-note">画面下のサムネイルや前後ボタンで切り替えられます。<br />掲載画面の金額・名称はサンプルです。</p>
            </div>
            <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
          </div>
        </section>

        <section id="features" className="paycycle-features" aria-labelledby="paycycle-features-title">
          <div className="paycycle-wrap">
            <div className="paycycle-section-heading">
              <div><p className="paycycle-label" lang="en">MADE FOR YOUR EVERYDAY</p><h2 id="paycycle-features-title" lang="en">Features</h2></div>
              <p>毎月のことを、<br />無理なく整える。</p>
            </div>
            <ul className="paycycle-feature-grid">
              {app.features.map((feature, index) => <li className="feature-row" key={feature.title}><span className="paycycle-feature-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div></li>)}
            </ul>
            <aside className="paycycle-notice">
              <span className="paycycle-notice-mark" aria-hidden="true"><Arrow /></span>
              <div><h3>知りたいのは、「登録した予定」のその先。</h3><p>表示するのは、登録した収入と支払いから計算した見込み差額です。銀行口座の残高や、自由に使える金額を示すものではありません。</p></div>
            </aside>
          </div>
        </section>

        <section id="questions" className="paycycle-questions" aria-labelledby="paycycle-questions-title">
          <div className="paycycle-wrap paycycle-faq-layout">
            <div><p className="paycycle-label" lang="en">GOOD TO KNOW</p><h2 id="paycycle-questions-title">もう少し、<br />PayCycleのこと。</h2></div>
            <div className="paycycle-faq-list">
              <details><summary>どんな支払いを登録できますか？<span aria-hidden="true">+</span></summary><p>クレジットカードの請求、家賃、公共料金など、定期的な支払いと一回限りの支払いを登録できます。繰り返す支払いには終了日も設定できます。</p></details>
              <details><summary>銀行やカードとの連携は必要ですか？<span aria-hidden="true">+</span></summary><p>自動連携は使いません。自分で登録した収入と支払いをもとに、給料日サイクルごとの見込みを確認するアプリです。</p></details>
              <details><summary>いつから使えますか？<span aria-hidden="true">+</span></summary><p>{app.appStoreUrl ? <>App Store からダウンロードできます。<a href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">ストアで詳しく見る</a></> : "現在、リリースに向けて準備中です。配布を開始したら、このページにダウンロード先を掲載します。"}</p></details>
              <details><summary>データの取り扱いや問い合わせ先は？<span aria-hidden="true">+</span></summary><p>データの取り扱いは<Link href={privacyUrl}>プライバシーポリシー</Link>、ご利用の条件は<Link href={termsUrl}>利用規約</Link>をご確認ください。お問い合わせは<a href="https://app.yutodev.com/#contact">サポート窓口</a>へどうぞ。</p></details>
            </div>
          </div>
        </section>

        <section className="paycycle-closing" aria-labelledby="paycycle-closing-title">
          <div className="paycycle-wrap paycycle-closing-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} width={100} height={100} alt="PayCycle の新しいアプリアイコン" />
            <p className="paycycle-label" lang="en">A LITTLE CLARITY GOES A LONG WAY.</p>
            <h2 id="paycycle-closing-title">次の給料日まで、<br />見通しのある毎日を。</h2>
            <p>{app.tagline}</p>
            {app.appStoreUrl ? <a className="paycycle-button" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">App Store で入手 <Arrow /></a> : <span className="paycycle-release"><span aria-hidden="true" />リリース準備中</span>}
            <p className="paycycle-meta">{app.name} · {app.platforms.join(" / ")}</p>
          </div>
        </section>
      </main>

      <footer className="paycycle-footer">
        <div className="paycycle-wrap">
          <div className="paycycle-footer-top"><a className="paycycle-brand" href="#paycycle-top">PayCycle<span className="paycycle-dot" aria-hidden="true" /></a><Link href="/">すべてのアプリを見る <Arrow /></Link></div>
          <div className="paycycle-footer-bottom"><small>Made by uesugiyuuto</small><nav aria-label="PayCycle 関連リンク"><a href="https://app.yutodev.com/#contact">サポート</a><Link href={privacyUrl}>プライバシーポリシー</Link><Link href={termsUrl}>利用規約</Link><Link href="/">AppLibrary</Link></nav></div>
        </div>
      </footer>
    </div>
  );
}
