import { Inter } from 'next/font/google';
import './globals.css';
import MUIThemeProvider from '../components/ThemeProvider';
import Navigation from '../components/Navigation';
import EmotionCacheProvider from '../components/EmotionCacheProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    default: 'MF Explorer - Professional Mutual Fund Analytics Platform',
    template: '%s | MF Explorer'
  },
  description: 'Professional mutual fund analytics and investment platform. Compare, analyze, and plan mutual fund investments with modern tools, SIP calculators, and clean insights. SEBI/AMFI compliant.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/mask-icon.svg', color: '#6366f1' },
    ],
  },
  keywords: [
    'mutual funds',
    'SIP calculator',
    'investment planning',
    'fund comparison',
    'portfolio management',
    'SEBI compliant',
    'AMFI registered',
    'financial analytics',
    'investment tools'
  ],
  authors: [{ name: 'MF Explorer Team' }],
  creator: 'MF Explorer',
  publisher: 'MF Explorer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'MF Explorer',
    title: 'MF Explorer - Professional Mutual Fund Analytics',
    description: 'Professional mutual fund analytics platform with advanced tools for investment planning and portfolio management.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MF Explorer - Mutual Fund Analytics Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mfexplorer',
    creator: '@mfexplorer',
    title: 'MF Explorer - Professional Mutual Fund Analytics',
    description: 'Professional mutual fund analytics platform with advanced investment tools.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MF Explorer",
    "description": "Professional mutual fund analytics and investment platform",
    "url": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "featureList": [
      "Mutual Fund Comparison",
      "SIP Calculator", 
      "Portfolio Management",
      "Investment Analytics",
      "Real-time Fund Data"
    ]
  };

  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="color-scheme" content="light dark" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={inter.className}>
        <EmotionCacheProvider>
          <MUIThemeProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50">
              Skip to main content
            </a>
            <Navigation />
            <main 
              id="main-content"
              role="main"
              aria-label="Main content"
              style={{ 
                maxWidth: '1400px', 
                margin: '0 auto', 
                padding: '80px 16px 24px 16px',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {children}
            </main>
            
            {/* Performance and Analytics Scripts */}
            <noscript>
              <iframe 
                src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
                height="0" 
                width="0" 
                style={{ display: 'none', visibility: 'hidden' }}
                title="Google Tag Manager"
              />
            </noscript>
          </MUIThemeProvider>
        </EmotionCacheProvider>
      </body>
    </html>
  );
}