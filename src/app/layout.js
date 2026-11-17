import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/config/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "CampusCart – Student Second-Hand Marketplace",
    template: "%s | CampusCart",
  },
  description:
    "CampusCart is a student-focused marketplace for buying, selling, giving away, and exchanging second-hand products. Good finds. Better prices. Campus connected.",
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  keywords: [
    "student marketplace",
    "second-hand",
    "campus",
    "textbooks",
    "electronics",
    "furniture",
    "buy",
    "sell",
    "exchange",
  ],
  category: "shopping",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    title: "CampusCart – Student Second-Hand Marketplace",
    description:
      "Buy, sell, give away, or swap second-hand textbooks, electronics, furniture, and hostel essentials with students nearby.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CampusCart – a student marketplace for second-hand campus essentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusCart – Student Second-Hand Marketplace",
    description:
      "Buy, sell, give away, or swap second-hand textbooks, electronics, furniture, and hostel essentials with students nearby.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#173d32",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full`}>
      <body className="min-h-dvh flex flex-col">
        <Suspense fallback={<div className="h-16 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]" />}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
