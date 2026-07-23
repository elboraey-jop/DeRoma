import type { Metadata } from "next";
import { Fredoka, Playfair_Display, Outfit } from "next/font/google";
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

const fredoka = Fredoka({
  variable: "--font-numeric",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      <body className={`${playfair.variable} ${outfit.variable} ${fredoka.variable} font-outfit antialiased`}>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-[#FFF9EB] text-[#005F6B]">
            <Navbar />
            <main className="flex-1">
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
