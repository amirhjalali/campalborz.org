import { ReactNode } from "react";
import "../styles/globals.css";
import { Playfair_Display, Inter } from 'next/font/google';
import { campConfig } from '../../../../config/camp.config';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Footer } from '../components/footer';
import { StructuredData } from '../components/structured-data';
import { pageMetadata, siteConfig } from '@/lib/metadata';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500'],
  display: 'swap',
});

// Use centralized metadata configuration
export const metadata = pageMetadata.home;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className="font-body antialiased">
        <div className="grain-overlay" aria-hidden="true" />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <div id="main-content" tabIndex={-1}>
                {children}
              </div>
              <Footer />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}