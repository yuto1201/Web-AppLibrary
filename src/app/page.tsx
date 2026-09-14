import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AppsSection } from "@/components/AppsSection";
import { Stickers } from "@/components/Stickers";
import { Posts, Contact, Footer } from "@/components/Sections";
import { ActivateProvider } from "@/lib/activate";

export default function HomePage() {
  return (
    <ActivateProvider>
      <div className="poster">
        <Nav />
        <main className="page">
          <Hero />
          <AppsSection />
          <Posts />
          <Contact />
        </main>
        <Footer />
        <Stickers />
      </div>
    </ActivateProvider>
  );
}
