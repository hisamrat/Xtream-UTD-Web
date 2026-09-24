import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getAllProducts } from "@/lib/products";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { LanguageProvider } from "@/components/site/LanguageProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BottomSwitch } from "@/components/site/BottomSwitch";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Xtream UTD Product Catalogue",
    template: "%s | Xtream UTD"
  },
  description: siteConfig.description,
  openGraph: {
    title: "Xtream UTD Product Catalogue",
    description: siteConfig.description,
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const products = getAllProducts();

  return (
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('xtream-theme');if(t==='light'){document.documentElement.dataset.theme='light';document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');document.documentElement.style.colorScheme='light';}else{document.documentElement.dataset.theme='dark';document.documentElement.classList.remove('light');document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}})();`
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <div className="site-shell">
                <Header products={products} />
                {children}
                <Footer />
                <BottomSwitch />
                <CartDrawer />
              </div>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
