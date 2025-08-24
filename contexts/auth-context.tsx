"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type UserRole = "applicant" | "recruiter" | "admin"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  userRole: UserRole | null
  isInitialized: boolean
  refreshUserRole: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, regno: string, mobile: string, full_name: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const detectBrowser = () => {
  if (typeof window === 'undefined') return { isFirefox: false }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  return {
    isFirefox: /firefox/.test(userAgent)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsHydrated(true)
    
    // Show Firefox recommendation toast for non-Firefox browsers
    const browser = detectBrowser()
    if (!browser.isFirefox) {
      toast({
        title: "Recommendation",
        description: "For the best experience and to avoid session interruptions, we recommend using Firefox browser.",
        variant: "default",
        duration: 6000,
      })
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      const navigationType = navigationEntries[0]?.type
      
      if (navigationType === 'reload') {
        const currentPath = window.location.pathname
        const isAuthenticatedPage = currentPath.startsWith('/dashboard') || 
                                   currentPath.startsWith('/admin') || 
                                   currentPath.startsWith('/application') ||
                                   currentPath.startsWith('/profile')
        if (isAuthenticatedPage) {
          setTimeout(() => {
            const performImmediateLogout = () => {
              try {
                const cookiesToClear = [
                  'sb-access-token',
                  'sb-refresh-token', 
                  'supabase-auth-token',
                  'supabase.auth.token',
                  'sb-hhvnwxkgjgbwypwnvnrl-auth-token',
                  'sb-hhvnwxkgjgbwypwnvnrl-auth-token.0',
                  'sb-hhvnwxkgjgbwypwnvnrl-auth-token.1'
                ]
                
                cookiesToClear.forEach(cookieName => {
                  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
                  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
                })

                localStorage.clear()
                sessionStorage.clear()

                setUser(null)
                setSession(null)
                setUserRole(null)
                setIsLoading(false)
                setIsInitialized(true)

                supabase.auth.signOut().catch(() => {
                  // Ignore errors since we're forcing logout anyway
                })

                toast({
                  title: "Logged Out Due to Browser Error",
                  description: "You have been logged out due to browser errors. Please use Firefox for a better experience.",
                  variant: "destructive",
                  duration: 8000,
                })

                setTimeout(() => {
                  router.push('/login')
                }, 3000)

              } catch (error) {
                console.error("Logout error:", error)
                toast({
                  title: "Session Expired", 
                  description: "You have been logged out due to browser errors. Use Mozilla Firefox for better experience.",
                  variant: "destructive",
                  duration: 5000,
                })
                setTimeout(() => {
                  router.push('/login')
                }, 2000)
              }
            }
            performImmediateLogout()
          }, 500)
        }
      }
    }
  }, [])

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching user role:", error)
        setUserRole("applicant")
        return "applicant"
      }

      const role = data?.role || "applicant"
      setUserRole(role)
      return role
    } catch (err) {
      console.error("Error in fetchUserRole:", err)
      setUserRole("applicant")
      return "applicant"
    }
  }

  const refreshUserRole = async () => {
    if (!user) return
    await fetchUserRole(user.id)
  }

  useEffect(() => {
    if (!isHydrated) return

    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)
          if (!userRole) {
            await fetchUserRole(session.user.id)
          }
        }

        setIsLoading(false)
        setIsInitialized(true)
      } catch (err) {
        console.error("Error in getSession:", err)
        if (mounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session) {
          setSession(session)
          setUser(session.user)
          if (event === 'SIGNED_IN' && !userRole) {
            const role = await fetchUserRole(session.user.id)
            const redirectPath = role === "recruiter" ? "/dashboard/recruiter" : 
                                role === "admin" ? "/admin" : "/dashboard"
            router.push(redirectPath)
          }
        } else {
          setSession(null)
          setUser(null)
          setUserRole(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, isHydrated, userRole])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (err) {
      console.error("Error in signIn:", err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, regno: string, phone: string, full_name: string) => {
    try {
      const emailDomain = email.split('@')[1]?.toLowerCase();
      if (!emailDomain || emailDomain !== 'vitstudent.ac.in') {
        return { 
          data: null, 
          error: { message: "Only @vitstudent.ac.in emails are allowed for registration" } 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
            role: "applicant",
            register_no: regno,
            mobile: phone
          },
        },
      })
      return { data, error }
    } catch (err) {
      console.error("Error in signUp:", err)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)
      setUserRole(null)
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Error in signOut:", err)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    userRole,
    isInitialized,
    refreshUserRole,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
