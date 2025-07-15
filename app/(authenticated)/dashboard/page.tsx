"use client"
import type { CSSProperties } from 'react'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getApplicationForUser, getApplicationSettings } from "@/lib/supabase/data-fetching"
import { createClient } from "@/lib/supabase/client"

export default function ApplicantDashboard() {
  const [application, setApplication] = useState<any>(null)
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          console.log("No active session found")
          setIsLoading(false)
          return
        }

        // Then fetch application data
        const applicationData = await getApplicationForUser()
        setApplication(applicationData)

        // And settings data
        const settingsData = await getApplicationSettings()
        if (settingsData?.deadline) {
          setDeadline(new Date(settingsData.deadline))
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const today = new Date()
  const deadlinePassed = deadline ? today > deadline : false
  const applicationSubmitted = !!application

  return (
    <div className="relative min-h-screen text-white overflow-hidden cosmic-bg">
      {/* Animated morphing red blob at the bottom edge */}
      <div className="bottom-red-blob"></div>

      {/* Stars moving in circles */}
      {Array.from({ length: 60 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 10;
        const radius = Math.random() * 150 + 50;
        
        return (
         <div
  key={i}
  className="star"
 style={{
  top: `${Math.random() * 100}vh`,
  left: `${Math.random() * 100}vw`,
  width: `${size}px`,
  height: `${size}px`,
  animationDelay: `${delay}s`,
  animationDuration: `${duration}s`,
  ['--radius' as any]: `${radius}px`, // TS bypass
} as CSSProperties}

/>
        )
      })}

      {/* Dashboard Content */}
      <div className="container py-10 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Applicant Dashboard</h1>
          <p className="text-gray-300">Welcome back! Here's your application status.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Application Status</CardTitle>
              <CardDescription className="text-gray-300">Current status of your application</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-gray-700/50"></div>
              ) : applicationSubmitted ? (
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      application.status === "pending"
                        ? "outline"
                        : application.status === "shortlisted"
                          ? "default"
                          : application.status === "waitlisted"
                            ? "secondary"
                            : "destructive"
                    }
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    Submitted: {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <p className="text-amber-400">Not submitted yet</p>
              )}
            </CardContent>
            <CardFooter>
              {!applicationSubmitted && (
                <Link href="/application" className="w-full">
                  <Button className="w-full bg-white text-black hover:bg-gray-200" disabled={deadlinePassed}>
                    {deadlinePassed ? "Deadline Passed" : "Apply Now"}
                  </Button>
                </Link>
              )}
              {applicationSubmitted && !deadlinePassed && (
                <Link href="/application" className="w-full">
                  <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                    Edit Application
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Department Preferences</CardTitle>
              <CardDescription className="text-gray-300">Your selected departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <>
                  <div className="h-6 w-full animate-pulse rounded bg-gray-700/50"></div>
                  <div className="h-6 w-full animate-pulse rounded bg-gray-700/50"></div>
                </>
              ) : applicationSubmitted ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">First Preference</span>
                    <span className="text-sm font-medium text-white">{application.dept_first_pref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Second Preference</span>
                    <span className="text-sm font-medium text-white">{application.dept_second_pref}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No preferences selected yet</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Important Dates</CardTitle>
              <CardDescription className="text-gray-300">Key dates for the application process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Application Deadline</span>
                <span className="text-sm font-medium text-white">{deadline ? deadline.toLocaleDateString() : "Loading..."}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Results Announcement</span>
                <span className="text-sm font-medium text-white">TBA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Orientation</span>
                <span className="text-sm font-medium text-white">TBA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Styles for cosmic theme */}
      <style jsx global>{`
        .cosmic-bg {
          background: #000;
        }
        .bottom-red-blob {
          position: fixed;
          left: 50%;
          bottom: -18vh;
          width: 140vw;
          height: 60vh;
          pointer-events: none;
          z-index: 1;
          opacity: 0.38;
          filter: blur(60px) brightness(1.08);
          background: radial-gradient(
            ellipse 80% 80% at 50% 80%,
            rgba(255,0,60,0.67) 0%,
            rgba(255, 0, 60, 0.82) 20%,
            transparent 100%
          );
          border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          animation: bottomBlobMove 18s ease-in-out infinite alternate;
          transform: translateX(-50%) scale(1) rotate(0deg);
        }
        @keyframes bottomBlobMove {
          0% {
            transform: translateX(-50%) scale(1) rotate(0deg);
            border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          }
          30% {
            transform: translateX(-52%) scale(1.08) rotate(-7deg);
            border-radius: 70% 30% 60% 40% / 60% 40% 60% 40%;
          }
          60% {
            transform: translateX(-48%) scale(1.12) rotate(8deg);
            border-radius: 60% 40% 70% 30% / 50% 60% 50% 60%;
          }
          100% {
            transform: translateX(-50%) scale(1) rotate(0deg);
            border-radius: 60% 40% 60% 40% / 60% 60% 40% 40%;
          }
        }
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: moveStarsCircular infinite linear;
          opacity: 0.8;
          z-index: 2;
        }
        @keyframes moveStarsCircular {
          0% {
            transform: rotate(0deg) translateX(var(--radius)) rotate(0deg);
            opacity: 0.3;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  )
}