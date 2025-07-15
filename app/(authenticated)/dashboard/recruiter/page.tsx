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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const recruiterDepts = await getRecruiterDepartments()

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

  return (
    <div className="relative min-h-screen text-white overflow-hidden cosmic-bg">
      {/* Red blob and stars */}
      <div className="bottom-red-blob"></div>
      {Array.from({ length: 60 }).map((_, i) => {
        const size = Math.random() * 2 + 1
        const duration = Math.random() * 20 + 15
        const delay = Math.random() * 10
        const radius = Math.random() * 150 + 50

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
              ['--radius' as any]: `${radius}px`,
            } as React.CSSProperties}
          />
        )
      })}

      <div className="container py-10 relative z-10 ml-10">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Manage applications for your assigned departments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-[200px] bg-black/20 border-gray-700/50 backdrop-blur-sm">
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
        ) : departments.length === 0 ? (
          <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
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
                <Card className="h-full bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all hover:shadow-md">
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
                        <span className="font-medium text-amber-500">{dept.pendingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Shortlisted</span>
                        <span className="font-medium text-green-400">{dept.shortlistedCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Cosmic Theme Global Style */}
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
