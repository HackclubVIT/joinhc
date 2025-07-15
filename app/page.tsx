'use client'

import Link from "next/link"

export default function Home() {
  return (
    
    <div className="relative flex min-h-screen flex-col bg-black text-white overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Bottom red blob (same as registration page) */}
      <div className="bottom-red-blob" />
       
      {/* Main content container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <nav className="flex-shrink-0 border-b border-gray-800 bg-black/50 backdrop-blur-md relative overflow-hidden">
          {/* Animated red gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent w-full animate-slideRight opacity-70"></div>
          
          <div className="container mx-auto max-w-7xl px-4 py-4 relative z-10">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300">
                  <span className="text-red-600 font-black text-2xl">h.</span>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-red-500 via-orange-400 to-purple-500 bg-clip-text text-transparent">
                  HackClub
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <button className="group relative px-6 py-2 border-2 border-red-500 hover:border-red-400 hover:bg-red-900/30 rounded-lg text-red-300 hover:text-white font-semibold transition-all duration-300 transform hover:scale-105">
                    Login
                  </button>
                </Link>
                
                <Link href="/register">
                  <button className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative px-6 py-2 bg-black border-2 border-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-all duration-300 transform group-hover:scale-105">
                      Sign Up
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header Section */}
        <header className="flex-shrink-0 py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-2xl">
                <span className="text-red-600 font-black text-4xl">h.</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-red-500 via-orange-400 to-purple-500 bg-clip-text text-transparent leading-tight">
                HackClub
              </h1>
            </div>
            
            {/* Subtitle */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Recruitment Portal
              </h2>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join our community of coders, makers, and creators building the future of technology
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Section */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="container mx-auto max-w-2xl text-center">
            
          {/* Features Section */}
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

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-gray-800 py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row items-center justify-between text-gray-400">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} HackClub Recruitment Portal. All rights reserved.
              </p>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="text-sm">Built with</span>
                <span className="text-red-400">💻</span>
                <span className="text-sm">and</span>
                <span className="text-yellow-400">☕</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes tilt {
          0%, 50%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(0.5deg);
          }
          75% {
            transform: rotate(-0.5deg);
          }
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        
        /* Navbar sliding red animation */
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100vw);
          }
        }
        .animate-slideRight {
          animation: slideRight 3s ease-in-out infinite;
        }
        
        /* Bottom red blob (same as registration page) */
        .bottom-red-blob {
          position: fixed;
          left: 50%;
          bottom: -18vh;
          width: 140vw;
          height: 60vh;
          pointer-events: none;
          z-index: 1;
          opacity: 0.38;
          filter: blur(60px) brightness(1.08);
          background: radial-gradient(
            ellipse 80% 80% at 50% 80%,
            rgba(255,0,60,0.67) 0%,
            rgba(255, 0, 60, 0.82) 20%,
            transparent 100%
          );
          border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          animation: bottomBlobMove 18s ease-in-out infinite alternate;
          transform: translateX(-50%) scale(1) rotate(0deg);
        }
        @keyframes bottomBlobMove {
          0% {
            transform: translateX(-50%) scale(1) rotate(0deg);
            border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          }
          30% {
            transform: translateX(-52%) scale(1.08) rotate(-7deg);
            border-radius: 70% 30% 60% 40% / 60% 40% 60% 40%;
          }
          60% {
            transform: translateX(-48%) scale(1.12) rotate(8deg);
            border-radius: 60% 40% 70% 30% / 50% 60% 50% 60%;
          }
          100% {
            transform: translateX(-50%) scale(1) rotate(0deg);
            border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          }
        }
      `}</style>
    </div>
  )
}