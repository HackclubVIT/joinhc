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
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // For authenticated routes
    if (
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/application") ||
      request.nextUrl.pathname.startsWith("/profile")
    ) {
      if (!user) {
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      if(request.nextUrl.pathname.startsWith("/application")) {
        try{
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
          
          if (profileData?.role !== "applicant") {
            return NextResponse.redirect(new URL("/dashboard/recruiter", request.url))
          }
        } catch (error) {
          console.error("Error checking role:", error)
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
      // Check for recruiter-only routes
      if (request.nextUrl.pathname.startsWith("/dashboard/recruiter")) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
          
          if (profileData?.role !== "recruiter") {
            return NextResponse.redirect(new URL("/dashboard", request.url))
          }
        } catch (error) {
          console.error("Error checking role:", error)
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    }

    // For login/register routes - redirect to dashboard if already logged in
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
      if (user) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
          
          const role = profileData?.role;
          const redirectPath = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard"
          return NextResponse.redirect(new URL(redirectPath, request.url))
        } catch (error) {
          console.error("Error checking role:", error)
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    }

    if (request.nextUrl.pathname === "/dashboard" && user) {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        
        if (profileData?.role === "recruiter") {
          return NextResponse.redirect(new URL("/dashboard/recruiter", request.url))
        }
      } catch (error) {
        console.error("Error checking role for applicant dashboard:", error)
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/application/:path*", "/profile/:path*", "/login", "/register", "/auth/callback"],
}