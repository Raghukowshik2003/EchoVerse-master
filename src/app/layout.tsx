// src/app/layout.tsx (Temporary Simplified Version)
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";


const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "EchoVerse",
  description: "Real-time AI Translation",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#000000"/>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png"/>
      </head>
      <body className={inter.className}>
          <Navbar />
          {children} {/* Render the main content */}
      </body>
    </html>
  );
}
