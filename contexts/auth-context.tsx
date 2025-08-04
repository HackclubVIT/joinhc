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
  if (typeof window === 'undefined') return { isFirefox: false, isChrome: false, isEdge: false, isBrave: false }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  return {
    isFirefox: /firefox/.test(userAgent),
    isChrome: /chrome/.test(userAgent) && !/edge/.test(userAgent),
    isEdge: /edge/.test(userAgent),
    isBrave: /brave/.test(userAgent) || (navigator as any).brave?.isBrave?.() === true
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
  const [isForceLoggingOut, setIsForceLoggingOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsHydrated(true)
    
    
    setIsForceLoggingOut(false)
    
    
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const browser = detectBrowser()
      if (!browser.isFirefox) {
        
        localStorage.setItem('pageRefreshed', 'true')
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  
  useEffect(() => {
    if (!isHydrated) return

    const browser = detectBrowser()

    if (!browser.isFirefox) {
      
      const isRefresh = localStorage.getItem('pageRefreshed') === 'true'
      
      if (isRefresh) {
        
        const currentPath = window.location.pathname
        const isAuthenticatedPage = currentPath.startsWith('/dashboard') || 
                                   currentPath.startsWith('/admin') || 
                                   currentPath.startsWith('/application') ||
                                   currentPath.startsWith('/profile')
        
        if (isAuthenticatedPage) {
          
          setIsForceLoggingOut(true)
          
          setSession(null)
          setUser(null)
          setUserRole(null)
          setIsLoading(false)
          setIsInitialized(true)
          
          const forceLogout = async () => {
            try {
              await supabase.auth.signOut()
              
              
              toast({
                title: "Logged Out Due to Browser Issue",
                description: "Due to a technical error, Chromium based browsers log out users on refresh. Please use Firefox for a better experience.",
                variant: "destructive",
                duration: 10000, 
              })
              
              setTimeout(() => {
                router.push('/login')
              }, 500)
              
            } catch (error) {
              console.error("Force logout error:", error)
              
              
              toast({
                title: "Logged Out Due to Browser Issue",
                description: "Due to a technical error, Chrome/Edge browsers log out users on refresh. Please use Firefox for a better experience.",
                variant: "destructive",
                duration: 8000, 
              })
              
              setTimeout(() => {
                router.push('/login')
              }, 500)
            }
          }

          forceLogout()
        }
      } else {
        
        localStorage.removeItem('pageRefreshed')
      }
    }
  }, [isHydrated, router])

  
  useEffect(() => {
    if (!isHydrated) return
    
    const currentPath = window.location.pathname
    if (currentPath === '/login' || currentPath === '/register') {
      
      setIsForceLoggingOut(false)
      localStorage.removeItem('pageRefreshed')
    }
  }, [isHydrated, router])

  const fetchUserRole = async (userId: string, retries = 0): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single()

      if (error) {
        if (retries < 3) {
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
          return fetchUserRole(userId, retries + 1)
        }
        setUserRole("applicant")
        return "applicant"
      }

      const role = data?.role || "applicant"
      setUserRole(role)
      return role
    } catch (err) {
      if (retries < 3) {
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
        return fetchUserRole(userId, retries + 1)
      }
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
    
    
    if (isForceLoggingOut) {
      
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    let mounted = true

    const initializeAuth = async () => {
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
          
          await fetchUserRole(session.user.id)
          
          
          setIsForceLoggingOut(false)
          localStorage.removeItem('pageRefreshed')
        } else {
          
        }

        setIsLoading(false)
        setIsInitialized(true)
      } catch (err) {
        console.error("Error in initializeAuth:", err)
        if (mounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        
        
        if (session) {
          setSession(session)
          setUser(session.user)
          if (event === 'SIGNED_IN') {
            
            
            const role = await fetchUserRole(session.user.id)
            const redirectPath = role === "recruiter" ? "/dashboard/recruiter" : 
                                role === "admin" ? "/admin" : "/dashboard"
            
            router.push(redirectPath)
            
            
            localStorage.removeItem('pageRefreshed')
            setIsForceLoggingOut(false)
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
  }, [router, isHydrated, isForceLoggingOut])

  const signIn = async (email: string, password: string) => {
    try {
      
      
      setIsForceLoggingOut(false)
      localStorage.removeItem('pageRefreshed')
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        
      } else {
        
      }
      
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
      
      localStorage.removeItem('pageRefreshed')
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
