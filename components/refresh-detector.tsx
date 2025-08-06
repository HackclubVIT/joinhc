"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

const detectBrowser = () => {
  if (typeof window === 'undefined') return { isFirefox: false }
  
  const userAgent = navigator.userAgent.toLowerCase()
  return {
    isFirefox: /firefox/.test(userAgent)
  }
}

export function RefreshDetector() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isInitialized } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    
    if (!isInitialized) return
    
    
    if (typeof window === 'undefined') return

    const browser = detectBrowser()
    
    
    if (!browser.isFirefox) {
      
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      const navigationType = navigationEntries[0]?.type
      
      
      if (navigationType === 'reload') {
        const currentPath = window.location.pathname
        const isAuthenticatedPage = currentPath.startsWith('/dashboard') || 
                                   currentPath.startsWith('/admin') || 
                                   currentPath.startsWith('/application') ||
                                   currentPath.startsWith('/profile')
        
        
        if (isAuthenticatedPage && user) {
          const performLogout = async () => {
            try {
              await supabase.auth.signOut()
              
              toast({
                title: "Logged Out Due to Browser Issue",
                description: "Due to a technical error, Chromium based browsers log out users on refresh. Please use Firefox for a better experience.",
                variant: "destructive",
                duration: 8000,
              })
              
              setTimeout(() => {
                router.push('/login')
              }, 1000)
              
            } catch (error) {
              console.error("Logout error:", error)
              router.push('/login')
            }
          }

          performLogout()
        }
      }
    }
  }, [isInitialized, user]) 

  
  return null
}
