import { ReactNode } from "react";
import "../styles/globals.css";
import { Playfair_Display, Crimson_Text, Montserrat } from 'next/font/google';

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
  title: "Camp Alborz - Burning Man Theme Camp",
  description: "Where Persian hospitality meets the spirit of Burning Man. A 501(c)(3) non-profit celebrating culture, art, and community.",
  keywords: ["Burning Man", "Theme Camp", "Persian Culture", "Camp Alborz", "Black Rock City", "Art", "Community"],
  authors: [{ name: "Camp Alborz" }],
  openGraph: {
    title: "Camp Alborz - Burning Man Theme Camp",
    description: "Where Persian hospitality meets the spirit of Burning Man",
    url: "https://campalborz.org",
    siteName: "Camp Alborz",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camp Alborz - Burning Man Theme Camp",
    description: "Where Persian hospitality meets the spirit of Burning Man",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${crimson.variable} ${montserrat.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}