"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  getProfile,
  getApplicationForUser,
  getRecruiterDepartments,
  getDepartments,
} from "@/lib/supabase/data-fetching"

export default function ProfilePage() {
  const { userRole, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getProfile()
        setProfile(profileData)

        if (userRole === "applicant") {
          const applicationData = await getApplicationForUser()

          if (applicationData) {
            // Get department names
            const depts = await getDepartments()
            const firstDept = depts.find((d) => d.id === applicationData.first_pref_dept_id)
            const secondDept = depts.find((d) => d.id === applicationData.second_pref_dept_id)

            setApplication({
              ...applicationData,
              firstPrefDept: firstDept?.name || "Unknown",
              secondPrefDept: secondDept?.name || "Unknown",
            })
          }
        } else if (userRole === "recruiter") {
          const recruiterDepts = await getRecruiterDepartments()
          setDepartments(recruiterDepts.map((rd) => rd.department?.name || "Unknown"))
        }
      } catch (err) {
        console.error("Error fetching profile data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, userRole])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Loading your profile information...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          {userRole === "recruiter"
            ? "Your recruiter profile and department assignments"
            : "Your personal information and application summary"}
        </p>
      </div>

      {userRole === "recruiter" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Name</div>
                <div>{profile?.full_name || "Not set"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Email</div>
                <div>{user?.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Role</div>
                <div>
                  <Badge variant="outline">Recruiter</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Assignments</CardTitle>
              <CardDescription>Departments you are managing</CardDescription>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                <ul className="space-y-2">
                  {departments.map((dept, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md border p-3">
                      <span>{dept}</span>
                      <Badge>Active</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No departments assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Name</div>
                <div>{profile?.full_name || "Not set"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Email</div>
                <div>{user?.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Register Number</div>
                <div>{profile?.register_no || "Not set"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Summary</CardTitle>
              <CardDescription>Your application details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Status</div>
                    <div>
                      <Badge variant="outline">
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">First Preference</div>
                    <div>{application.firstPrefDept}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Second Preference</div>
                    <div>{application.secondPrefDept}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Submitted On</div>
                    <div>{new Date(application.created_at).toLocaleDateString()}</div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No application submitted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
