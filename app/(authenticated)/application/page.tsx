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
    <div className="bg-black text-white min-h-screen">
     

      {/* Application Section */}
      <div className="container flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-center items-center mb-8">
          <Image 
            src="/Hackclubheader.png" 
            alt="Header" 
            width={600}
            height={200}
            className="max-w-full h-auto"
          />
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
          <p className="text-gray-400">
            {existingApplication
              ? "Update your application details below."
              : "Please fill out the form below to submit your application."}
          </p>
          {deadline && (
            <p className="text-sm text-gray-400">
              Application deadline: {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Alerts */}
        {deadlinePassed && (
          <Alert variant="destructive" className="mb-6 bg-red-900 border-red-800 text-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Closed</AlertTitle>
            <AlertDescription>
              The application deadline has passed. You can no longer submit or edit your application.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900 border-red-800 text-red-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900 border-green-800 text-green-100">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          {/* Personal Information Card */}
          <Card className="mb-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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
                    className="bg-white border-gray-300 text-black placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-700 focus:border-blue-500 focus:ring-blue-500"
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
                    className="bg-white border-gray-300 text-black placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-700 focus:border-blue-500 focus:ring-blue-500"
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
                  className="bg-white border-gray-300 text-black placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Department Preferences Card */}
          <Card className="mb-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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
                    <SelectTrigger className="bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="text-black hover:bg-gray-100">
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
                    className="bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                    <SelectTrigger className="bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {DEPARTMENTS.filter((dept) => dept.id !== formData.dept_first_pref).map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="text-black hover:bg-gray-100">
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
                    className="bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
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
                  className="bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="mb-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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
                  className="bg-white border-gray-300 text-black placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400">You can add multiple links, one per line</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-gray-500 disabled:cursor-not-allowed" 
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
      <div className="border-t border-gray-800 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Main Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 text-white">
            Why Join Hackclub?
          </h1>
          
          {/* Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {/* Card 1 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-900/70 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors">Learn by Building</h2>
              <p className="text-gray-400 leading-relaxed">
                Create real projects with mentorship from industry professionals and fellow hackers.
              </p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-900/70 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-purple-400 transition-colors">Innovative Community</h2>
              <p className="text-gray-400 leading-relaxed">
                Connect with like-minded students passionate about technology and innovation.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-900/70 transition-all duration-300 group">
              <h2 className="text-xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">Launch Your Ideas</h2>
              <p className="text-gray-400 leading-relaxed">
                Get support to transform your ideas into reality through hackathons and workshops.
              </p>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  )
}