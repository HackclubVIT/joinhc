"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Menu, X, User, LogOut, Home, FileText } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getDepartments,
  getApplicationForUser,
  saveApplication,
  getApplicationSettings,
  type Application,
  type Department,
} from "@/lib/supabase/data-fetching"

export default function ApplicationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [DEPARTMENTS, setDepartments] = useState<Department[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [existingApplication, setExistingApplication] = useState<Application | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    register_no: "",
    dept_first_pref: "",
    reason_first_pref: "",
    dept_second_pref: "",
    reason_second_pref: "",
    reason_priority: "",
    links: "",
  })

  const deadlinePassed = deadline ? new Date() > deadline : false

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const departments = await getDepartments()
        setDepartments(departments)

        // Fetch application settings for deadline
        const settings = await getApplicationSettings()
        if (settings?.deadline) {
          setDeadline(new Date(settings.deadline))
        }

        // Fetch existing application
        const application = await getApplicationForUser()
        setExistingApplication(application)

        const userName = user?.user_metadata?.full_name
        const userRegisterNo = user?.user_metadata?.register_no

        if (application) {
          setFormData({
            name: application.name || userName,
            email: application.email || user?.email || "",
            register_no: application.register_no || userRegisterNo || "",
            dept_first_pref: application.first_pref_dept_id || "",
            reason_first_pref: application.first_pref_reason || "",
            dept_second_pref: application.second_pref_dept_id || "",
            reason_second_pref: application.second_pref_reason || "",
            reason_priority: application.priority_reason || "",
            links: application.portfolio_link || "",
          })
        } else {
          // Set name, email, and register_no from user if no existing application
          setFormData((prev) => ({
            ...prev,
            name: userName,
            email: user?.email || "",
            register_no: userRegisterNo || "",
          }))
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load application data. Please try again.")
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Validation
    if (formData.dept_first_pref === formData.dept_second_pref) {
      setError("First and second preference departments must be different.")
      setIsSubmitting(false)
      return
    }

    try {
      await saveApplication({
        name: formData.name,
        email: formData.email,
        register_no: formData.register_no,
        first_pref_dept_id: formData.dept_first_pref,
        first_pref_reason: formData.reason_first_pref,
        second_pref_dept_id: formData.dept_second_pref,
        second_pref_reason: formData.reason_second_pref,
        priority_reason: formData.reason_priority,
        portfolio_link: formData.links,
        status: "pending",
      })

      setSuccess(existingApplication ? "Application updated successfully!" : "Application submitted successfully!")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    // Add your sign out logic here
    router.push("/")
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden bottom-bg">
      {/* Animated morphing red blob at the bottom edge */}
      <div className="bottom-red-blob"></div>

      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Application Section */}
      <div className="container flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-center items-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-9 bg-white rounded-md flex items-center justify-center shadow-lg border border-gray-100">
              <span className="text-red-500 font-bold text-3xl">h.</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-purple-500 bg-clip-text text-transparent">
              HackClub Recruitment
            </h1>
          </div>
        </header>

        {/* Progress Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 md:space-x-10">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <span className="ml-2 text-white font-medium text-sm md:text-base">Account</span>
            </div>
            <div className="w-8 md:w-16 h-px bg-white"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <span className="ml-2 text-white font-medium text-sm md:text-base">Application</span>
            </div>
            <div className="w-8 md:w-16 h-px bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="ml-2 text-gray-400 font-medium text-sm md:text-base">Submission</span>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Application Form</h1>
          <p className="text-gray-200">
            {existingApplication
              ? "Update your application details below."
              : "Please fill out the form below to submit your application."}
          </p>
          {deadline && (
            <p className="text-sm text-gray-200">
              Application deadline: {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Alerts */}
        {deadlinePassed && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-red-200">Application Closed</AlertTitle>
            <AlertDescription className="text-red-200">
              The application deadline has passed. You can no longer submit or edit your application.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-500/50 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          {/* Personal Information Card */}
          <Card className="mb-6 bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">Please provide your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={true}
                    className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg disabled:bg-black/10 disabled:text-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={true}
                    className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg disabled:bg-black/10 disabled:text-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register_no" className="text-white">Register Number</Label>
                <Input
                  id="register_no"
                  name="register_no"
                  value={formData.register_no}
                  onChange={handleChange}
                  required
                  disabled={true}
                  className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg disabled:bg-black/10 disabled:text-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Department Preferences Card */}
          <Card className="mb-6 bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Department Preferences</CardTitle>
              <CardDescription className="text-gray-400">Select your preferred departments and provide reasons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept_first_pref" className="text-white">First Preference Department</Label>
                  <Select
                    disabled={deadlinePassed}
                    onValueChange={(value) => handleSelectChange("dept_first_pref", value)}
                    value={formData.dept_first_pref}
                  >
                    <SelectTrigger className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-gray-600/50 backdrop-blur-sm">
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_first_pref" className="text-white">Reason for First Preference</Label>
                  <Textarea
                    id="reason_first_pref"
                    name="reason_first_pref"
                    value={formData.reason_first_pref}
                    onChange={handleChange}
                    rows={3}
                    required
                    disabled={deadlinePassed}
                    placeholder="Explain why this is your first choice..."
                    className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept_second_pref" className="text-white">Second Preference Department</Label>
                  <Select
                    disabled={deadlinePassed}
                    onValueChange={(value) => handleSelectChange("dept_second_pref", value)}
                    value={formData.dept_second_pref}
                  >
                    <SelectTrigger className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-gray-600/50 backdrop-blur-sm">
                      {DEPARTMENTS.filter((dept) => dept.id !== formData.dept_first_pref).map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_second_pref" className="text-white">Reason for Second Preference</Label>
                  <Textarea
                    id="reason_second_pref"
                    name="reason_second_pref"
                    value={formData.reason_second_pref}
                    onChange={handleChange}
                    rows={3}
                    required
                    disabled={deadlinePassed}
                    placeholder="Explain why this is your second choice..."
                    className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason_priority" className="text-white">Reason for Preference Priority</Label>
                <Textarea
                  id="reason_priority"
                  name="reason_priority"
                  value={formData.reason_priority}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={deadlinePassed}
                  placeholder="Explain why you prioritized your preferences in this order..."
                  className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="mb-6 bg-black/20 border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Additional Information</CardTitle>
              <CardDescription className="text-gray-400">Provide links to your portfolio, resume, or GitHub</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="links" className="text-white">Portfolio/Resume/GitHub Links</Label>
                <Textarea
                  id="links"
                  name="links"
                  value={formData.links}
                  onChange={handleChange}
                  placeholder="https://portfolio.com&#10;https://github.com/username&#10;https://resume-link.com"
                  disabled={deadlinePassed}
                  rows={3}
                  className="bg-black/20 border-gray-600/50 text-white placeholder-gray-400 backdrop-blur-sm focus:border-white/50 focus:bg-black/30 transition-all duration-300 focus:transform focus:scale-105 focus:shadow-lg resize-none"
                />
                <p className="text-xs text-gray-400">You can add multiple links, one per line</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105 font-medium py-2.5 shadow-lg hover:shadow-xl disabled:bg-gray-500 disabled:cursor-not-allowed" 
                disabled={isSubmitting || deadlinePassed}
              >
                {isSubmitting
                  ? existingApplication
                    ? "Updating..."
                    : "Submitting..."
                  : deadlinePassed
                    ? "Deadline Passed"
                    : existingApplication
                      ? "Update Application"
                      : "Submit Application"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* Why Join Hackclub Section */}
      <div className="border-t border-gray-800 py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 text-white">
            Why Join Hackclub?
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">Learn by Building</h2>
              <p className="text-gray-400 leading-relaxed">
                Create real projects with mentorship from industry professionals and fellow hackers.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">Innovative Community</h2>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded students passionate about technology and innovation.
              </p>
            </div>
            <div className="bg-black/20 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700/50 hover:border-gray-600/70 hover:bg-black/30 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">Launch Your Ideas</h2>
              <p className="text-gray-400 leading-relaxed">
                Get support to transform your ideas into reality through hackathons and workshops.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-400 text-center text-xs">
              © 2025 Hack Club. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Styles for background, moving red blob at bottom edge, and stars */}
      <style jsx global>{`
        .bottom-bg {
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
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 100%;
          animation: moveStars 10s linear infinite;
          opacity: 0.8;
          z-index: 2;
        }
        @keyframes moveStars {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}