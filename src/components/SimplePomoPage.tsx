import Link from "next/link";
import type { App } from "@/data/schema";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { SpecimenSticker } from "@/components/SpecimenSticker";
import { appTone } from "@/lib/app-tone";
import { statusLabel } from "@/lib/labels";
import { i18n } from "@/lib/site-data";

const CONTACT_URL = "https://app.yutodev.com/#contact";

/** registry の features と同じ順で並べる。件数の一致は E2E が確かめる。 */
const ENGLISH_FEATURES = [
  {
    title: "Alarms that reach the Lock Screen",
    description: "Full-screen AlarmKit alarms tell you when a focus or break session ends, even on the Lock Screen (Pro).",
  },
  {
    title: "Dynamic Island and Live Activities",
    description: "See the time remaining in the Dynamic Island and in a Live Activity.",
  },
  {
    title: "Lock Screen, StandBy and Control Center",
    description: "Check the timer’s status and control it from the Lock Screen, StandBy and Control Center.",
  },
  {
    title: "Interactive widgets",
    description: "Control the timer right inside an interactive widget (Pro).",
  },
  {
    title: "Seven Siri Shortcuts",
    description: "Start the timer or check its status with your voice (free).",
  },
  {
    title: "Today’s log and statistics",
    description: "Review today’s sessions, your streak and statistics for the last seven days.",
  },
  {
    title: "Ambient sounds and color themes",
    description: "Choose from five ambient sounds and four color themes (Pro).",
  },
] as const;

/** App Store のサポート URL として使うため、日本語と英語の両方で機能・問い合わせ先・法務へ届くようにする。 */
export function SimplePomoPage({ app }: { app: App }) {
  const privacyUrl = `/apps/${app.slug}/privacy/`;
  const termsUrl = `/apps/${app.slug}/terms/`;

  return (
    <div className="app-shell pomo-page" lang="ja" data-tone={appTone(app.slug)}>
      <header className="hero">
        <nav className="hero-nav">
          <Link href="/" className="nav-back">← AppLibrary</Link>
        </nav>
        <div className="hero-inner">
          <div className="hero-lead">
            <div className="hero-copy">
              <h1 className="hero-title">{app.name}</h1>
              <p className="hero-tagline">{app.tagline}</p>
              <p className="hero-tagline pomo-tagline-en" lang="en">A simple Pomodoro timer you can check at a glance.</p>
            </div>
            {app.icon ? <SpecimenSticker app={app} /> : null}
          </div>
          <p className="hero-desc">{app.description}</p>
          <div className="hero-meta-row">
            {app.status !== "release" && (
              <span className="hero-badge hero-status">{statusLabel(app.status, i18n.ja)}</span>
            )}
            {app.platforms.map((platform) => (
              <span className="hero-badge" key={platform}>{platform}</span>
            ))}
            <span className="hero-badge">iOS 26.4+</span>
          </div>
          <div className="hero-actions">
            {app.appStoreUrl && (
              <a className="btn btn-primary" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
                App Store でダウンロード
              </a>
            )}
            <a className="btn btn-ghost" href="#features">機能を見る</a>
            <a className="btn btn-ghost" href="#support">サポート</a>
            <a className="btn btn-ghost" href="#english" lang="en">English</a>
          </div>
        </div>
      </header>

      <main className="page">
        <section id="features" className="features">
          <h2 className="section-title" lang="en">Features</h2>
          <ul className="feature-list">
            {app.features.map((feature) => (
              <li className="feature-row" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </li>
            ))}
          </ul>
          <p className="pomo-note">（Pro）と書いた機能は、アプリ内課金の Pro で使えます。条件は<Link href={termsUrl}>利用規約</Link>をご確認ください。</p>
        </section>

        {app.screenshots.length > 0 && (
          <section id="screenshots" className="screenshots">
            <h2 className="section-title" lang="en">Screenshots</h2>
            <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
          </section>
        )}

        <section id="support" className="pomo-support" aria-labelledby="pomo-support-title">
          <h2 className="section-title" id="pomo-support-title" lang="en">Support</h2>
          <p>不具合や要望は、アプリの設定にある「フィードバックを送る」から送れます。フィードバックでは連絡先を受け取らないため、返信はしません。そのほかのお問い合わせは、<a href={CONTACT_URL}>開発者の連絡先</a>からお寄せください。</p>
          <ul className="pomo-links">
            <li><Link href={privacyUrl}>プライバシーポリシー</Link></li>
            <li><Link href={termsUrl}>利用規約</Link></li>
          </ul>
        </section>

        <section id="english" className="pomo-english" lang="en" aria-labelledby="pomo-english-title">
          <h2 className="section-title" id="pomo-english-title">In English</h2>
          <p className="pomo-lead">
            SimplePomo is a simple Pomodoro timer you can check at a glance anywhere in iOS. The app itself stays minimal: you can see and control the timer from the Dynamic Island, the Lock Screen, StandBy, Control Center, widgets and Siri. It supports iPhone and iPad with iOS 26.4 or later, in Japanese and English, and is currently in development.
          </p>
          <ul className="feature-list">
            {ENGLISH_FEATURES.map((feature) => (
              <li className="feature-row" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </li>
            ))}
          </ul>
          <p className="pomo-note">Features marked (Pro) require the Pro in-app purchase. See the <Link href={termsUrl}>Terms of Use</Link> for details.</p>
          <h3 className="pomo-subtitle">Support</h3>
          <p>You can send bug reports and requests from the feedback option in the app’s Settings. Feedback does not include your contact details, so we do not reply to it. For other questions, please use the <a href={CONTACT_URL}>developer’s contact links</a>.</p>
          <ul className="pomo-links">
            <li><Link href={privacyUrl}>Privacy Policy</Link></li>
            <li><Link href={termsUrl}>Terms of Use</Link></li>
          </ul>
        </section>
      </main>

      <footer className="page-footer">
        <nav aria-label="SimplePomo 関連リンク">
          <a href="#support">サポート</a><span> · </span>
          <Link href={privacyUrl}>プライバシーポリシー</Link><span> · </span>
          <Link href={termsUrl}>利用規約</Link><span> · </span>
          <Link href="/">AppLibrary</Link>
        </nav>
      </footer>
    </div>
  );
}
