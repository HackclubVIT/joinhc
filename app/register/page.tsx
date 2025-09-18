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
  Sparkles,
  Zap,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [regno, setregno] = useState("");
  const [email, setEmail] = useState("");
  const [full_name, setFull_name] = useState("");
  const [mobile, setMobile] = useState("");
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

    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain) {
      setError("Please enter a valid email address");
      return;
    }

    if (emailDomain !== 'vitstudent.ac.in') {
      setError("Only @vitstudent.ac.in emails are allowed for registration");
      return;
    }

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
      const { data, error } = await signUp(email, password, regno, mobile, full_name);

      if (error) {
        if (error.message.includes("User already registered")) {
          setError(
            "An account with this email already exists. Please try logging in instead.",
          );
        } else if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else if (error.message.includes("Password")) {
          setError("Password must be at least 6 characters long.");
        } else if (error.message.includes("Only @vitstudent.ac.in")) {
          setError("Only @vitstudent.ac.in emails are allowed for registration.");
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
        setMobile("");
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
    <div className="min-h-screen modern-bg flex page-transition">
      {/* Left side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/20"></div>
        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="floating-element">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl opacity-40">
                  <HackClubLogo size="xl" showText={false} />
                </div>
                <HackClubLogo
                  size="xl"
                  showText={false}
                  className="relative z-10"
                />
              </div>
            </div>
            <h1 className="text-5xl font-black text-foreground mb-4">
              HackClub <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your gateway to an exclusive community of innovators and creators
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="flex items-center justify-center space-x-6 py-8">
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-sm text-foreground mt-2 font-medium">
                Login
              </span>
            </div>
            <ChevronRight className="text-primary" size={24} />
            <div className="flex flex-col items-center opacity-50">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-sm">
                2
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                Dashboard
              </span>
            </div>
            <ChevronRight className="text-muted-foreground" size={20} />
            <div className="flex flex-col items-center opacity-50">
              <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-sm">
                3
              </div>
              <span className="text-sm text-muted-foreground mt-2">
                Success
              </span>
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
                      placeholder="Type your Registration Number"
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
                    htmlFor="full_name"
                    className="text-sm font-medium text-gray-200"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      value={full_name}
                      onChange={(e) => setFull_name(e.target.value)}
                      className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-200"
                  >
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+91 XXX XXX XXXX"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
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
                      placeholder="yourname@vitstudent.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20 ${
                        email && email.includes('@') ? 
                          (email.toLowerCase().endsWith('@vitstudent.ac.in') ? 'border-green-500 focus:border-green-500' : 
                           'border-red-500 focus:border-red-500') : ''
                      }`}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {email && email.includes('@') && (
                    <div className="flex items-center space-x-2 text-xs">
                      {email.toLowerCase().endsWith('@vitstudent.ac.in') ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">Valid student email</span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded-full border-2 border-red-400" />
                          <span className="text-red-400">Only @vitstudent.ac.in emails allowed</span>
                        </>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Use your VIT student email address (@vitstudent.ac.in)
                  </p>
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
