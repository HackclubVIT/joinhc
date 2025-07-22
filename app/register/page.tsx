"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Hash,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [regno, setregno] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, regno);

      if (error) {
        if (error.message.includes("User already registered")) {
          setError(
            "An account with this email already exists. Please try logging in instead.",
          );
        } else if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else if (error.message.includes("Password")) {
          setError("Password must be at least 6 characters long.");
        } else {
          setError(
            error.message || "Failed to create account. Please try again.",
          );
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setSuccess("Account created successfully! You can now log in.");
        } else {
          setSuccess(
            "Account created! Please check your email to verify your account before logging in.",
          );
        }

        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setregno("");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6)
      return { strength: 0, text: "Too short", color: "bg-red-500" };
    if (password.length < 8)
      return { strength: 33, text: "Weak", color: "bg-yellow-500" };
    if (password.length < 12)
      return { strength: 66, text: "Good", color: "bg-blue-500" };
    return { strength: 100, text: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen hackclub-bg flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 xl:p-12 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-r border-border/50">
        <div className="max-w-md text-center space-y-8">
          <div>
            <div className="flex justify-center mb-6">
              <HackClubLogo size="xl" showText={false} />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              HackClub <span className="text-primary">Recruitment</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Join our community of coders, makers, and creators building the
              tech future
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8 py-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <span className="text-sm text-white mt-2">Account</span>
            </div>
            <ChevronRight className="text-gray-500" size={20} />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold text-sm">
                2
              </div>
              <span className="text-sm text-gray-400 mt-2">Application</span>
            </div>
            <ChevronRight className="text-gray-500" size={20} />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-semibold text-sm">
                3
              </div>
              <span className="text-sm text-gray-400 mt-2">Submission</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-primary" size={20} />
              <span className="text-gray-300">Learn by Building</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-primary" size={20} />
              <span className="text-gray-300">Innovative Community</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-primary" size={20} />
              <span className="text-gray-300">Launch Your Ideas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex justify-center mb-4">
              <HackClubLogo size="md" showText={false} />
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Create Account
            </h2>
            <p className="text-muted-foreground">
              Join our community of developers
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="alert-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="alert-success">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Registration Card */}
          <div className="hackclub-card">
            <div className="p-6 space-y-1 border-b border-border">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground">
                  Create Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Join our community of developers
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="regno"
                    className="text-sm font-medium text-gray-200"
                  >
                    Register Number
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="regno"
                      type="text"
                      placeholder="23Bxx1xxx/24xx1xxx"
                      value={regno}
                      onChange={(e) => setregno(e.target.value)}
                      className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      minLength={9}
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-200"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-200"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Password strength</span>
                        <span
                          className={`font-medium ${passwordStrength.strength >= 66 ? "text-green-400" : passwordStrength.strength >= 33 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-gray-200"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center space-x-2">
                      {password === confirmPassword ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-red-400" />
                      )}
                      <span
                        className={`text-xs ${password === confirmPassword ? "text-green-400" : "text-red-400"}`}
                      >
                        {password === confirmPassword
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <Button
                  type="submit"
                  className="w-full h-12 hackclub-button text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Or continue with Google */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 border-gray-600 bg-gray-800/50 text-white hover:bg-gray-700/50 font-medium"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          {/* Terms and Sign in link */}
          <div className="space-y-4 text-center">
            <div className="text-xs text-gray-400">
              <p>
                By creating an account, you agree to our{" "}
                <Link
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
