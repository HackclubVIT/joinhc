import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  try {
    // Refresh session if it exists
    const {
      data: { user: session },
    } = await supabase.auth.getUser()

    // For authenticated routes
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/application") ||
      request.nextUrl.pathname.startsWith("/profile")
    ) {
      // If no session, redirect to login
      if (!session) {
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check for recruiter-only routes
      if (request.nextUrl.pathname.startsWith("/dashboard/recruiter")) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.id)
            .single()
            if (profileData?.role !== "recruiter") {
              // Redirect non-recruiters to applicant dashboard
              return NextResponse.redirect(new URL("/dashboard", request.url))
            }
          } catch (error) {
            console.error("Error checking role:", error)
            // If we can't determine role, redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        }
      }
      
      // For login/register routes - redirect to dashboard if already logged in
      if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
        if (session) {
          try {
            const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.id)
            .single()
            
            console.log("Profile data:", profileData)
          const role = profileData?.role || "applicant"
          const redirectPath = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard"
          return NextResponse.redirect(new URL(redirectPath, request.url))
        } catch (error) {
          console.error("Error checking role:", error)
          // Default to applicant dashboard if we can't determine role
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    }

    // Prevent recruiters from visiting applicant dashboard
    if (request.nextUrl.pathname === "/dashboard" && session) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.id)
          .single()
        if (profileData?.role === "recruiter") {
          // Redirect recruiters to recruiter dashboard
          return NextResponse.redirect(new URL("/dashboard/recruiter", request.url))
        }
      } catch (error) {
        console.error("Error checking role for applicant dashboard:", error)
        // If we can't determine role, allow access (or optionally redirect)
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/application/:path*", "/profile/:path*", "/login", "/register"],
}
