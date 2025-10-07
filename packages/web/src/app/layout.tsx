import { ReactNode } from "react";
import "../styles/globals.css";
import { Playfair_Display, Crimson_Text, Montserrat } from 'next/font/google';
import { campConfig } from '../../../../config/camp.config';
import { brandConfig } from '../../../../config/brand.config';
import { ThemeProvider } from '../components/ThemeProvider';

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

export const metadata = {
  title: `${campConfig.name} - Burning Man Theme Camp`,
  description: `${campConfig.tagline}. A ${campConfig.taxStatus} non-profit celebrating culture, art, and community.`,
  keywords: ["Burning Man", "Theme Camp", campConfig.cultural.heritage + " Culture", campConfig.name, "Black Rock City", "Art", "Community"],
  authors: [{ name: campConfig.name }],
  openGraph: {
    title: `${campConfig.name} - Burning Man Theme Camp`,
    description: campConfig.tagline,
    url: campConfig.website,
    siteName: campConfig.name,
    images: [
      {
        url: brandConfig.assets.ogImage,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${campConfig.name} - Burning Man Theme Camp`,
    description: campConfig.tagline,
    images: [brandConfig.assets.ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable} ${montserrat.variable}`}>
      <body className="font-body antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}