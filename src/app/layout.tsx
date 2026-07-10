import type { Metadata } from "next";
import { Geist, Glass_Antiqua, Cormorant_Garamond } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const glassAntiqua = Glass_Antiqua({
  variable: "--font-glass",
  weight: "400",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["300", "400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magdalen Rozsa",
  description: "Sydney-based Watercolour and Oil Artist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${glassAntiqua.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SiteNav />
      </body>
    </html>
  );
}
