import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'AI Story Generator',
    template: '%s · AI Story Generator',
  },
  description:
    'Create amazing stories with AI-generated text and images. Your stories are automatically saved for you to enjoy anytime.',
  keywords: [
    'AI',
    'story generator',
    'creative writing',
    'artificial intelligence',
    'storytelling',
  ],
  applicationName: 'AI Story Generator',
  authors: [{ name: 'AI Story Generator' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'AI Story Generator',
    siteName: 'AI Story Generator',
    description:
      'Create amazing stories with AI-generated text and images. Your stories are automatically saved for you to enjoy anytime.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'AI Story Generator – Create AI-powered stories with images',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Story Generator',
    description:
      'Create amazing stories with AI-generated text and images. Your stories are automatically saved for you to enjoy anytime.',
    images: ['/twitter-image'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
