import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/legal.css";

const title = "利用規約 — AppLibrary";
const description = "AppLibrary ウェブサイトの利用条件について説明します。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    url: "/terms/",
    siteName: "AppLibrary",
    title,
    description,
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/ogp.png"] },
};

export default function TermsPage() {
  return (
    <main className="legal-page" lang="ja">
      <nav className="legal-nav"><Link href="/apps/">← AppLibrary</Link></nav>
      <article className="legal-card">
        <p className="legal-eyebrow">AppLibrary</p>
        <h1>利用規約</h1>
        <p className="legal-meta">制定日: <time dateTime="2026-09-01">2026年9月1日</time></p>
        <p className="legal-language">本ページは日本語で提供しています。 <span lang="en">This page is available in Japanese only.</span></p>

        <p>
          この利用規約（以下「本規約」）は、uesugiyuuto が運営する AppLibrary（以下「本サイト」）の
          利用条件を定めるものです。本サイトを利用する方は、本規約に同意したものとみなします。
        </p>

        <h2>1. 本サイトの目的</h2>
        <p>
          本サイトは、運営者が制作したアプリの概要、画像、配布先、関連文書を紹介するために提供します。
          アプリの提供条件は、App Store など各配布先に表示される条件が優先します。
        </p>

        <h2>2. 禁止事項</h2>
        <p>本サイトの利用にあたり、次の行為を禁止します。</p>
        <ul>
          <li>法令または公序良俗に反する行為</li>
          <li>本サイトの運営を妨害し、または不正にアクセスする行為</li>
          <li>掲載内容を出所を偽って再配布する行為</li>
          <li>第三者の権利を侵害する行為</li>
        </ul>

        <h2>3. 知的財産権</h2>
        <p>
          本サイトに掲載する文章、画像、アプリ名、ロゴなどの権利は、運営者または正当な権利者に帰属します。
          法令で認められる範囲を超えて利用する場合は、事前の許諾が必要です。
        </p>

        <h2>4. 外部サービス</h2>
        <p>
          本サイトから移動した App Store、GitHub、X などの外部サービスについて、運営者はその内容や
          継続的な提供を保証しません。各サービスの利用条件をご確認ください。
        </p>

        <h2>5. 免責事項</h2>
        <p>
          掲載内容は更新時点の情報です。運営者は正確性の維持に努めますが、内容の完全性、特定目的への適合性、
          常時利用可能であることを保証しません。本サイトの利用によって生じた損害について、法令で認められる範囲で責任を負いません。
        </p>

        <h2>6. 変更とお問い合わせ</h2>
        <p>
          本規約は、必要に応じて変更することがあります。変更後の内容は本ページへ掲載した時点から適用します。
          ご質問はトップページに掲載している GitHub または X の連絡先からお寄せください。
        </p>
      </article>
      <footer className="legal-footer">
        <Link href="/privacy/">プライバシー</Link><span> · </span><Link href="/apps/">AppLibrary</Link>
      </footer>
    </main>
  );
}
