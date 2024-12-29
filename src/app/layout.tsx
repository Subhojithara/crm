"use client"

import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <ClerkProvider>
    <html lang="en">
      <head>
        <script
        />
      </head>
      <body
        className={isClient ? `${geistSans.variable} ${geistMono.variable} antialiased` : ''}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
