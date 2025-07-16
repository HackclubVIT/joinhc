"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getRecruiterDepartments, getDepartmentApplicants } from "@/lib/supabase/data-fetching"
import { Users } from "lucide-react"

type DepartmentStats = {
  name: string
  slug: string
  totalApplicants: number
  firstPrefCount: number
  secondPrefCount: number
  pendingCount: number
  shortlistedCount: number
}

export default function RecruiterDashboard() {
  const { user, userRole } = useAuth()
  const [departments, setDepartments] = useState<DepartmentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const recruiterDepts = await getRecruiterDepartments()

        // Get stats for each department
        const deptStats = await Promise.all(
          recruiterDepts.map(async (dept) => {
            const applicants = await getDepartmentApplicants(dept.department_id)

            const firstPrefCount = applicants.filter((app) => app.first_pref_dept_id === dept.department_id).length
            const secondPrefCount = applicants.filter((app) => app.second_pref_dept_id === dept.department_id).length
            const pendingCount = applicants.filter((app) => app.status === "pending").length
            const shortlistedCount = applicants.filter((app) => app.status === "shortlisted").length

            return {
              name: dept.department?.name || "Unknown Department",
              slug: dept.department_id,
              totalApplicants: applicants.length,
              firstPrefCount,
              secondPrefCount,
              pendingCount,
              shortlistedCount,
            }
          }),
        )

        setDepartments(deptStats)
      } catch (err) {
        console.error("Error fetching recruiter departments:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Loading your assigned departments...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-[200px]">
              <CardHeader>
                <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage applications for your assigned departments</p>
        </div>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Departments Assigned</CardTitle>
            <CardDescription>You don't have any departments assigned yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact an administrator to assign you to departments. Once assigned, you will be able to view and manage applications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Link key={dept.slug} href={`/dashboard/recruiter/${dept.slug}`}>
              <Card className="h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>Department overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Applicants</span>
                      <span className="font-medium">{dept.totalApplicants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">First Preference</span>
                      <span className="font-medium">{dept.firstPrefCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Second Preference</span>
                      <span className="font-medium">{dept.secondPrefCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Review</span>
                      <span className="font-medium text-amber-600">{dept.pendingCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Shortlisted</span>
                      <span className="font-medium text-green-600">{dept.shortlistedCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
