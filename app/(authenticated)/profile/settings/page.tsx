"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  Lock,
  Shield,
  User,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { changePassword } from "@/lib/supabase/data-fetching";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function SettingsPage() {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const changePasswordPromise = changePassword(newPassword);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Password change timeout")), 30000),
      );

      const result = (await Promise.race([
        changePasswordPromise,
        timeoutPromise,
      ])) as any;

      if (result.error) {
        console.error("Password change failed:", result.error);
        setError(result.error.message || "Failed to change password");
      } else {
        setSuccess(
          "Password changed successfully! You can now use your new password to log in.",
        );
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswords(false);

        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err: any) {
      console.error("Unexpected error in handlePasswordChange:", err);
      if (err.message === "Password change timeout") {
        setError("Password change timed out. Please try again.");
      } else {
        setError("An unexpected error occurred while changing password");
      }
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

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
            <HackClubLogo size="sm" showText={false} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your security settings and account preferences
        </p>
      </div>

      <Separator />

      {error && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:bg-red-950/20"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Change Password Card */}
      <Card className="hackclub-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-12 h-12"
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10"
                  onClick={() => setShowPasswords(!showPasswords)}
                  disabled={isLoading}
                >
                  {showPasswords ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password strength
                    </span>
                    <span
                      className={`font-medium ${passwordStrength.strength >= 66 ? "text-green-600" : passwordStrength.strength >= 33 ? "text-yellow-600" : "text-red-600"}`}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12"
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              {confirmPassword && (
                <div className="flex items-center space-x-2">
                  {newPassword === confirmPassword ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  )}
                  <span
                    className={`text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-600"}`}
                  >
                    {newPassword === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Changing Password...</span>
                </div>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="hackclub-card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Account Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your account details and information
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <p className="font-semibold">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Account Created
                </Label>
                <p className="font-semibold">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Account Status
                </Label>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Active & Verified
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Tips Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800 hackclub-card">
        <CardHeader>
          <CardTitle className="text-xl text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Use a strong password with at least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Don't share your password with anyone
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Log out from shared computers
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Contact support if you notice any suspicious activity
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
