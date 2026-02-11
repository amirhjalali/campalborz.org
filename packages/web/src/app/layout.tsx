import { ReactNode } from "react";
import "../styles/globals.css";
import { Cinzel, Cormorant, Inter } from 'next/font/google';
import { campConfig } from '../../../../config/camp.config';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../contexts/AuthContext';
import { Footer } from '../components/footer';
import { pageMetadata, siteConfig } from '@/lib/metadata';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
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
    <html lang="en" className={`${cinzel.variable} ${cormorant.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <main id="main-content">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}