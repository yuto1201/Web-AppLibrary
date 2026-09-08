"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AppsSection } from "@/components/AppsSection";
import { Stickers } from "@/components/Stickers";
import { Posts, Contact, Footer } from "@/components/Sections";

export default function HomePage() {
  // 一覧行とステッカー帯を slug で相互連動させるための共有状態。
  // 両者は兄弟なので、ここに持ち上げる以外の選択肢が実質ない規模。
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <>
      <Nav />
      <main className="page">
        <Hero />
        <AppsSection activeSlug={activeSlug} onHoverSlug={setActiveSlug} />
        <Stickers activeSlug={activeSlug} onHoverSlug={setActiveSlug} />
        <Posts />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
