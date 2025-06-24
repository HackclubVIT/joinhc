"use client"
import Image from "next/image"
import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { register } from "module"



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
        // Handle specific error cases
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

        // Clear form
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
    <div className="bg-black text-white min-h-screen">
      {/* Registration Section */}
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
            <h1 className="text-2xl font-semibold tracking-tight text-white">Create an account</h1>
            <p className="text-sm text-gray-400">Enter your details below to create your account</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-gray-900 border-gray-700">
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
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
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
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
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
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
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
            <div className="bg-gray-900 p-4 lg:p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-white">Innovative Community</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded students passionate about technology and innovation.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-900 p-4 lg:p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-3 text-white">Launch Your Ideas</h3>
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