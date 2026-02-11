import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSenseScript } from '@/components/AdSense';

export const metadata = {
  title: {
    default: 'Info Bytes — Trending News, Movie Reviews & Finance',
    template: '%s | Info Bytes',
  },
  description: 'Trending news, movie reviews, TV series updates, financial insights & bite-sized content — powered by AI, updated daily.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  keywords: ['trending news', 'movie reviews', 'TV series', 'finance', 'stock market', 'technology', 'crypto', 'bollywood', 'hollywood', 'streaming'],
  authors: [{ name: 'Info Bytes Editorial' }],
  creator: 'Info Bytes',
  publisher: 'Info Bytes',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Info Bytes',
    title: 'Info Bytes — Trending News, Movie Reviews & Finance',
    description: 'Trending news, movie reviews, TV series updates, financial insights & bite-sized content — powered by AI, updated daily.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Info Bytes — Trending News, Movie Reviews & Finance',
    description: 'Trending news, movie reviews & finance updates — updated daily.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <AdSenseScript />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Info Bytes',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              description: 'Trending news, movie reviews, TV series updates, financial insights & bite-sized content.',
              publisher: {
                '@type': 'Organization',
                name: 'Info Bytes',
                logo: { '@type': 'ImageObject', url: '/icon.svg' },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: { '@type': 'EntryPoint', urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/search?q={search_term_string}` },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
