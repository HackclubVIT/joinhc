"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, UserCheck, UserX, Clock, Download, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getDepartmentApplicants,
  updateApplicationStatus,
  getAllApplicationsForExport,
  type Application,
  getDepartments,
  getDepartmentNameById,
} from "@/lib/supabase/data-fetching"

export default function DepartmentPage() {
  const params = useParams()
  const { user } = useAuth()
  const deptId = params.dept as string

  const [departmentName, setDepartmentName] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [preferenceFilter, setPreferenceFilter] = useState("all")
  const [applicants, setApplicants] = useState<Application[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Add state for department names in dialog
  const [firstPrefDeptName, setFirstPrefDeptName] = useState<string>("")
  const [secondPrefDeptName, setSecondPrefDeptName] = useState<string>("")

  useEffect(() => {
    // Fetch department name by id
    const fetchDeptName = async () => {
      const name = await getDepartmentNameById(deptId)
      setDepartmentName(name || deptId)
    }
    fetchDeptName()
  }, [deptId])

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const data = await getDepartmentApplicants(deptId)
        setApplicants(data)
      } catch (err) {
        console.error("Error fetching applicants:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplicants()
  }, [deptId])

  useEffect(() => {
    // Filter applicants based on search query, status filter, and preference filter
    const filtered = applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.register_no.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || applicant.status.toLowerCase() === statusFilter.toLowerCase()

      const matchesPreference =
        preferenceFilter === "all" ||
        (preferenceFilter === "first" && applicant.first_pref_dept_id === deptId) ||
        (preferenceFilter === "second" && applicant.second_pref_dept_id === deptId)

      return matchesSearch && matchesStatus && matchesPreference
    })

    setFilteredApplicants(filtered)
  }, [applicants, searchQuery, statusFilter, preferenceFilter, deptId])

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!user) return

    setIsUpdating(true)
    try {
      await updateApplicationStatus(applicationId, newStatus)

      // Update local state
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus as any, reviewer: user.id } : app)),
      )
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update status. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExport = async () => {
    try {
      const allApplications = await getAllApplicationsForExport()

      // Filter for current department
      const deptApplications = allApplications.filter(
        (app) => app.dept_first_pref === departmentName || app.dept_second_pref === departmentName,
      )

      // Convert to CSV
      const headers = [
        "Name",
        "Email",
        "Register No",
        "First Preference",
        "Second Preference",
        "Status",
        "Preference Type",
        "Submitted At",
      ]

      const csvContent = [
        headers.join(","),
        ...deptApplications.map((app) =>
          [
            `"${app.name}"`,
            `"${app.email}"`,
            `"${app.register_no}"`,
            `"${app.dept_first_pref}"`,
            `"${app.dept_second_pref}"`,
            `"${app.status}"`,
            `"${app.dept_first_pref === departmentName ? "First" : "Second"}"`,
            `"${new Date(app.submitted_at).toLocaleDateString()}"`,
          ].join(","),
        ),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${departmentName.replace(/\s+/g, "_")}_applications.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting data:", err)
      alert("Failed to export data. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return <Badge className="bg-green-500">Shortlisted</Badge>
      case "waitlisted":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Waitlisted
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "waitlisted":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <UserX className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getPreferenceType = (applicant: Application) => {
    return applicant.first_pref_dept_id === deptId ? "First" : "Second"
  }

  const departmentStats = {
    totalApplicants: applicants.length,
    firstPrefCount: applicants.filter((app) => app.first_pref_dept_id === deptId).length,
    secondPrefCount: applicants.filter((app) => app.second_pref_dept_id === deptId).length,
    pendingCount: applicants.filter((app) => app.status === "pending").length,
    shortlistedCount: applicants.filter((app) => app.status === "shortlisted").length,
    waitlistedCount: applicants.filter((app) => app.status === "waitlisted").length,
    rejectedCount: applicants.filter((app) => app.status === "rejected").length,
  }

  useEffect(() => {
    // Fetch department names for selected applicant in dialog
    const fetchDeptNames = async () => {
      if (selectedApplicant) {
        const [first, second] = await Promise.all([
          getDepartmentNameById(selectedApplicant.first_pref_dept_id),
          getDepartmentNameById(selectedApplicant.second_pref_dept_id),
        ])
        setFirstPrefDeptName(first || selectedApplicant.first_pref_dept_id)
        setSecondPrefDeptName(second || selectedApplicant.second_pref_dept_id)
      } else {
        setFirstPrefDeptName("")
        setSecondPrefDeptName("")
      }
    }
    fetchDeptNames()
  }, [selectedApplicant])

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{departmentName} Department</h1>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{departmentName} Department</h1>
        <p className="text-muted-foreground">Manage applications for this department</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{departmentStats.totalApplicants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">First Preference</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{departmentStats.firstPrefCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{departmentStats.pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{departmentStats.shortlistedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Applicants</CardTitle>
              <CardDescription>Manage applicants for {departmentName}</CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" className="w-fit">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={preferenceFilter} onValueChange={setPreferenceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Preferences</SelectItem>
                  <SelectItem value="first">First Choice</SelectItem>
                  <SelectItem value="second">Second Choice</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Register No</TableHead>
                  <TableHead className="hidden sm:table-cell">Preference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No applicants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => {
                            setSelectedApplicant(applicant)
                            setIsDialogOpen(true)
                          }}
                          className="hover:underline text-left"
                        >
                          {applicant.name}
                        </button>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{applicant.email}</TableCell>
                      <TableCell>{applicant.register_no}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className={getPreferenceType(applicant) === "First" ? "border-primary text-primary" : ""}
                        >
                          {getPreferenceType(applicant)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(applicant.status)}
                          {getStatusBadge(applicant.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => {
                              setSelectedApplicant(applicant)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Select
                            onValueChange={(value) => handleStatusUpdate(applicant.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shortlisted">Shortlist</SelectItem>
                              <SelectItem value="waitlisted">Waitlist</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                              <SelectItem value="pending">Reset</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
            <DialogDescription>Detailed information about {selectedApplicant?.name}</DialogDescription>
          </DialogHeader>

          {selectedApplicant && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedApplicant.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedApplicant.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Register Number</Label>
                  <p className="text-sm">{selectedApplicant.register_no}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedApplicant.status)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">First Preference</Label>
                  <p className="text-sm font-medium">{firstPrefDeptName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedApplicant.first_pref_reason}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Second Preference</Label>
                  <p className="text-sm font-medium">{secondPrefDeptName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedApplicant.second_pref_reason}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Priority Reasoning</Label>
                  <p className="text-sm text-muted-foreground">{selectedApplicant.priority_reason}</p>
                </div>

                {selectedApplicant.portfolio_link && (
                  <div>
                    <Label className="text-sm font-medium">Links</Label>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedApplicant.portfolio_link.split("\n").map((link, index) => (
                        <div key={index}>
                          {link.startsWith("http") ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {link}
                            </a>
                          ) : (
                            link
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Submitted At</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedApplicant.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedApplicant && handleStatusUpdate(selectedApplicant.id, "shortlisted")}
                disabled={isUpdating}
              >
                Shortlist
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedApplicant && handleStatusUpdate(selectedApplicant.id, "waitlisted")}
                disabled={isUpdating}
              >
                Waitlist
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedApplicant && handleStatusUpdate(selectedApplicant.id, "rejected")}
                disabled={isUpdating}
              >
                Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
