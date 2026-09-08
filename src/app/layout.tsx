import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { SiteStateProvider } from "@/lib/state";
import project from "../../config/project.json";
import "./globals.css";

// 自己ホストする。外部 CDN への追加リクエストが無くなり、静的出力とも相性がよい。
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// 見出し・アプリ名・ワードマーク用。Inter だけだと既定の顔になるため、
// ラテン部分にだけ性格のある書体を当てる（日本語は OS のゴシックへ落ちる）。
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(project.productionUrl),
  // iOS 限定から全プラットフォームへスコープを広げたため、旧 "iOS Apps" を改めた。
  title: "AppLibrary — uesugiyuuto のアプリ",
  description: "個人開発しているアプリの紹介ライブラリ。iOS / macOS / Web など、作ったものをまとめています。",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AppLibrary",
    title: "AppLibrary — uesugiyuuto のアプリ",
    description: "個人開発しているアプリの紹介ライブラリ。",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary — つくったアプリたち" }],
  },
  twitter: { card: "summary_large_image", images: ["/ogp.png"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * first paint 前に保存済みテーマを適用する。
 * ここを React 側へ移すと hydration 前に一瞬デフォルト配色が出るため、
 * 旧 index.html と同じくインラインスクリプトのまま維持する。
 */
const restoreTheme = `(function(){var h=document.documentElement;h.setAttribute('data-theme','light');try{var s=JSON.parse(localStorage.getItem('applibrary_state')||'null');if(s){if(s.lang)h.lang=s.lang;if(s.theme)h.setAttribute('data-theme',s.theme);}}catch(e){}try{var seen=sessionStorage.getItem('applibrary_hero_seen');var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(seen||rm){h.setAttribute('data-hero-opening','off');}else{h.setAttribute('data-hero-opening','play');sessionStorage.setItem('applibrary_hero_seen','1');}}catch(e){h.setAttribute('data-hero-opening','off');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${bricolage.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: restoreTheme }} />
      </head>
      <body>
        <SiteStateProvider>{children}</SiteStateProvider>
      </body>
    </html>
  );
}
