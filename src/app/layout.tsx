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
  title: "SuprFi - The Home Repair Financing Specialists",
  description: "Fast, fair financing for home repairs from $2,500 to $25,000. Instant approval, flexible terms, trusted by contractors.",
  keywords: "home repair financing, HVAC financing, plumbing loans, emergency repair financing, contractor financing",
  authors: [{ name: "SuprFi" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SuprFi - The Home Repair Financing Specialists",
    description: "Instant approval for home repairs. Flexible terms. Trusted by contractors.",
    type: "website",
    siteName: "SuprFi",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuprFi - Fast Home Repair Financing",
    description: "Get approved in minutes for repairs from $2,500-$25,000",
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
        {children}
      </body>
    </html>
  );
}
