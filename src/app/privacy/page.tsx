import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/legal.css";

const title = "プライバシーポリシー — AppLibrary";
const description = "AppLibrary ウェブサイトにおける情報の取り扱いについて説明します。";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    url: "/privacy/",
    siteName: "AppLibrary",
    title,
    description,
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/ogp.png"] },
};

export default function SitePrivacyPage() {
  return (
    <main className="legal-page" lang="ja">
      <nav className="legal-nav"><Link href="/">← AppLibrary</Link></nav>
      <article className="legal-card">
        <p className="legal-eyebrow">AppLibrary</p>
        <h1>プライバシーポリシー</h1>
        <p className="legal-meta">
          制定日: <time dateTime="2026-09-01">2026年9月1日</time>
          {" · "}
          最終更新: <time dateTime="2026-09-16">2026年9月16日</time>
        </p>
        <p className="legal-language">本ページは日本語で提供しています。 <span lang="en">This page is available in Japanese only.</span></p>

        <p>
          AppLibrary（以下「本サイト」）は、uesugiyuuto が制作したアプリを紹介する静的なウェブサイトです。
          本ポリシーでは、本サイトを閲覧したときの情報の取り扱いを説明します。
        </p>

        <h2>1. 本サイトが収集する情報</h2>
        <p>
          本サイトにはアカウント、送信フォーム、コメント、アクセス解析、広告、トラッキング機能がなく、
          運営者が閲覧者の個人情報を直接収集する機能はありません。本サイトの実装は Cookie を使用しません。
        </p>

        <h2>2. 端末内に保存する設定</h2>
        <p>
          テーマと言語の表示設定を維持するため、ブラウザの localStorage に
          <code>applibrary_state</code> を保存します。また、冒頭アニメーションの再生済み状態を
          sessionStorage に保存します。これらは閲覧者の端末内だけで使用され、本サイトへ送信されません。
          ブラウザのサイトデータを削除すると消去できます。
        </p>

        <h2>3. ホスティング事業者による処理</h2>
        <p>
          本サイトは Vercel から配信されています。配信、安全性の確保、障害対応のため、Vercel が
          IP アドレス、リクエスト日時、ブラウザ情報などの通信情報を取り扱う場合があります。
          その取り扱いには Vercel のプライバシーポリシーが適用されます。
        </p>

        <h2>4. 外部サービスへのリンク</h2>
        <p>
          App Store、GitHub、X、アプリのお問い合わせフォーム（Google フォーム）などの外部サイトへのリンクがあります。
          リンク先での情報の取り扱いには、
          各サービスの規約とプライバシーポリシーが適用されます。
        </p>

        <h2>5. アプリごとのポリシー</h2>
        <p>
          掲載アプリで取り扱うデータは、各アプリの個別ページから参照できるプライバシーポリシーをご確認ください。
          本ページはウェブサイトの閲覧に関する方針です。
        </p>

        <h2>6. 変更とお問い合わせ</h2>
        <p>
          本ポリシーは、サイトの機能や配信方法の変更に応じて更新することがあります。
          ご質問はトップページに掲載している GitHub または X の連絡先からお寄せください。
        </p>
      </article>
      <footer className="legal-footer">
        <Link href="/terms/">利用規約</Link><span> · </span><Link href="/">AppLibrary</Link>
      </footer>
    </main>
  );
}
