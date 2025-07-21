"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Star,
  Mail,
  Hash,
  Calendar,
  ExternalLink,
  NotebookPen,
  NotebookText,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getDepartmentApplicants,
  getDepartmentNameById,
  updateApplicationStatus,
  getOverallApplicationStatus,
  type Application,
  getApplicantMarks,
  getPanelByDepartment,
  createPanel,
  getPanelMembers,
  getRecruiterByDepartment,
  addRecruiterToPanel,
  removeRecruiterFromPanel,
} from "@/lib/supabase/data-fetching";
import { HackClubLogo } from "@/components/hackclub-logo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function DepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const deptId = params.dept as string;

  const [departmentName, setDepartmentName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [preferenceFilter, setPreferenceFilter] = useState("all");
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Application[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] =
    useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarksDialogOpen, setIsMarksDialogOpen] = useState(false);
  const [isNewPanelDialogOpen, setIsNewPanelDialogOpen] = useState(false);
  const [isPanelMembersDialogOpen, setIsPanelMembersDialogOpen] =
    useState(false);
  const [selectedPanel, setSelectedPanel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [panelMembers, setPanelMembers] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const [departmentRecruiters, setDepartmentRecruiters] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const [isUpdating, setIsUpdating] = useState(false);

  const [firstPrefDeptName, setFirstPrefDeptName] = useState<string>("");
  const [secondPrefDeptName, setSecondPrefDeptName] = useState<string>("");

  const [panels, setPanels] = useState<{ id: string; name: string }[]>([]);

  const [evaluations, setEvaluations] = useState<
    { score: number; remarks: string; recruiter: { full_name: string } }[]
  >([]);

  const fetchPanelMembers = async () => {
    if (selectedPanel) {
      const members = await getPanelMembers(selectedPanel.id);
      setPanelMembers(members);
      setDepartmentRecruiters(
        (await getRecruiterByDepartment(deptId)).filter(
          (item) => item.panel_id === null
        )
      );
    }
  };

  useEffect(() => {
    fetchPanelMembers();
  }, [selectedPanel]);

  useEffect(() => {
    if (panelMembers.length > 0) return;
    // Fetch panel members only if they are not already fetched or if new panel is selected
    fetchPanelMembers();
  }, [panelMembers]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedApplicant) {
        setEvaluations(await getApplicantMarks(selectedApplicant.id, deptId));
      }
    };

    fetchData();
  }, [isMarksDialogOpen]);

  useEffect(() => {
    if (panels.length > 0) return;
    // Fetch panels only if they are not already fetched or if new panel is added
    const fetchPanels = async () => {
      try {
        const data = await getPanelByDepartment(deptId);
        setPanels(data);
      } catch (err) {
        console.error("Error fetching panels:", err);
      }
    };

    fetchPanels();
  }, [panels]);

  useEffect(() => {
    const fetchDeptName = async () => {
      const name = await getDepartmentNameById(deptId);
      setDepartmentName(name || deptId);
    };
    fetchDeptName();
  }, [deptId]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const data = await getDepartmentApplicants(deptId);
        setApplicants(data);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, [deptId]);

  useEffect(() => {
    const filtered = applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.register_no
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const overallStatus = getOverallApplicationStatus(applicant);
      const matchesStatus =
        statusFilter === "all" ||
        overallStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchesPreference =
        preferenceFilter === "all" ||
        (preferenceFilter === "first" &&
          applicant.first_pref_dept_id === deptId) ||
        (preferenceFilter === "second" &&
          applicant.second_pref_dept_id === deptId);

      return matchesSearch && matchesStatus && matchesPreference;
    });

    setFilteredApplicants(filtered);
  }, [applicants, searchQuery, statusFilter, preferenceFilter, deptId]);

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string,
    preference: "first" | "second"
  ) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const data = await updateApplicationStatus(
        applicationId,
        newStatus,
        preference
      );

      setApplicants((prev) =>
        prev.map((app) => {
          if (app.id === applicationId) {
            const updateField =
              preference === "first"
                ? "first_pref_status"
                : "second_pref_status";
            return { ...app, [updateField]: newStatus };
          }
          return app;
        })
      );
      return data;
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPreferenceStatus = (
    applicant: Application,
    preference: "first" | "second"
  ) => {
    return preference === "first"
      ? applicant.first_pref_status
      : applicant.second_pref_status;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "shortlisted":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            Shortlisted
          </Badge>
        );
      case "waitlisted":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Waitlisted
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Accepted
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPreferenceType = (applicant: Application) => {
    return applicant.first_pref_dept_id === deptId ? "first" : "second";
  };

  const departmentStats = {
    totalApplicants: applicants.length,
    firstPrefCount: applicants.filter(
      (app) => app.first_pref_dept_id === deptId
    ).length,
    secondPrefCount: applicants.filter(
      (app) => app.second_pref_dept_id === deptId
    ).length,
    pendingCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "pending"
    ).length,
    shortlistedCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "shortlisted"
    ).length,
    waitlistedCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "waitlisted"
    ).length,
    rejectedCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "rejected"
    ).length,
  };

  useEffect(() => {
    const fetchDeptNames = async () => {
      if (selectedApplicant) {
        const [first, second] = await Promise.all([
          getDepartmentNameById(selectedApplicant.first_pref_dept_id),
          getDepartmentNameById(selectedApplicant.second_pref_dept_id),
        ]);
        setFirstPrefDeptName(first || selectedApplicant.first_pref_dept_id);
        setSecondPrefDeptName(second || selectedApplicant.second_pref_dept_id);
      } else {
        setFirstPrefDeptName("");
        setSecondPrefDeptName("");
      }
    };
    fetchDeptNames();
  }, [selectedApplicant]);

  if (isLoading) {
    return (
      <div className="min-h-screen hackclub-bg">
        <div className="content-container py-8">
          <div className="space-y-6 px-4">
            <div className="loading-shimmer h-8 w-64 rounded"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-shimmer h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hackclub-bg page-transition">
      <div className="content-container py-8">
        <div className="px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href="/dashboard/recruiter"
                  className="hover:text-primary"
                >
                  Dashboard
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span>Departments</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{departmentName}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex justify-center">
                <HackClubLogo size="md" showText={false} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {departmentName} Department
                </h1>
                <p className="text-muted-foreground">
                  Manage applications for this department
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Applicants
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {departmentStats.totalApplicants}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/50">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    First Preference
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {departmentStats.firstPrefCount}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/20 border border-primary/50">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {departmentStats.pendingCount}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                  <Filter className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shortlisted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {departmentStats.shortlistedCount}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/20 border border-green-500/50">
                  <Download className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <Card className="neo-card mb-8">
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle>Panels for {departmentName}</CardTitle>
                <CardDescription className="text-base">
                  Manage panels and for this department
                </CardDescription>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-fit border-2"
                  onClick={async () => {
                    setIsNewPanelDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Panel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {panels.length === 0 ? (
                  <div className="text-center py-12">
                    <NotebookText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No panels found
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {panels.map((panel) => (
                      <Card key={panel.id} className="neo-card">
                        <CardContent className="p-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                                <NotebookText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="text-lg">{panel.name}</p>
                              </div>
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                className="h-12 w-12"
                                onClick={() => {
                                  setSelectedPanel(panel);
                                  setIsPanelMembersDialogOpen(true);
                                }}
                              >
                                <NotebookPen className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="neo-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    Applicants for {departmentName}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Review and manage department applications
                  </CardDescription>
                </div>
                <Button variant="outline" className="w-fit border-2">
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
                    className="pl-8 bg-input border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={preferenceFilter}
                    onValueChange={setPreferenceFilter}
                  >
                    <SelectTrigger className="w-[140px] bg-input border-border">
                      <SelectValue placeholder="Preference" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">All Preferences</SelectItem>
                      <SelectItem value="first">First Choice</SelectItem>
                      <SelectItem value="second">Second Choice</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-input border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Applications Grid */}
              <div className="space-y-4">
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No applicants found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery ||
                      statusFilter !== "all" ||
                      preferenceFilter !== "all"
                        ? "Try adjusting your filters to see more results."
                        : "Applications will appear here once students start applying."}
                    </p>
                  </div>
                ) : (
                  filteredApplicants.map((applicant) => {
                    const preferenceType = getPreferenceType(applicant);
                    const currentStatus = getPreferenceStatus(
                      applicant,
                      preferenceType
                    );

                    return (
                      <Card
                        key={applicant.id}
                        className="neo-card transition-all duration-300 hover:scale-[1.02]"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => {
                                        setSelectedApplicant(applicant);
                                        setIsDialogOpen(true);
                                      }}
                                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors text-left"
                                    >
                                      {applicant.name || "N/A"}
                                    </button>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      {applicant.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Hash className="h-3 w-3" />
                                      {applicant.register_no}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className={
                                      preferenceType === "first"
                                        ? "border-primary text-primary bg-primary/10"
                                        : ""
                                    }
                                  >
                                    {preferenceType === "first" ? "1st" : "2nd"}{" "}
                                    Preference
                                  </Badge>
                                  {getStatusBadge(currentStatus)}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant.id,
                                        "accepted",
                                        preferenceType
                                      )
                                    }
                                    disabled={
                                      currentStatus === "accepted" || isUpdating
                                    }
                                    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant.id,
                                        "shortlisted",
                                        preferenceType
                                      )
                                    }
                                    disabled={
                                      currentStatus === "shortlisted" ||
                                      isUpdating
                                    }
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                  >
                                    Shortlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant.id,
                                        "waitlisted",
                                        preferenceType
                                      )
                                    }
                                    disabled={
                                      currentStatus === "waitlisted" ||
                                      isUpdating
                                    }
                                    className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
                                  >
                                    Waitlist
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant.id,
                                        "rejected",
                                        preferenceType
                                      )
                                    }
                                    disabled={
                                      currentStatus === "rejected" || isUpdating
                                    }
                                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                    Reject
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApplicant(applicant);
                                      setIsMarksDialogOpen(true);
                                    }}
                                    className="border-2"
                                  >
                                    <NotebookText className="mr-2 h-4 w-4" />
                                    View Marks
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApplicant(applicant);
                                      setIsDialogOpen(true);
                                    }}
                                    className="border-2"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Panel Members Dialog */}
          <Dialog
            open={isPanelMembersDialogOpen}
            onOpenChange={setIsPanelMembersDialogOpen}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto neo-card border-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Panel Members
                </DialogTitle>
                <DialogDescription>
                  Manage panel members for {selectedPanel?.name}
                </DialogDescription>
              </DialogHeader>
              <Select
                onValueChange={async (value) => {
                  if (selectedPanel) {
                    const res = await addRecruiterToPanel(
                      value,
                      deptId,
                      selectedPanel?.id
                    );
                    if (res) {
                      toast.success("Recruiter added to panel successfully");
                      setPanelMembers([]);
                    } else {
                      toast.error("Failed to add recruiter to panel");
                    }
                  }
                }}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Add Recruiters" />
                </SelectTrigger>
                <SelectContent>
                  {departmentRecruiters.map((recruiter) => (
                    <SelectItem value={recruiter.id} key={recruiter.id}>
                      {recruiter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panelMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-12">
                        No members found in this panel
                      </TableCell>
                    </TableRow>
                  ) : (
                    panelMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            onClick={async () => {
                              if (!selectedPanel?.id) return;
                              const res = await removeRecruiterFromPanel(
                                member.id,
                                selectedPanel?.id
                              );
                              if (res) {
                                toast.success("Recruiter removed from panel");
                                setPanelMembers((prev) =>
                                  prev.filter((m) => m.id !== member.id)
                                );
                              } else {
                                toast.error("Failed to remove recruiter");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>

          {/* New Panel Dialog */}
          <Dialog
            open={isNewPanelDialogOpen}
            onOpenChange={setIsNewPanelDialogOpen}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto neo-card border-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  New Panel
                </DialogTitle>
                <DialogDescription>
                  Create a new panel for {departmentName} department
                </DialogDescription>
              </DialogHeader>
              <form
                action={async (e) => {
                  const panelName = e.get("new_panel_name")?.toString();
                  console.log("Creating panel with name:", panelName);
                  if (panelName) {
                    const data = await createPanel(panelName, deptId);
                    if (data) {
                      setIsNewPanelDialogOpen(false);
                      toast.success("New panel created successfully");
                      setPanels([]); // Clear panels to refetch
                    } else {
                      toast.error("Failed to create new panel");
                    }
                  }
                }}
              >
                <Input placeholder="Panel Name" name="new_panel_name" />
                <Button type="submit" className="mt-4 w-full">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Applicant Marks Dialog */}
          <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto neo-card border-0">
              <DialogHeader>
                <div className="flex justify-between p-3">
                  <div>
                    <DialogTitle className="text-xl font-semibold">
                      Applicant Marks
                    </DialogTitle>
                    <DialogDescription>
                      Marks and remarks for {selectedApplicant?.name}
                    </DialogDescription>
                  </div>
                  {/* Accept and Reject Button */}
                  {selectedApplicant && (
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          const preferenceType =
                            getPreferenceType(selectedApplicant);
                          const data = await handleStatusUpdate(
                            selectedApplicant.id,
                            "accepted",
                            preferenceType
                          );
                          if (data) {
                            setIsMarksDialogOpen(false);
                            toast.success("Application accepted successfully");
                          } else {
                            toast.error("Failed to accept application");
                          }
                        }}
                        variant="outline"
                        className="border-2 border-green-600 hover:bg-green-600"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={async () => {
                          const preferenceType =
                            getPreferenceType(selectedApplicant);
                          const data = await handleStatusUpdate(
                            selectedApplicant.id,
                            "rejected",
                            preferenceType
                          );
                          if (data) {
                            setIsMarksDialogOpen(false);
                            toast.success("Application rejected successfully");
                          } else {
                            toast.error("Failed to reject application");
                          }
                        }}
                        variant="outline"
                        className="border-2 border-red-600 hover:bg-red-600"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>

              {selectedApplicant && evaluations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recruiter</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.recruiter.full_name}>
                        <TableCell>{evaluation.recruiter.full_name}</TableCell>
                        <TableCell>{evaluation.score}</TableCell>
                        <TableCell>{evaluation.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p>No evaluations found !</p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Applicant Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto neo-card border-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Applicant Details
                </DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedApplicant?.name}
                </DialogDescription>
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
                      <Label className="text-sm font-medium">
                        Register Number
                      </Label>
                      <p className="text-sm">{selectedApplicant.register_no}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(
                          getOverallApplicationStatus(selectedApplicant)
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        First Preference
                      </Label>
                      <p className="text-sm font-medium">{firstPrefDeptName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedApplicant.first_pref_reason}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Second Preference
                      </Label>
                      <p className="text-sm font-medium">
                        {secondPrefDeptName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedApplicant.second_pref_reason}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Priority Reasoning
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplicant.priority_reason}
                      </p>
                    </div>

                    {selectedApplicant.portfolio_link && (
                      <div>
                        <Label className="text-sm font-medium">
                          Portfolio/Links
                        </Label>
                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {selectedApplicant.portfolio_link
                            .split("\n")
                            .map((link, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                {link.startsWith("http") ? (
                                  <>
                                    <ExternalLink className="h-3 w-3" />
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {link}
                                    </a>
                                  </>
                                ) : (
                                  link
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">
                        Submitted At
                      </Label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          selectedApplicant.created_at
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (selectedApplicant) {
                        const preferenceType =
                          getPreferenceType(selectedApplicant);
                        handleStatusUpdate(
                          selectedApplicant.id,
                          "shortlisted",
                          preferenceType
                        );
                      }
                    }}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedApplicant) {
                        const preferenceType =
                          getPreferenceType(selectedApplicant);
                        handleStatusUpdate(
                          selectedApplicant.id,
                          "waitlisted",
                          preferenceType
                        );
                      }
                    }}
                    disabled={isUpdating}
                    className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    Waitlist
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedApplicant) {
                        const preferenceType =
                          getPreferenceType(selectedApplicant);
                        handleStatusUpdate(
                          selectedApplicant.id,
                          "rejected",
                          preferenceType
                        );
                      }
                    }}
                    disabled={isUpdating}
                  >
                    Reject
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
