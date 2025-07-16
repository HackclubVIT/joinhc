import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Recruitment Portal",
  description: "A full-stack recruitment portal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " relative min-h-screen text-white cosmic-bg"}>
        {/* Animated morphing red blob at the bottom edge */}
        <div className="bottom-red-blob"></div>
        {/* Stars falling or moving in circles */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="star falling"
            style={{
              top: `${Math.random() * 100}vh`,
              left: `${Math.random() * 100}vw`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
        {/* Main app content above background */}
        <div className="relative z-10 flex flex-col flex-1">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
