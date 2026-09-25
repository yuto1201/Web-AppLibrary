import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { apps, getApp } from "@/data/registry";
import { termsDocuments } from "@/data/terms/registry";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { SpecimenSticker } from "@/components/SpecimenSticker";
import { statusLabel } from "@/lib/labels";
import { i18n } from "@/lib/site-data";
import "@/styles/app-page.css";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return {};
  const title = `${app.name} — AppLibrary`;
  return {
    title,
    description: app.tagline,
    openGraph: {
      type: "website",
      url: `/apps/${app.slug}/`,
      siteName: "AppLibrary",
      title,
      description: app.tagline,
      images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary" }],
    },
    twitter: { card: "summary_large_image", title, description: app.tagline, images: ["/ogp.png"] },
  };
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  return (
    <div className="app-shell" lang="ja">
      <header className="hero">
        <nav className="hero-nav">
          <Link href="/" className="nav-back">← AppLibrary</Link>
        </nav>
        <div className="hero-inner">
          <div className="hero-lead">
            <div className="hero-copy">
              <h1 className="hero-title">{app.name}</h1>
              <p className="hero-tagline">{app.tagline}</p>
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
          </div>
          <div className="hero-actions">
            {app.appStoreUrl && (
              <a className="btn btn-primary" href={app.appStoreUrl} target="_blank" rel="noopener noreferrer">
                App Store でダウンロード
              </a>
            )}
            {app.siteUrl && (
              <a
                className={`btn ${app.appStoreUrl ? "btn-ghost" : "btn-primary"}`}
                href={app.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {app.platforms.includes("Web") ? "Web アプリを開く" : "公式サイト"}
              </a>
            )}
            <a className="btn btn-ghost" href="#features">機能を見る</a>
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
        </section>

        {app.screenshots.length > 0 && (
          <section id="screenshots" className="screenshots">
            <h2 className="section-title" lang="en">Screenshots</h2>
            <ScreenshotGallery slug={app.slug} name={app.name} files={app.screenshots} />
          </section>
        )}
      </main>

      <footer className="page-footer">
        {app.slug === "pay-cycle" && (
          <><a href="https://app.yutodev.com/#contact">サポート</a><span> · </span></>
        )}
        <Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link>
        {termsDocuments[app.slug] && (
          <><span> · </span><Link href={`/apps/${app.slug}/terms/`}>利用規約</Link></>
        )}
        <span> · </span>
        <Link href="/">AppLibrary</Link>
      </footer>
    </div>
  );
}
