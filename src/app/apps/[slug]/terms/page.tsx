import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apps, getApp } from "@/data/registry";
import { termsDocuments } from "@/data/terms/registry";
import "@/styles/app-page.css";

export function generateStaticParams() {
  return apps.filter((app) => termsDocuments[app.slug]).map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app || !termsDocuments[slug]) return {};
  const title = `利用規約 — ${app.name}`;
  const description = `${app.name} の利用条件について説明します。`;
  return {
    title,
    description,
    robots: { index: true },
    openGraph: {
      type: "website",
      url: `/apps/${app.slug}/terms/`,
      siteName: "AppLibrary",
      title,
      description,
      images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/ogp.png"] },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = getApp(slug);
  const content = termsDocuments[slug];
  if (!app || !content) notFound();

  return (
    <div className="app-shell" lang="ja">
      <nav className="privacy-nav" aria-label={`${app.name} のページへ戻る`}>
        <Link href={`/apps/${app.slug}/`}>← {app.name}</Link>
      </nav>
      <main className="page privacy-page" dangerouslySetInnerHTML={{ __html: content }} />
      <footer className="page-footer">
        <Link href={`/apps/${app.slug}/`}>{app.name}</Link><span> · </span>
        <Link href={`/apps/${app.slug}/privacy/`}>プライバシーポリシー</Link><span> · </span>
        <a href="https://app.yutodev.com/#contact">サポート</a><span> · </span>
        <Link href="/">AppLibrary</Link>
      </footer>
    </div>
  );
}
