import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Story Generator',
  description: 'Create amazing stories with AI-generated text and images. Your stories are automatically saved for you to enjoy anytime.',
  keywords: ['AI', 'story generator', 'creative writing', 'artificial intelligence', 'storytelling'],
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