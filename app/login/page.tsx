"use client"

import type React from "react"

import { useState } from  "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { magicLinkLogin } from "@/lib/supabase/data-fetching"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetLoading(true)
    setResetError(null)
    setResetSuccess(null)

    const { error } = await magicLinkLogin(resetEmail)

    if (error) {
      setResetError((error as any).message || "Failed to send magic link")
    } else {
      setResetSuccess("Magic link sent! Check your inbox and click the link to access your settings. The link will expire in 1 hour.")
      setResetEmail("")
      setTimeout(() => {
        setShowResetDialog(false)
        setResetSuccess(null)
      }, 7000)
    }

    setIsResetLoading(false)
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden bottom-bg">
      {/* Animated morphing red blob at the bottom edge */}
      <div className="bottom-red-blob"></div>

      {/* Stars */}
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

      {/* Login Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-2xl bg-gradient-to-r from-red-700 to-orange-600">
                <span className="text-white font-black text-3xl">h.</span>
              </div>
            <h1 className="text-5xl font-black text-white">
              HackClub Recruitment
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Join our community of coders, makers, and creators building the tech future
          </p>
        </div>

        {/* Login Form */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] max-w-md">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-200">Enter your email and password to access your account</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 backdrop-blur-sm">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                {/* Password Reset Dialog (from joinhcMain) */}
                <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-sm text-gray-400">
                      Forgot your password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>

                    {resetError && (
                      <Alert variant="destructive">
                        <AlertDescription>{resetError}</AlertDescription>
                      </Alert>
                    )}

                    {resetSuccess && (
                      <Alert>
                        <AlertDescription>{resetSuccess}</AlertDescription>
                      </Alert>
                    )}
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="name@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            disabled={isResetLoading}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={forgotPassword} disabled={isResetLoading}>
                          {isResetLoading ? "Sending..." : "Send Reset Email"}
                        </Button>
                      </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline text-white hover:text-gray-300">
              Register
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
    </div>
  )
}
