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
    <div className="relative min-h-screen text-white overflow-hidden cosmic-bg">
      {/* Background Elements */}
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

      {/* Main Content */}
      <div className="container py-10 ml-10 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            {userRole === "recruiter"
              ? "Your recruiter profile and department assignments"
              : "Your personal information and application summary"}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userRole === "recruiter" ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
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
                  <div><Badge variant="outline">Recruiter</Badge></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
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
            <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
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

            <Card className="bg-black/20 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
                <CardDescription>Your application details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {application ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Status</div>
                      <div><Badge variant="outline">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</Badge></div>
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

      {/* Same Global Styles as Dashboard */}
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
