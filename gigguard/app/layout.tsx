import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GigGuard — AI-Powered Income Protection",
  description:
    "Parametric income protection for India's quick-commerce gig workers. Automated payouts when disruptions hit.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050b15] min-h-screen text-slate-100`}>
        <div className="fixed inset-0 bg-grid pointer-events-none" />
        <div className="fixed inset-0 bg-radial-emerald pointer-events-none" />
        <Navbar />
        <main className="relative max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
