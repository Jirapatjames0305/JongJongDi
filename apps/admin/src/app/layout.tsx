import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JongJongDi Admin",
  description: "ระบบจัดการผู้ประกอบการ JongJongDi",
  icons: {
    // Same logo as the web favicon (blue square + "J" + amber dot) with an "ADMIN" label added
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232563EB'/%3E%3Ctext x='50' y='60' font-family='sans-serif' font-weight='bold' font-size='54' text-anchor='middle' fill='white'%3EJ%3C/text%3E%3Ccircle cx='73' cy='25' r='11' fill='%23F59E0B' stroke='white' stroke-width='3'/%3E%3Ctext x='50' y='89' font-family='sans-serif' font-weight='bold' font-size='20' letter-spacing='2' text-anchor='middle' fill='%23F59E0B'%3EADMIN%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={prompt.className}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-50 text-slate-700 antialiased">{children}</body>
    </html>
  );
}
