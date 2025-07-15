"use client"
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [regno, setregno] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await signUp(email, password, regno)

      if (error) {
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Please try logging in instead.")
        } else if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address.")
        } else if (error.message.includes("Password")) {
          setError("Password must be at least 6 characters long.")
        } else {
          setError(error.message || "Failed to create account. Please try again.")
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setSuccess("Account created successfully! You can now log in.")
        } else {
          setSuccess("Account created! Please check your email to verify your account before logging in.")
        }

        setEmail("")
        setPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden bottom-bg">
      {/* Animated morphing red blob at the bottom edge */}
      <div className="bottom-red-blob"></div>

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Registration Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-9 bg-white rounded-md flex items-center justify-center shadow-lg border border-gray-100">
              <span className="text-red-500 font-bold text-3xl">h.</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-purple-500 bg-clip-text text-transparent">
              HackClub Recruitment
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Join our community of coders, makers, and creators building the tech future
          </p>
        </div>

        {/* Progress Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 md:space-x-10">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <span className="ml-2 text-white font-medium text-sm md:text-base">Account</span>
            </div>
            <div className="w-8 md:w-16 h-px bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="ml-2 text-gray-400 font-medium text-sm md:text-base">Application</span>
            </div>
            <div className="w-8 md:w-16 h-px bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="ml-2 text-gray-400 font-medium text-sm md:text-base">Submission</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] max-w-md">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold ">Create an account</h1>
            <p className="text-sm text-gray-200">Enter your details below to create your account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 backdrop-blur-sm">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900/20 border-green-500/50 backdrop-blur-sm">
              <AlertDescription className="text-green-200">{success}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="regno" className="text-white">Register No.</Label>
                    <Input
                      id="regno"
                      type="text"
                      placeholder="23Bxx1xxx/24xx1xxx"
                      value={regno}
                      onChange={(e) => setregno(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={9}
                      maxLength={9}
                      className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="underline text-white hover:text-gray-300">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Why Join Hackclub Section */}
      <div className="border-t border-gray-800 py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 text-white">
            Why Join Hackclub?
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">Learn by Building</h2>
              <p className="text-gray-400 leading-relaxed">
                Create real projects with mentorship from industry professionals and fellow hackers.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">Innovative Community</h2>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded students passionate about technology and innovation.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">Launch Your Ideas</h2>
              <p className="text-gray-400 leading-relaxed">
                Get support to transform your ideas into reality through hackathons and workshops.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-center text-xs">
              © 2025 Hack Club. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Styles for background, moving red blob at bottom edge, and stars */}
      <style jsx global>{`
        .bottom-bg {
          background: #000;
        }
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
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 100%;
          animation: moveStars 10s linear infinite;
          opacity: 0.8;
          z-index: 2;
        }
        @keyframes moveStars {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}