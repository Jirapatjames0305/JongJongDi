import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendingSection from "@/components/TrendingSection";
import ProductsSection from "@/components/ProductsSection";
import ServicesSection from "@/components/ServicesSection";
import B2BSection from "@/components/B2BSection";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastContext";

export default function HomePage() {
  return (
    <ToastProvider>
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <TrendingSection />
      <ProductsSection />
      <B2BSection />
      <Footer />
    </ToastProvider>
  );
}
