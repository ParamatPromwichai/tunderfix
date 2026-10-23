import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import "./mobile.css";
import "./experience.css";
import "./urgent-form.css";
import "./scheduled-form.css";
import "./job-detail.css";
import "./urgent-tracking.css";
import "./technician-urgent.css";
import "./mobile-readability.css";
import "./explore-filters.css";
import { InteractionEffects } from "@/components/InteractionEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const thaiSans = Noto_Sans_Thai({
  variable: "--font-thai-sans",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThunderFix | หาและจัดการงานช่าง",
  description:
    "แพลตฟอร์มค้นหาช่างใกล้บ้าน เปิดงานซ่อม ติดตามสถานะ และจัดการงานบริการ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${thaiSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <InteractionEffects />
        {children}
      </body>
    </html>
  );
}
