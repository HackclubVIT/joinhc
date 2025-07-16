"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type UserRole = "applicant" | "recruiter"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  userRole: UserRole | null
  refreshUserRole: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, regno: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setIsHydrated(true)
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
      } catch (err) {
        console.error("Error in getSession:", err)
        if (mounted) {
          setIsLoading(false)
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
            const redirectPath = role === "recruiter" ? "/dashboard/recruiter" : "/dashboard"
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

  const signUp = async (email: string, password: string, regno: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://join.hackclubvit.xyz/auth/callback`,
          data: {
            full_name: email.split("@")[0],
            role: "applicant",
            register_no: regno
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