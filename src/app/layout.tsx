import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cartStore";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeRoma Store | Women's Premium Shoes",
  description: "Modern, handcrafted boutique collection of elegant women's shoes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${playfair.variable} ${outfit.variable} font-playfair antialiased`}>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[#FFF9EB] text-[#942E3A]">
            <Navbar />
            <main className="flex-1 pt-[72px] sm:pt-[80px]">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
