import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "เกี่ยวกับ JongJongDi.com",
  description: "รู้จัก JongJongDi แพลตฟอร์มจองที่พัก ทัวร์ดำน้ำ และบริการท่องเที่ยวครบวงจร",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutContent />
    </>
  );
}
