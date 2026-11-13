import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { apps, getApp } from "@/data/registry";
import { AppFrame } from "@/components/AppFrame";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { CafLogPage } from "@/components/CafLogPage";
import { SubLogPage } from "@/components/SubLogPage";
import { SimplePomoPage } from "@/components/SimplePomoPage";
import { PayCyclePage } from "@/components/PayCyclePage";
import { FlowerPage } from "@/components/FlowerPage";
import { SpecimenSticker } from "@/components/SpecimenSticker";
import { appTone } from "@/lib/app-tone";
import { statusLabel } from "@/lib/labels";
import { i18n } from "@/lib/site-data";
import "@/styles/app-page.css";
import "@/styles/app-frame.css";

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

  // 明るい専用配色のページは、保存した dark でも枠を light の値のままにする。
  const light = ["caflog", "sublog", "pay-cycle", "flower"].includes(app.slug);
  const framed = (body: ReactNode) => <AppFrame app={app} light={light}>{body}</AppFrame>;

  if (app.slug === "simple-pomo") return framed(<SimplePomoPage app={app} />);
  if (app.slug === "caflog") return framed(<CafLogPage app={app} />);
  if (app.slug === "sublog") return framed(<SubLogPage app={app} />);
  if (app.slug === "pay-cycle") return framed(<PayCyclePage app={app} />);
  if (app.slug === "flower") return framed(<FlowerPage app={app} />);

  return framed(
    <div className="app-shell" lang="ja" data-tone={appTone(app.slug)}>
      <header className="hero">
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
            <ScreenshotGallery slug={app.slug} shots={app.screenshots} />
          </section>
        )}
      </main>
    </div>,
  );
}
