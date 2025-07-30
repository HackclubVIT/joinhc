"use client";

import type React from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { magicLinkLogin } from "@/lib/supabase/data-fetching";
import { HackClubLogo } from "@/components/hackclub-logo";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    const { error } = await magicLinkLogin(resetEmail);

    if (error) {
      setResetError((error as any).message || "Failed to send magic link");
    } else {
      setResetSuccess(
        "Magic link sent! Check your inbox and click the link to access your settings. The link will expire in 1 hour.",
      );
      setResetEmail("");
      setTimeout(() => {
        setShowResetDialog(false);
        setResetSuccess(null);
      }, 7000);
    }

    setIsResetLoading(false);
  };

  return (
    <div className="min-h-screen modern-bg flex page-transition">
      {/* Left side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-6 sm:p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/20"></div>
        <div className="relative z-10 max-w-md text-center space-y-6 sm:space-y-8">
          <div className="floating-element">
            <div className="flex justify-center mb-4 sm:mb-6">
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
            <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3 sm:mb-4">
              HackClub <span className="gradient-text">Portal</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Your gateway to an exclusive community of innovators and creators
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 py-6 sm:py-8">
            <div className="flex flex-col items-center group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-xs sm:text-sm text-foreground mt-2 font-medium">
                Login
              </span>
            </div>
            <ChevronRight className="text-primary" size={20} />
            <div className="flex flex-col items-center opacity-50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-sm">
                2
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground mt-2">
                Dashboard
              </span>
            </div>
            <ChevronRight className="text-muted-foreground" size={16} />
            <div className="flex flex-col items-center opacity-50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-bold text-sm">
                3
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground mt-2">
                Success
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 sm:mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex justify-center mb-4">
              <HackClubLogo size="md" showText={false} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="alert-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Card */}
          <div className="hackclub-card">
            <div className="p-4 sm:p-6 space-y-1 border-b border-border">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  Sign In
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                      className="pl-10 h-10 sm:h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 h-10 sm:h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="text-xs sm:text-sm text-primary hover:text-primary/80 p-0 h-auto"
                      >
                        Forgot your password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                          Reset Password
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base">
                          Enter your email address and we'll send you a magic link to
                          reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={forgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="yourname@vitstudent.ac.in"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            disabled={isResetLoading}
                          />
                        </div>
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
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={isResetLoading}
                            className="w-full text-sm sm:text-base"
                          >
                            {isResetLoading ? "Sending..." : "Send Magic Link"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="p-4 sm:p-6 pt-0">
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 hackclub-button text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen modern-bg flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <HackClubLogo size="lg" showText={false} />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
