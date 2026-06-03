import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_TITLE = "JongJongDi - จองจองดิ | จองง่าย ครบ จบที่เดียว";
const SITE_DESC = "จองง่าย ครบ จบในที่เดียว! ที่พัก ทัวร์ดำน้ำ และบริการท่องเที่ยวที่คุณวางใจ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | JongJongDi" },
  description: SITE_DESC,
  keywords: ["จองที่พัก", "ทัวร์ดำน้ำ", "JongJongDi", "จองจองดิ", "booking", "Thailand travel"],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232563EB'/%3E%3Ctext x='50' y='75' font-family='sans-serif' font-weight='bold' font-size='60' text-anchor='middle' fill='white'%3EJ%3C/text%3E%3Ccircle cx='72' cy='28' r='12' fill='%23F59E0B' stroke='white' stroke-width='3'/%3E%3C/svg%3E",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "JongJongDi",
    title: SITE_TITLE,
    description: SITE_DESC,
    // og image auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={prompt.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="text-slate-700 bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
