"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
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
  const [DEPARTMENTS, setDepartments] = useState<Department[]>([]) // <-- store Department[]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<Date | null>(null)
  const [existingApplication, setExistingApplication] = useState<Application | null>(null)

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

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Application Form</h1>
        <p className="text-muted-foreground">
          {existingApplication
            ? "Update your application details below."
            : "Please fill out the form below to submit your application."}
        </p>
        {deadline && (
          <p className="text-sm text-muted-foreground mt-2">
            Application deadline: {deadline.toLocaleDateString()} at {deadline.toLocaleTimeString()}
          </p>
        )}
      </div>

      {deadlinePassed && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Closed</AlertTitle>
          <AlertDescription>
            The application deadline has passed. You can no longer submit or edit your application.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Please provide your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={true}
                  className="bg-muted" // Name comes from auth, can't be changed
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={true} // Email comes from auth, can't be changed
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register_no">Register Number</Label>
              <Input
                id="register_no"
                name="register_no"
                value={formData.register_no}
                onChange={handleChange}
                required
                disabled={true}
                className="bg-muted" // Register number comes from auth, can't be changed
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Department Preferences</CardTitle>
            <CardDescription>Select your preferred departments and provide reasons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept_first_pref">First Preference Department</Label>
                <Select
                  disabled={deadlinePassed}
                  onValueChange={(value) => handleSelectChange("dept_first_pref", value)}
                  value={formData.dept_first_pref}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason_first_pref">Reason for First Preference</Label>
                <Textarea
                  id="reason_first_pref"
                  name="reason_first_pref"
                  value={formData.reason_first_pref}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={deadlinePassed}
                  placeholder="Explain why this is your first choice..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dept_second_pref">Second Preference Department</Label>
                <Select
                  disabled={deadlinePassed}
                  onValueChange={(value) => handleSelectChange("dept_second_pref", value)}
                  value={formData.dept_second_pref}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter((dept) => dept.id !== formData.dept_first_pref).map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason_second_pref">Reason for Second Preference</Label>
                <Textarea
                  id="reason_second_pref"
                  name="reason_second_pref"
                  value={formData.reason_second_pref}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={deadlinePassed}
                  placeholder="Explain why this is your second choice..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason_priority">Reason for Preference Priority</Label>
              <Textarea
                id="reason_priority"
                name="reason_priority"
                value={formData.reason_priority}
                onChange={handleChange}
                rows={3}
                required
                disabled={deadlinePassed}
                placeholder="Explain why you prioritized your preferences in this order..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Provide links to your portfolio, resume, or GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="links">Portfolio/Resume/GitHub Links</Label>
              <Textarea
                id="links"
                name="links"
                value={formData.links}
                onChange={handleChange}
                placeholder="https://portfolio.com&#10;https://github.com/username&#10;https://resume-link.com"
                disabled={deadlinePassed}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">You can add multiple links, one per line</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || deadlinePassed}>
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
  )
}
