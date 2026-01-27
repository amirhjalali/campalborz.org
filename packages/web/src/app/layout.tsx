import { ReactNode } from "react";
import "../styles/globals.css";
import { Playfair_Display, Crimson_Text, Montserrat } from 'next/font/google';
import { campConfig } from '../../../../config/camp.config';
import { ThemeProvider } from '../components/theme-provider';
import { AuthProvider } from '../contexts/AuthContext';
import { Footer } from '../components/footer';
import { pageMetadata, siteConfig } from '@/lib/metadata';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
});

const crimson = Crimson_Text({
  subsets: ['latin'],
  variable: '--font-crimson',
  weight: ['400', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600'],
});

// Use centralized metadata configuration
export const metadata = pageMetadata.home;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable} ${montserrat.variable}`} suppressHydrationWarning>
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