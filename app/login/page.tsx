"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Login Section */}
      <div className="container flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <header className="flex justify-center items-center mb-8">
          <Image 
            src="/Hackclubheader.png" 
            alt="Header" 
            width={600}
            height={200}
            className="max-w-full h-auto"
          />
        </header>

        {/* Login Form */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] max-w-md">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
            <p className="text-sm text-gray-400">Enter your email and password to access your account</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-gray-900 border-gray-700">
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
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
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
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-white text-black hover:bg-gray-200" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
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
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Main Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
            Why Join Hackclub?
          </h2>
          
          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
            {/* Card 1 */}
            <div className="bg-gray-900 p-4 lg:p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-white">Learn by Building</h3>
              <p className="text-gray-400 leading-relaxed">
                Create real projects with mentorship from industry professionals and fellow hackers.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gray-900 p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h2 className="text-xl font-bold mb-4 text-white">Innovative Community</h2>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded students passionate about technology and innovation.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-900 p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h2 className="text-xl font-bold mb-4 text-white">Launch Your Ideas</h2>
              <p className="text-gray-400 leading-relaxed">
                Get support to transform your ideas into reality through hackathons and workshops.
              </p>
            </div>
          </div>
          
          {/* Footer */}
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