import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AppsSection } from "@/components/AppsSection";
import { Stickers } from "@/components/Stickers";
import { Workshop, Posts, Contact, Footer } from "@/components/Sections";
import { ActivateProvider } from "@/lib/activate";
import { FallingFooter } from "@/components/FallingFooter";

export const metadata: Metadata = {
  alternates: { canonical: "/apps/" },
  openGraph: {
    type: "website",
    url: "/apps/",
    siteName: "AppLibrary",
    title: "AppLibrary — uesugiyuuto のアプリ",
    description: "個人開発しているアプリの紹介ライブラリ。",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "AppLibrary — つくったアプリたち" }],
  },
};

export default function AppsHomePage() {
  return (
    <ActivateProvider>
      <div className="poster">
        <Nav />
        {/* シールは紙の上に見えるので、フッターの後ではなく Nav の次に置く。 */}
        <Stickers />
        <main className="page">
          <Hero />
          <AppsSection />
          <Workshop />
          <Posts />
          <Contact />
        </main>
        <FallingFooter>
          <Footer />
        </FallingFooter>
      </div>
    </ActivateProvider>
  );
}
