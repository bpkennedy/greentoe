import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
  title: {
    default: "GreenToe - Financial Education for Young Investors",
    template: "%s | GreenToe"
  },
  description: "Learn about investing, manage your watch-list, and explore index funds with interactive lessons designed for young investors. Build financial literacy through hands-on experience.",
  keywords: [
    "financial education",
    "investing for teenagers", 
    "index funds",
    "stock market education",
    "financial literacy",
    "young investors",
    "investment learning",
    "financial planning teens"
  ],
  authors: [{ name: "GreenToe", url: "https://greentoe.app" }],
  creator: "GreenToe Financial Education",
  publisher: "GreenToe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://greentoe.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "GreenToe - Financial Education for Young Investors",
    description: "Learn about investing and build financial literacy through interactive lessons and real market data. Perfect for teenagers and young adults starting their investment journey.",
    url: "https://greentoe.app",
    siteName: "GreenToe",
    images: [
      {
        url: "/logo-horizontal.svg",
        width: 160,
        height: 40,
        alt: "GreenToe - Financial Education Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenToe - Financial Education for Young Investors",
    description: "Learn about investing and build financial literacy through interactive lessons and real market data.",
    images: ["/logo-horizontal.svg"],
    creator: "@greentoe_edu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/logo-icon.svg', color: '#22c55e' },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'education',
  classification: 'Education, Finance, Investment Learning',
  referrer: 'origin-when-cross-origin',

  verification: {
    // Add verification tokens here when needed
    // google: 'verification-token',
    // yandex: 'verification-token',
    // yahoo: 'verification-token',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GreenToe',
  },
  applicationName: 'GreenToe',
  generator: 'Next.js',
  abstract: 'Interactive financial education platform for young investors to learn about investing, index funds, and market analysis.',
  appLinks: {
    web: {
      url: 'https://greentoe.app',
      should_fallback: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
      colorScheme: 'light',
    themeColor: '#22c55e',
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
        <Script 
          id="website-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "GreenToe",
            "alternateName": "GreenToe Financial Education",
            "url": "https://greentoe.app",
            "description": "Interactive financial education platform for young investors to learn about investing, index funds, and market analysis.",
            "inLanguage": "en-US",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://greentoe.app/lessons/{search_term_string}"
              },
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "GreenToe",
              "url": "https://greentoe.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://greentoe.app/logo-horizontal.svg",
                "width": 160,
                "height": 40
              }
            }
          })}
        </Script>
        <Script 
          id="educational-org-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "GreenToe",
            "url": "https://greentoe.app",
            "description": "Financial education platform teaching young investors about investing, index funds, and market analysis through interactive lessons.",
            "logo": {
              "@type": "ImageObject",
              "url": "https://greentoe.app/logo-horizontal.svg",
              "width": 160,
              "height": 40
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "educationalCredentialAwarded": "Financial Literacy Certificate",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Financial Education Courses",
              "itemListElement": [
                {
                  "@type": "Course",
                  "name": "Understanding Stocks and Index Funds",
                  "description": "Learn the basics of stocks and index funds for young investors",
                  "provider": {
                    "@type": "Organization",
                    "name": "GreenToe"
                  }
                },
                {
                  "@type": "Course", 
                  "name": "Reading Performance Charts",
                  "description": "Master the art of reading and interpreting stock performance charts",
                  "provider": {
                    "@type": "Organization",
                    "name": "GreenToe"
                  }
                },
                {
                  "@type": "Course",
                  "name": "Investment Research and Analysis", 
                  "description": "Learn how to research investments before making decisions",
                  "provider": {
                    "@type": "Organization",
                    "name": "GreenToe"
                  }
                }
              ]
            }
          })}
        </Script>
        <AppProvider>
          <div data-testid="app-ready">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
