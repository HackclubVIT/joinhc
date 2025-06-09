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

interface RegisterFormData {
  email: string
  password: string
  regno: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Function to fetch user role directly from the database
  const fetchUserRole = async (userId: string, retries = 3) => {
    try {
      console.log("Fetching role for user:", userId)
      const { data, error } = await supabase.rpc("is_recruiter", { user_id: userId })

      if (error) {
        console.error("Error checking if user is recruiter:", error)
        if (retries > 0) {
          setTimeout(() => fetchUserRole(userId, retries - 1), 1000)
        } else {
          setUserRole("applicant") // Default to applicant
        }
        return
      }

      // Set role based on the is_recruiter function result
      setUserRole(data ? "recruiter" : "applicant")
      console.log("User role set to:", data ? "recruiter" : "applicant")
    } catch (err) {
      console.error("Error in fetchUserRole:", err)
      if (retries > 0) {
        setTimeout(() => fetchUserRole(userId, retries - 1), 1000)
      } else {
        setUserRole("applicant") // Default to applicant
      }
    }
  }

  // Function to refresh user role (can be called after role changes)
  const refreshUserRole = async () => {
    if (!user) return
    await fetchUserRole(user.id, 0)
  }

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setIsLoading(false)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)

          // Get user role from database
          await fetchUserRole(session.user.id)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error in getSession:", err)
        setIsLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session)
        setUser(session.user)

        // Get user role from database
        await fetchUserRole(session.user.id)

        // Redirect based on role after successful sign in
        if (event === "SIGNED_IN") {
          // Wait a bit for role to be set
          setTimeout(async () => {
            // Fetch the role again to make sure we have the latest
            await fetchUserRole(session.user.id, 0)

            // Use the role from state
            if (userRole === "recruiter") {
              router.push("/dashboard/recruiter")
            } else {
              router.push("/dashboard")
            }
          }, 1500)
        }
      } else {
        setSession(null)
        setUser(null)
        setUserRole(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

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
          data: {
            full_name: email.split("@")[0], // Use email prefix as display name
            role: "applicant", // Set default role in user metadata
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
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
    router.push("/")
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
