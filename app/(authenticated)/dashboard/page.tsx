"use client"

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
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Applicant Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your application status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Current status of your application</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
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
                <span className="text-sm text-muted-foreground">
                  Submitted: {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <p className="text-amber-500">Not submitted yet</p>
            )}
          </CardContent>
          <CardFooter>
            {!applicationSubmitted && (
              <Link href="/application" className="w-full">
                <Button className="w-full" disabled={deadlinePassed}>
                  {deadlinePassed ? "Deadline Passed" : "Apply Now"}
                </Button>
              </Link>
            )}
            {applicationSubmitted && !deadlinePassed && (
              <Link href="/application" className="w-full">
                <Button variant="outline" className="w-full">
                  Edit Application
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Preferences</CardTitle>
            <CardDescription>Your selected departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <>
                <div className="h-6 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-6 w-full animate-pulse rounded bg-muted"></div>
              </>
            ) : applicationSubmitted ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">First Preference</span>
                  <span className="text-sm font-medium">{application.dept_first_pref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Second Preference</span>
                  <span className="text-sm font-medium">{application.dept_second_pref}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No preferences selected yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
            <CardDescription>Key dates for the application process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Application Deadline</span>
              <span className="text-sm font-medium">{deadline ? deadline.toLocaleDateString() : "Loading..."}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Results Announcement</span>
              <span className="text-sm font-medium">TBA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Orientation</span>
              <span className="text-sm font-medium">TBA</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
