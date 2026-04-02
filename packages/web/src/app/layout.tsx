import { ReactNode, Suspense } from "react";
import type { Viewport } from 'next';
import "../styles/globals.css";
import { Playfair_Display, Inter } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
import { MotionProvider } from '../components/motion-provider';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Navigation } from '../components/navigation';
import { Footer } from '../components/footer';
import { StructuredData } from '../components/structured-data';
import { pageMetadata } from '@/lib/metadata';
import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500'],
  display: 'swap',
  preload: true,
});

// Use centralized metadata configuration
export const metadata = pageMetadata.home;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#2C2416' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Resource hints for external services */}
        <link rel="dns-prefetch" href="https://givebutter.com" />
        <link rel="preconnect" href="https://givebutter.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.instagram.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <StructuredData />
      </head>
      <body className="font-body antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <MotionProvider>
            <AuthProvider>
              <NotificationProvider>
                <Navigation />
                <div id="main-content" tabIndex={-1}>
                  <Suspense>
                    {children}
                  </Suspense>
                </div>
                <Footer />
                <Toaster position="top-right" richColors closeButton />
              </NotificationProvider>
            </AuthProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}