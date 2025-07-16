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

  return (
    <div className="container py-10 mx-auto max-w-4xl relative z-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-300">
          {userRole === "recruiter"
            ? "Your recruiter profile and department assignments"
            : "Your personal information and application summary"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, idx) => (
            <Card key={idx} className="bg-black/20 border-gray-700/50 backdrop-blur-sm animate-pulse">
              <CardHeader>
                <div className="h-6 w-24 rounded bg-gray-700/50"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-4 w-full rounded bg-gray-700/50"></div>
                <div className="h-4 w-full rounded bg-gray-700/50"></div>
                <div className="h-4 w-full rounded bg-gray-700/50"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : userRole === "recruiter" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-300">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Name</div>
                <div className="text-white">{profile?.full_name || "Not set"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Email</div>
                <div className="text-white">{user?.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Role</div>
                <div><Badge variant="outline">Recruiter</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Department Assignments</CardTitle>
              <CardDescription className="text-gray-300">Departments you are managing</CardDescription>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                <ul className="space-y-2">
                  {departments.map((dept, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md border border-gray-700 p-3 bg-black/30">
                      <span className="text-white">{dept}</span>
                      <Badge>Active</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No departments assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-300">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Name</div>
                <div className="text-white">{profile?.full_name || "Not set"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Email</div>
                <div className="text-white">{user?.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium text-gray-300">Register Number</div>
                <div className="text-white">{profile?.register_no || "Not set"}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Application Summary</CardTitle>
              <CardDescription className="text-gray-300">Your application details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-300">Status</div>
                    <div><Badge variant="outline">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</Badge></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-300">First Preference</div>
                    <div className="text-white">{application.firstPrefDept}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-300">Second Preference</div>
                    <div className="text-white">{application.secondPrefDept}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium text-gray-300">Submitted On</div>
                    <div className="text-white">{new Date(application.created_at).toLocaleDateString()}</div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">No application submitted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
