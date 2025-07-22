"use client";

import type React from "react";
import { useState } from "react";
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

export default function LoginPage() {
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

          {/* Benefits */}
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">
                Secure Authentication
              </span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">
                Instant Access
              </span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">
                Premium Features
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Modern Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                <HackClubLogo size="md" showText={false} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-foreground">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-red-500/50 bg-red-950/20"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Enhanced Login Card */}
          <div className="neo-card glow-border">
            <div className="p-6 space-y-1 border-b border-border/50">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground">Sign In</h3>
                <p className="text-sm text-muted-foreground">
                  Access your account
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="modern-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="modern-input pl-10 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-primary"
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

                <Dialog
                  open={showResetDialog}
                  onOpenChange={setShowResetDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                    >
                      Forgot your password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="neo-card border-0">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-white">
                        Reset Password
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Enter your email address and we'll send you a magic link
                        to reset your password.
                      </DialogDescription>
                    </DialogHeader>

                    {resetError && (
                      <Alert
                        variant="destructive"
                        className="bg-red-950/50 border-red-900 text-red-200"
                      >
                        <AlertDescription>{resetError}</AlertDescription>
                      </Alert>
                    )}

                    {resetSuccess && (
                      <Alert className="bg-green-950/50 border-green-900 text-green-200">
                        <AlertDescription>{resetSuccess}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-gray-200">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="yourname@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="pl-10 h-12 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500"
                            required
                            disabled={isResetLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        onClick={forgotPassword}
                        disabled={isResetLoading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                      >
                        {isResetLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-6 pt-0">
                <Button
                  type="submit"
                  className="w-full h-12 premium-button text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
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
