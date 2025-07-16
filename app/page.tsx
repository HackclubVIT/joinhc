"use client";

import Link from "next/link";
import { Montserrat } from 'next/font/google';
import { Button } from "@/components/ui/button";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-montserrat',
});

export default function Home() {
  return (
    <div className={`relative flex flex-col text-white ${montserrat.variable} font-sans`}>

      {/* Bottom red blob */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Nav */}
        <nav className="flex-shrink-0 border-b border-gray-800 bg-black/50 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent w-full animate-slideRight opacity-70"></div>

          <div className="container mx-auto max-w-7xl px-4 py-4 relative z-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300 bg-gradient-to-r from-red-600 to-orange-500">
                  <span className="text-white font-black text-2xl">h.</span>
                </div>
                <span className="text-2xl font-black text-white">HackClub</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="outline" className="group relative px-6 py-2 border-2 border-red-500 hover:border-red-400 hover:bg-red-900/30 rounded-lg text-red-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-105">
                    LOGIN
                  </Button>
                </Link>

                <Link href="/register">
                  <Button className="group relative px-6 py-2 bg-black border-2 border-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-all duration-300 transform group-hover:scale-105">
                    JOIN US
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header Section */}
        <header className="flex-shrink-0 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-2xl bg-gradient-to-r from-red-700 to-orange-600">
                <span className="text-white font-black text-4xl">h.</span>
              </div>
              <span className="text-6xl font-black text-white">
                HackClub
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Recruitment Portal
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join our community of coders, makers, and creators building the
                future of technology.
              </p>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="group p-6 rounded-xl bg-black border-2 border-red-900 hover:border-red-500 transition-all duration-300">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">Launch Projects</h3>
                <p className="text-red-300">Build and ship real projects that matter</p>
              </div>

              <div className="group p-6 rounded-xl bg-black border-2 border-red-900 hover:border-red-500 transition-all duration-300">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">Connect</h3>
                <p className="text-red-300">Network with like-minded developers</p>
              </div>

              <div className="group p-6 rounded-xl bg-black border-2 border-red-900 hover:border-red-500 transition-all duration-300">
                <div className="text-3xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-white mb-2">Learn</h3>
                <p className="text-red-300">Grow your skills through hands-on experience</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom styles as Tailwind utility classes and global CSS (see globals.css for keyframes) */}
      {/* Add the following to your globals.css if not present:
        @keyframes slideRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
        .animate-slideRight { animation: slideRight 3s ease-in-out infinite; }
        .bottom-red-blob { ... } // see original for details
      */}
    </div>
  );
}
