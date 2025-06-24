'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white overflow-hidden">
      
      {/* Radial red glow */}
      <div className="absolute inset-0 z-0 bg-black before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(255,0,0,0.15),transparent_70%)]" />

      {/* Blinking stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white opacity-70 animate-blink"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-center items-center pt-[20vh] px-4">
        <Image 
          src="/Hackclubheader.png" 
          alt="Header" 
          width={800}
          height={400}
          className="w-full max-w-4xl h-auto object-contain drop-shadow-xl"
        />
      </header>

      {/* Buttons */}
      <main className="relative z-10 flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-10 text-base font-bold uppercase tracking-wide bg-red-600 text-white hover:bg-red-700 shadow-md hover:scale-105 transition-transform duration-300"
              >
                Apply Now
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-10 text-base font-bold uppercase tracking-wide border-red-500 text-red-300 hover:bg-red-900 hover:text-white hover:border-red-600 transition-colors duration-300 shadow-md hover:scale-105"
              >
                Login to Your Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700 py-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Recruitment Portal. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with 💻 and ☕</p>
        </div>
      </footer>

      {/* Blinking star animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-blink {
          animation: blink 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
