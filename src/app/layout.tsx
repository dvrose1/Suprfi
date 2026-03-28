import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://suprfi.com'),
  title: "SuprFi - End-to-end financing infrastructure, built for the field",
  description: "AI-powered financing for home services. Embedded into the tools contractors already use.",
  keywords: "home repair financing, HVAC financing, plumbing loans, emergency repair financing, contractor financing",
  authors: [{ name: "SuprFi" }],
  icons: {
    icon: "/logos/suprfi-s-icon.svg",
    apple: "/logos/suprfi-s-icon.svg",
  },
  openGraph: {
    title: "SuprFi - End-to-end financing infrastructure, built for the field",
    description: "AI-powered financing for home services. Embedded into the tools contractors already use.",
    type: "website",
    siteName: "SuprFi",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuprFi - End-to-end financing infrastructure, built for the field",
    description: "AI-powered financing for home services. Embedded into the tools contractors already use.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-body antialiased">
        {/* Skip to main content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
