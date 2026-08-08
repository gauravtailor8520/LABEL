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
      <head>
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;

                function isExtensionError(args) {
                  try {
                    for (let i = 0; i < args.length; i++) {
                      const arg = args[i];
                      if (!arg) continue;
                      const argStr = typeof arg === 'string' ? arg : (arg.message || arg.stack || arg.toString?.() || '');
                      if (
                        argStr.includes('extension://') ||
                        argStr.includes('inpage.js') ||
                        argStr.toLowerCase().includes('metamask')
                      ) {
                        return true;
                      }
                    }
                  } catch (e) {
                    // Safe fallback
                  }
                  return false;
                }

                console.error = function(...args) {
                  if (isExtensionError(args)) return;
                  originalConsoleError.apply(console, args);
                };

                console.warn = function(...args) {
                  if (isExtensionError(args)) return;
                  originalConsoleWarn.apply(console, args);
                };

                window.addEventListener('error', function(event) {
                  const message = event.message || '';
                  const filename = event.filename || '';
                  const errorStack = event.error?.stack || '';
                  const isExtension =
                    filename.includes('extension://') ||
                    errorStack.includes('extension://') ||
                    message.includes('extension://') ||
                    errorStack.includes('inpage.js') ||
                    message.toLowerCase().includes('metamask');
                  if (isExtension) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason;
                  if (!reason) return;
                  const stack = reason.stack || '';
                  const message = reason.message || '';
                  const reasonStr = typeof reason === 'string' ? reason : (reason.toString?.() || '');
                  const isExtension =
                    stack.includes('extension://') ||
                    message.includes('extension://') ||
                    reasonStr.includes('extension://') ||
                    stack.includes('inpage.js') ||
                    reasonStr.toLowerCase().includes('metamask') ||
                    message.toLowerCase().includes('metamask');
                  if (isExtension) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);
              })();
            `
          }}
        />
      </head>
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
