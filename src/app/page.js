import GLRoot from "@/components/gl/GLRoot";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Preloader from "@/components/ui/Preloader";
import Cursor from "@/components/ui/Cursor";
import Header from "@/components/ui/Header";
import ContactModal from "@/components/ui/ContactModal";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Stats from "@/components/sections/Stats";
import Studio from "@/components/sections/Studio";
import Process from "@/components/sections/Process";
import Zcom from "@/components/sections/Zcom";
import Clients from "@/components/sections/Clients";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <GLRoot />
      <Header />
      <div className="site">
        <main>
          <Hero />
          <Manifesto />
          <Services />
          <Work />
          <Stats />
          <Studio />
          <Process />
          <Zcom />
          <Clients />
        </main>
        <Footer />
      </div>
      <ContactModal />
      <Cursor />
      <Preloader />
    </>
  );
}
