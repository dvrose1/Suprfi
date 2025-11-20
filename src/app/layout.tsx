import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuprFi - The Home Repair Financing Specialists",
  description: "Fast, fair financing for home repairs from $2,500 to $25,000. Instant approval, flexible terms, trusted by contractors.",
  keywords: "home repair financing, HVAC financing, plumbing loans, emergency repair financing, contractor financing",
  authors: [{ name: "SuprFi" }],
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
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
