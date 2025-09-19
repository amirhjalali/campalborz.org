import { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata = {
  title: "Camp Management Platform",
  description: "Multi-tenant platform for Burning Man camps and festival organizations",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}