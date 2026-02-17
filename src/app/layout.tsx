import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { Inter, Space_Grotesk, Inconsolata, Dancing_Script, Montserrat } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inconsolataFont = Inconsolata({ variable: "--font-inconsolata", subsets: ["latin"] });

const dancingFont = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });

const montserratFont = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Endurance Estates",
  description: "App by Team Endurance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${spaceGrotesk.variable} ${inconsolataFont.variable} ${dancingFont.variable} ${montserratFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
} 
