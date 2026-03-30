import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Label Studio - Professional Document & Invoice Labeling",
  description: "Advanced YOLO annotation tool for invoices and PDF documents. Built with Next.js, Tailwind CSS, and optimized for high-speed labeling.",
  keywords: ["Label Studio", "YOLO", "Annotation Tool", "Invoice Labeling", "Document AI", "Machine Learning Data"],
  authors: [{ name: "Label Studio Team" }],
  icons: {
    icon: "https://labelstud.io/images/label-studio-logo.svg",
  },
  openGraph: {
    title: "Label Studio",
    description: "Professional Document & Invoice Labeling Tool",
    url: "https://labelstud.io",
    siteName: "Label Studio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
