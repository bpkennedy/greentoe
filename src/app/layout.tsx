import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/contexts";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono", 
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GreenToe - Financial Education for Young Investors",
  description: "Learn about investing, manage your watch-list, and explore index funds with interactive lessons designed for young investors. Build financial literacy through hands-on experience.",
  keywords: "financial education, investing, teenagers, index funds, stock market, financial literacy",
  authors: [{ name: "GreenToe" }],
  creator: "GreenToe Financial Education",
  publisher: "GreenToe",
  openGraph: {
    title: "GreenToe - Financial Education for Young Investors",
    description: "Learn about investing and build financial literacy through interactive lessons and real market data.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenToe - Financial Education for Young Investors",
    description: "Learn about investing and build financial literacy through interactive lessons and real market data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AppProvider>
          <div data-testid="app-ready">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
