"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Globe } from "lucide-react"

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

export function FirefoxSuggestion() {
  const { toast } = useToast()
  
  useEffect(() => {
    
    const hasShownToast = sessionStorage.getItem('firefox-suggestion-shown')
    
    if (hasShownToast) return

    const browser = detectBrowser()
    
    if (!browser.isFirefox) {
      
      const timer = setTimeout(() => {
        toast({
          title: "Better Experience with Firefox",
          description: "For the best experience, we recommend using Firefox browser",
          duration: 8000, 
        })
        
        
        sessionStorage.setItem('firefox-suggestion-shown', 'true')
      }, 500) 

      return () => clearTimeout(timer)
    }
  }, [toast])

  return null
} 