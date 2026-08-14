import type { Metadata } from "next";
import { Playfair_Display, Outfit, Cairo } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cartStore";
import { ToastProvider } from "@/providers/ToastProvider";
import CartDrawer from "@/components/CartDrawer";
import SmoothScroll from "@/components/SmoothScroll";
import SplashScreen from "@/components/SplashScreen";
import ScrollToTop from "@/components/ScrollToTop";
import RoutePrefetcher from "@/components/RoutePrefetcher";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import "./globals.css";


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});


const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deroma.store";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "DeRoma Store | Premium Women's Shoes & Curated Footwear",
    template: "%s | DeRoma Store",
  },
  description: "Curated boutique collection of elegant women's shoes with cushioned comfort, everyday support, and fast nationwide delivery.",
  keywords: ["women's shoes", "DeRoma shoes", "curated footwear", "Egyptian boutique", "comfortable heels", "sneakers", "women's sneakers"],
  openGraph: {
    title: "DeRoma Store | Premium Women's Shoes",
    description: "Curated boutique collection of elegant women's shoes with cushioned comfort & fast nationwide delivery.",
    url: baseUrl,
    siteName: "DeRoma Store",
    images: [
      {
        url: "/banners/hero-1-desktop.webp",
        width: 1200,
        height: 630,
        alt: "DeRoma Store Women's Shoes Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeRoma Store | Premium Women's Shoes",
    description: "Curated boutique collection of elegant women's shoes with cushioned comfort.",
    images: ["/banners/hero-1-desktop.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DeRoma Store",
  url: baseUrl,
  logo: `${baseUrl}/banners/hero-1-desktop.webp`,
  sameAs: [
    "https://instagram.com",
    "https://facebook.com",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    areaServed: "EG",
    availableLanguage: ["en", "ar"],
  },
};

import { StoreI18nProvider } from "@/providers/StoreI18nContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>

      <body className={`${playfair.variable} ${outfit.variable} ${cairo.variable} font-playfair antialiased`}>
        <ToastProvider>
          <StoreI18nProvider>
            <RoutePrefetcher />
            <SmoothScroll />
            <ScrollToTop />
            <SplashScreen />
            <AnalyticsScripts />
            <CartProvider>
              <SiteChrome>{children}</SiteChrome>
              <CartDrawer />
            </CartProvider>
          </StoreI18nProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
