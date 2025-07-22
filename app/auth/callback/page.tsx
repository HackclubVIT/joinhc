"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HackClubLogo } from "@/components/hackclub-logo";

function AuthCallbackContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const error_code = searchParams.get("error");
        const error_description = searchParams.get("error_description");

        if (error_code) {
          console.error("Auth error:", error_code, error_description);
          setError(error_description || "Authentication failed");
          setTimeout(() => router.push("/login?error=auth_failed"), 2000);
          return;
        }

        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error("Token verification error:", error);
            setError("Failed to verify authentication token");
            setTimeout(
              () => router.push("/login?error=verification_failed"),
              2000,
            );
            return;
          }

          if (data.session) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.session.user.id)
              .single();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
              router.push("/dashboard");
              return;
            }

            const role = profileData?.role || "applicant";
            const redirectPath = "/profile/settings";
            router.push(redirectPath);
          } else {
            setError("No session created after verification");
            setTimeout(() => router.push("/login?error=no_session"), 2000);
          }
        } else if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Code exchange error:", error);
            setError("Failed to complete authentication");
            setTimeout(() => router.push("/login?error=session_failed"), 2000);
            return;
          }

          if (data.session) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.session.user.id)
              .single();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
              router.push("/dashboard");
              return;
            }

            const role = profileData?.role || "applicant";
            const redirectPath =
              role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
            router.push(redirectPath);
          } else {
            setError("No session created");
            setTimeout(() => router.push("/login?error=no_session"), 2000);
          }
        } else {
          const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session check error:", sessionError);
            router.push("/login?error=session_check_failed");
            return;
          }

          if (sessionData.session) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", sessionData.session.user.id)
              .single();

            if (profileError) {
              console.error("Profile fetch error:", profileError);
              router.push("/dashboard");
              return;
            }

            const role = profileData?.role || "applicant";
            const redirectPath =
              role === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
            router.push(redirectPath);
          } else {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setError("An unexpected error occurred");
        setTimeout(() => router.push("/login?error=callback_error"), 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center hackclub-bg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <HackClubLogo size="lg" showText={false} />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Processing authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center hackclub-bg">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <HackClubLogo size="lg" showText={false} />
          </div>
          <div className="mb-4 text-red-500">
            <p className="text-lg font-semibold">Authentication Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center hackclub-bg">
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
