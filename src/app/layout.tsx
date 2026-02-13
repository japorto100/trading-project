import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "TradeView Pro - Professional Trading Charts",
  description: "Professional trading platform with real-time charts, technical indicators, and market analysis tools.",
  keywords: ["Trading", "Charts", "Crypto", "Stocks", "Technical Analysis", "Candlestick", "Indicators"],
  authors: [{ name: "TradeView Pro" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "TradeView Pro",
    description: "Professional trading charts and analysis",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeView Pro",
    description: "Professional trading charts and analysis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
