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
  title: "LABEL - AI Dataset & YOLO Annotation Studio",
  description: "Advanced high-contrast desktop studio for YOLO object detection, dataset management, and AI annotations.",
  keywords: ["LABEL", "YOLO", "Annotation Studio", "Dataset Management", "Computer Vision AI"],
  authors: [{ name: "LABEL Team" }],
  icons: {
    icon: [
      { url: "/assets/favicon.ico" },
      { url: "/assets/favicon.png", type: "image/png" },
      { url: "/assets/logo.png", type: "image/png" },
      { url: "/assets/logo.svg", type: "image/svg+xml" }
    ],
    shortcut: "/assets/favicon.png",
    apple: "/assets/logo.png",
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
