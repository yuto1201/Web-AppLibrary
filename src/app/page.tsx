import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AppsSection } from "@/components/AppsSection";
import { Stickers } from "@/components/Stickers";
import { Posts, Contact, Footer } from "@/components/Sections";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="page">
        <Hero />
        <AppsSection />
        <Stickers />
        <Posts />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
