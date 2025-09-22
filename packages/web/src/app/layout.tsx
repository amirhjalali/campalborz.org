import { ReactNode } from "react";
import "../styles/globals.css";
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}