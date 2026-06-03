import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import ServicesSection from "@/components/ServicesSection";
import B2BSection from "@/components/B2BSection";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastContext";

export default function HomePage() {
  return (
    <ToastProvider>
      <Navbar />
      <HeroSection />
      <TrendingSection />
      <ServicesSection />
      <B2BSection />
      <Footer />
    </ToastProvider>
  );
}
