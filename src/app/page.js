import GLRoot from "@/components/gl/GLRoot";
import SmoothScroll from "@/components/ui/SmoothScroll";
import Preloader from "@/components/ui/Preloader";
import Cursor from "@/components/ui/Cursor";
import Header from "@/components/ui/Header";
import ContactModal from "@/components/ui/ContactModal";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Work from "@/components/sections/Work";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Numbers from "@/components/sections/Numbers";
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
          <Intro />
          <Work />
          <Services />
          <Process />
          <Numbers />
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
