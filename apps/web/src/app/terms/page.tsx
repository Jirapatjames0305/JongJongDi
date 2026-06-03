import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "ข้อกำหนดและเงื่อนไข",
  description: "ข้อกำหนดและเงื่อนไขการใช้บริการ JongJongDi.com",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <TermsContent />
    </>
  );
}
