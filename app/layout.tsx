import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HonorProxy",
  description: "Someone will stand at their grave for you. Personal, respectful proxy visits to major U.S. military cemeteries — starting with Arlington, Fort Snelling, Golden Gate, and Quantico.",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://honorproxy.com'),
  openGraph: {
    title: "HonorProxy",
    description: "Someone will stand at their grave for you. A real person visits on your behalf and brings back photos and a personal reflection.",
    images: [{ url: '/og-banner.jpg' }],
    siteName: "HonorProxy",
  },
  twitter: {
    card: 'summary_large_image',
    title: "HonorProxy",
    description: "Someone will stand at their grave for you. Respectful proxy visits to national cemeteries for those who cannot be there.",
    images: ['/og-banner.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f6f1]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
