import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { AppLibrarySection } from "@/components/AppLibrarySection";
import { Posts, Contact, Footer } from "@/components/Sections";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="page">
        <Hero />
        <AppLibrarySection />
        <Posts />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
