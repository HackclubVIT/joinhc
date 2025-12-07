import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.clone();

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

    if (url.pathname !== "/") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // const { data: { user } } = await supabase.auth.getUser()

    // if (
    //   request.nextUrl.pathname.startsWith("/dashboard") ||
    //   request.nextUrl.pathname.startsWith("/application") ||
    //   request.nextUrl.pathname.startsWith("/profile") ||
    //   request.nextUrl.pathname.startsWith("/admin")
    // ) {
    //   if (!user) {
    //     const redirectUrl = new URL("/login", request.url)
    //     redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    //     return NextResponse.redirect(redirectUrl)
    //   }
      
      
    //   if (request.nextUrl.pathname.startsWith("/admin")) {
    //     try {
    //       const { data: profileData } = await supabase
    //         .from("profiles")
    //         .select("role")
    //         .eq("id", user.id)
    //         .single()
          
    //       if (profileData?.role !== "admin") {
            
    //         const redirectPath = profileData?.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard"
    //         return NextResponse.redirect(new URL(redirectPath, request.url))
    //       }
    //     } catch (error) {
    //       console.error("Error checking admin role:", error)
    //       return NextResponse.redirect(new URL("/dashboard", request.url))
    //     }
    //   }
      
      
    //   if (request.nextUrl.pathname.startsWith("/application")) {
    //     try {
    //       const { data: profileData } = await supabase
    //         .from("profiles")
    //         .select("role")
    //         .eq("id", user.id)
    //         .single()
          
    //       if (profileData?.role !== "applicant") {
            
    //         const redirectPath = profileData?.role === "admin" ? "/admin" : "/dashboard/recruiter"
    //         return NextResponse.redirect(new URL(redirectPath, request.url))
    //       }
    //     } catch (error) {
    //       console.error("Error checking applicant role:", error)
    //       return NextResponse.redirect(new URL("/dashboard", request.url))
    //     }
    //   }
      
      
    //   if (request.nextUrl.pathname.startsWith("/dashboard/recruiter")) {
    //     try {
    //       const { data: profileData } = await supabase
    //         .from("profiles")
    //         .select("role")
    //         .eq("id", user.id)
    //         .single()
          
    //       if (profileData?.role !== "recruiter") {
            
    //         const redirectPath = profileData?.role === "admin" ? "/admin" : "/dashboard"
    //         return NextResponse.redirect(new URL(redirectPath, request.url))
    //       }
    //     } catch (error) {
    //       console.error("Error checking recruiter role:", error)
    //       return NextResponse.redirect(new URL("/dashboard", request.url))
    //     }
    //   }
      
      
    //   if (request.nextUrl.pathname === "/dashboard" && !request.nextUrl.pathname.startsWith("/dashboard/recruiter")) {
    //     try {
    //       const { data: profileData } = await supabase
    //         .from("profiles")
    //         .select("role")
    //         .eq("id", user.id)
    //         .single()
          
    //       if (profileData?.role !== "applicant") {
            
    //         const redirectPath = profileData?.role === "admin" ? "/admin" : "/dashboard/recruiter"
    //         return NextResponse.redirect(new URL(redirectPath, request.url))
    //       }
    //     } catch (error) {
    //       console.error("Error checking applicant dashboard role:", error)
    //     }
    //   }
    // }

    
    // if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") {
    //   if (user) {
    //     try {
    //       const { data: profileData } = await supabase
    //         .from("profiles")
    //         .select("role")
    //         .eq("id", user.id)
    //         .single()
          
    //       const role = profileData?.role;
    //       let redirectPath = "/dashboard"
          
    //       if (role === "admin") {
    //         redirectPath = "/admin"
    //       } else if (role === "recruiter") {
    //         redirectPath = "/dashboard/recruiter"
    //       }
          
    //       return NextResponse.redirect(new URL(redirectPath, request.url))
    //     } catch (error) {
    //       console.error("Error checking role for auth redirect:", error)
    //       return NextResponse.redirect(new URL("/dashboard", request.url))
    //     }
    //   }
    // }

    
    // if (request.nextUrl.pathname === "/dashboard" && user) {
    //   try {
    //     const { data: profileData } = await supabase
    //       .from("profiles")
    //       .select("role")
    //       .eq("id", user.id)
    //       .single()
        
    //     if (profileData?.role === "recruiter") {
    //       return NextResponse.redirect(new URL("/dashboard/recruiter", request.url))
    //     } else if (profileData?.role === "admin") {
    //       return NextResponse.redirect(new URL("/admin", request.url))
    //     }
    //   } catch (error) {
    //     console.error("Error checking role for applicant dashboard:", error)
    //   }
    // }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/application/:path*", "/profile/:path*", "/login", "/register", "/auth/callback","/admin/:path*"],
}