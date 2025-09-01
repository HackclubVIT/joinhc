import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Better Join Hackclub",
  description: "Hackclub Recruitment Portal",
  generator: "Next.js",
  referrer: "no-referrer",
  icons: {
    icon: [
      {
        url: "/hclogo.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/hclogo.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/hclogo.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/hclogo.png",
  },
  openGraph: {
    title: "Better Join Hackclub",
    description: "Join our community of innovators and creators",
    url: "join.hackclubvit.xyz",
    siteName: "Hackclub Recruitment Portal",
    images: [
      {
        url: "/hclogo.png",
        width: 1200,
        height: 630,
        alt: "HackClub Recruitment Portal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HackClub Recruitment Portal",
    description: "Join our community of innovators and creators",
    images: ["/hclogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <SonnerToaster 
          position="top-right"
          toastOptions={{
            style: {
              zIndex: 9999,
            },
          }}
        />
        <SpeedInsights />
      </body>
    </html>
  );
}
