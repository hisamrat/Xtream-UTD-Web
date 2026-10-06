import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { hasProductionUrl, siteConfig } from "@/config/site";
import { AppShell } from "@/features/shell/components/AppShell";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { getProductSummaries } from "@/server/catalog/get-catalog";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { ThemeScript } from "@/shared/theme/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  ...(hasProductionUrl ? { metadataBase: new URL(siteConfig.url) } : {}),
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalogue = await getProductSummaries();

  return (
    <html lang="en" className={inter.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell catalogue={catalogue}>{children}</AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
