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
  Users,
  UserPlus,
  UserCheck,
  ListTodo,
  CheckCircle,
  AlertCircle,
  Clock,
  UserMinus,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getDepartmentApplicants,
  getDepartmentNameById,
  updateApplicationStatus,
  getOverallApplicationStatus,
  type Application,
  getApplicantMarks,
  getApplicantAverageMarks,
  getPanelByDepartment,
  createPanel,
  getPanelMembers,
  getRecruiterByDepartment,
  addRecruiterToPanel,
  removeRecruiterFromPanel,
  getShortlistedApplicantsByDepartment,
  getUnassignedShortlistedApplicantsByDepartment,
  getShortlistedApplicantsWithAssignmentStatus,
  assignApplicantToPanel,
  removeApplicantFromPanel,
  getApplicationDeadline,
  getShortlistDeadline,
  isCurrentUserRecruiterForDepartment,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

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
  const [shortlistedApplicants, setShortlistedApplicants] = useState<any[]>([]);
  const { toast } = useToast();

  const [departmentRecruiters, setDepartmentRecruiters] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isRecruiterForDepartment, setIsRecruiterForDepartment] = useState(false);

  const [firstPrefDeptName, setFirstPrefDeptName] = useState<string>("");
  const [secondPrefDeptName, setSecondPrefDeptName] = useState<string>("");

  const [panels, setPanels] = useState<{ id: string; name: string }[]>([]);

  const [evaluations, setEvaluations] = useState<
    { score: number; remarks: string; recruiter: { full_name: string } }[]
  >([]);
  const [averageMarks, setAverageMarks] = useState<{
    average: number;
    totalMarks: number;
    totalEvaluators: number;
  } | null>(null);
  const [applicantAverages, setApplicantAverages] = useState<{
    [applicantId: string]: {
      average: number;
      totalEvaluators: number;
    } | null;
  }>({});

  const [isPanelDialogOpen, setIsPanelDialogOpen] = useState(false);
  const [panelDialogTab, setPanelDialogTab] = useState('recruiters');

  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [shortlistDeadline, setShortlistDeadline] = useState<Date | null>(null);

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
    
    fetchPanelMembers();
  }, [panelMembers]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedApplicant) {
        const [marks, average] = await Promise.all([
          getApplicantMarks(selectedApplicant.id, deptId),
          getApplicantAverageMarks(selectedApplicant.id, deptId)
        ]);
        setEvaluations(marks);
        setAverageMarks(average);
      }
    };

    fetchData();
  }, [isMarksDialogOpen, selectedApplicant, deptId]);

  useEffect(() => {
    if (panels.length > 0) return;
    
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
        
        
        const averages: { [applicantId: string]: { average: number; totalEvaluators: number } | null } = {};
        
        for (const applicant of data) {
          try {
            const avgData = await getApplicantAverageMarks(applicant.id, deptId);
            if (avgData) {
              averages[applicant.id] = {
                average: avgData.average,
                totalEvaluators: avgData.totalEvaluators
              };
            } else {
              averages[applicant.id] = null;
            }
          } catch (err) {
            console.error(`Error fetching average for applicant ${applicant.id}:`, err);
            averages[applicant.id] = null;
          }
        }
        
        setApplicantAverages(averages);
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

  useEffect(() => {
    async function fetchDeadlines() {
      try {
        const [appDL, shortDL] = await Promise.all([
          getApplicationDeadline(),
          getShortlistDeadline(),
        ]);
        setApplicationDeadline(appDL?.deadline ? new Date(appDL.deadline) : null);
        setShortlistDeadline(shortDL?.deadline ? new Date(shortDL.deadline) : null);
      } catch (err) {
        setApplicationDeadline(null);
        setShortlistDeadline(null);
      }
    }
    fetchDeadlines();
  }, []);

  
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const isRecruiter = await isCurrentUserRecruiterForDepartment(deptId);
        setIsRecruiterForDepartment(isRecruiter);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsRecruiterForDepartment(false);
      }
    };
    
    checkUserRole();
  }, [deptId]);

  const now = new Date();
  const canShortlist = applicationDeadline && shortlistDeadline && now > applicationDeadline && now < shortlistDeadline;
  const canPanel = shortlistDeadline && now > shortlistDeadline;
  
  
  const getCurrentPhase = () => {
    if (!applicationDeadline || !shortlistDeadline) return 'unknown';
    if (now < applicationDeadline) return 'application';
    if (now < shortlistDeadline) return 'shortlisting';
    return 'interview';
  };
  
  const currentPhase = getCurrentPhase();

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

      case "not_selected":
        return <Badge variant="destructive">Rejected</Badge>;

      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            Accepted
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPreferenceType = (applicant: Application) => {
    return applicant.first_pref_dept_id === deptId ? "first" : "second";
  };

  
  const getAverageScoreBadge = (average: number) => {
    if (average >= 8) return "bg-green-100 text-green-800 border-green-200";
    if (average >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (average >= 4) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
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

    notSelectedCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "not_selected"
    ).length,
    acceptedCount: applicants.filter(
      (app) => getOverallApplicationStatus(app) === "accepted"
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

  
  useEffect(() => {
    if (isPanelDialogOpen && panelDialogTab === 'applicants' && selectedPanel) {
      getShortlistedApplicantsWithAssignmentStatus(deptId, selectedPanel.id).then(setShortlistedApplicants);
    }
  }, [isPanelDialogOpen, panelDialogTab, selectedPanel, deptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen hackclub-bg overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="space-y-6">
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

  const openPanelDialog = (panel: { id: string; name: string }) => {
    setSelectedPanel(panel);
    setPanelDialogTab('recruiters');
    setIsPanelDialogOpen(true);
  };

  
  const handleAssignApplicantToPanel = async (applicantId: string, preference: 'first' | 'second') => {
    if (!selectedPanel) return;
    try {
      await assignApplicantToPanel(applicantId, selectedPanel.id, preference);
      toast({ title: 'Assigned', description: 'Applicant assigned to panel' });
      setShortlistedApplicants(await getShortlistedApplicantsWithAssignmentStatus(deptId, selectedPanel.id));
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to assign', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div>
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
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

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex justify-center sm:justify-start">
                <HackClubLogo size="md" showText={false} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {departmentName} Department
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage applications for this department
                </p>
                {currentPhase !== 'unknown' && (
                  <div className="mt-2">
                    <Badge 
                      variant={currentPhase === 'application' ? 'secondary' : currentPhase === 'shortlisting' ? 'default' : 'outline'}
                      className={currentPhase === 'application' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 
                               currentPhase === 'shortlisting' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                               'bg-green-500/20 text-green-400 border-green-500/30'}
                    >
                      {currentPhase === 'application' ? 'Application Phase' : 
                       currentPhase === 'shortlisting' ? 'Shortlisting Phase' : 
                       'Interview Phase'}
                    </Badge>
                  </div>
                )}
              </div>
              {/* Role indicator */}
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Badge 
                  variant={isRecruiterForDepartment ? "default" : "secondary"}
                  className={isRecruiterForDepartment ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600 text-white"}
                >
                  {isRecruiterForDepartment ? "Recruiter" : "Evaluator"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
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

            {currentPhase === 'shortlisting' && (
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Not Selected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {departmentStats.notSelectedCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-red-500/20 border border-red-500/50">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </div>
            )}

            {currentPhase === 'interview' && (
              <>
                <div className="stats-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Accepted</p>
                      <p className="text-2xl font-bold text-green-600">
                        {departmentStats.acceptedCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/20 border border-green-500/50">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="stats-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {departmentStats.rejectedCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-red-500/20 border border-red-500/50">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {canPanel && (
            <Card className="mb-6 sm:mb-8">
              <CardHeader className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Panels for {departmentName}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage panels and for this department
                  </CardDescription>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="w-full sm:w-fit border-2"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {panels.map((panel) => (
                        <Link href={`/dashboard/recruiter/panel/${panel.id}`} key={panel.id}>
                          <Card>
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                    <NotebookText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-base sm:text-lg font-semibold truncate">{panel.name}</p>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    className="h-10 w-10 sm:h-12 sm:w-12"
                                    onClick={e => {
                                      e.preventDefault();
                                      openPanelDialog(panel);
                                    }}
                                  >
                                    <NotebookPen className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Applications Table UI */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-semibold">
                    Applicants for {departmentName}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Review and manage department applications
                  </CardDescription>
                  {currentPhase !== 'unknown' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {currentPhase === 'application' && 
                        "Showing all applicants. Shortlisting will begin after the application deadline."}
                      {currentPhase === 'shortlisting' && 
                        "Showing all applicants for shortlisting management."}
                      {currentPhase === 'interview' && 
                        "Showing shortlisted applicants and final results (accepted/rejected)."}
                    </div>
                  )}
                </div>
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={preferenceFilter}
                    onValueChange={setPreferenceFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] bg-input border-border">
                      <SelectValue placeholder="Preference" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">All Preferences</SelectItem>
                      <SelectItem value="first">First Choice</SelectItem>
                      <SelectItem value="second">Second Choice</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[140px] bg-input border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      {currentPhase === 'shortlisting' && (
                        <SelectItem value="not_selected">Rejected</SelectItem>
                      )}
                      {currentPhase === 'interview' && (
                        <>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </>
                      )}
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
                        className=" transition-all duration-300 hover:scale-[1.02]"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <button
                                      onClick={() => {
                                        setSelectedApplicant(applicant);
                                        setIsDialogOpen(true);
                                      }}
                                      className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors text-left truncate"
                                    >
                                      {applicant.name || "N/A"}
                                    </button>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
                                      <Mail className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{applicant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
                                      <Hash className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{applicant.register_no}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs sm:text-sm ${
                                      preferenceType === "first"
                                        ? "border-primary text-primary bg-primary/10"
                                        : ""
                                    }`}
                                  >
                                    {preferenceType === "first" ? "1st" : "2nd"} Preference
                                  </Badge>
                                  {getStatusBadge(currentStatus)}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border gap-3">
                                {canShortlist && (
                                  <div className="flex flex-wrap gap-2">
                                    {currentPhase === 'shortlisting' ? (
                                      <>
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
                                          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-xs sm:text-sm"
                                        >
                                          Shortlist
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              applicant.id,
                                              "not_selected",
                                              preferenceType
                                            )
                                          }
                                          disabled={
                                            currentStatus === "not_selected" || isUpdating
                                          }
                                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs sm:text-sm"
                                        >
                                          Reject
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            handleStatusUpdate(
                                              applicant.id,
                                              "pending",
                                              preferenceType
                                            )
                                          }
                                          disabled={
                                            currentStatus === "pending" || isUpdating
                                          }
                                          className="border-gray-500 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20 text-xs sm:text-sm"
                                        >
                                          Reset
                                        </Button>
                                      </>
                                    ) : currentPhase === 'interview' && currentStatus === 'shortlisted' ? (
                                      <>
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
                                            currentStatus === "accepted" as any ||
                                            isUpdating
                                          }
                                          className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 text-xs sm:text-sm"
                                        >
                                          Accept
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
                                            currentStatus === "rejected" as any || isUpdating
                                          }
                                          className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs sm:text-sm"
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    ) : null}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2 items-center">
                                  {canPanel && (
                                    <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedApplicant(applicant);
                                        setIsMarksDialogOpen(true);
                                      }}
                                        className="border-2 text-xs sm:text-sm"
                                    >
                                        <NotebookText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">View Marks</span>
                                        <span className="sm:hidden">Marks</span>
                                    </Button>
                                      {/* Average Marks Indicator */}
                                      {applicantAverages[applicant.id] && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs ${getAverageScoreBadge(applicantAverages[applicant.id]!.average)}`}
                                        >
                                          Average: {applicantAverages[applicant.id]?.average}
                                          {/* <span className="ml-1 opacity-70">
                                            ({applicantAverages[applicant.id]?.totalEvaluators})
                                          </span> */}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedApplicant(applicant);
                                      setIsDialogOpen(true);
                                    }}
                                    className="border-2 text-xs sm:text-sm"
                                  >
                                    <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">View Details</span>
                                    <span className="sm:hidden">Details</span>
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

          {/* Panel Dialog with Tabs */}
          {canPanel && (
            <Dialog open={isPanelDialogOpen} onOpenChange={setIsPanelDialogOpen}>
              <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden border-0">
                <DialogHeader className="pb-4 border-b">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    Manage Panel: {selectedPanel?.name}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Add recruiters and assign applicants to this panel
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={panelDialogTab} onValueChange={setPanelDialogTab} className="flex-1">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="recruiters" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Manage Recruiters
                    </TabsTrigger>
                    <TabsTrigger value="applicants" className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Assign Applicants
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recruiters" className="space-y-6">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Recruiter to Panel
                      </h3>
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-2 block">Select Recruiter</label>
                    <Select
                      onValueChange={async (value) => {
                        if (selectedPanel) {
                          const res = await addRecruiterToPanel(
                            value,
                            deptId,
                            selectedPanel?.id
                          );
                          if (res) {
                            toast({ title: 'Success', description: 'Recruiter added to panel successfully' });
                            setPanelMembers([]);
                          } else {
                            toast({ title: 'Error', description: 'Failed to add recruiter to panel', variant: 'destructive' });
                          }
                        }
                      }}
                    >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a recruiter to add..." />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentRecruiters.map((recruiter) => (
                          <SelectItem value={recruiter.id} key={recruiter.id}>
                            {recruiter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border rounded-lg">
                      <div className="p-4 border-b bg-muted/30">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Current Panel Members
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {panelMembers.length} member{panelMembers.length !== 1 ? 's' : ''} in this panel
                        </p>
                      </div>
                      <div className="overflow-hidden">
                        {panelMembers.length === 0 ? (
                          <div className="p-8 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground font-medium">No members found in this panel</p>
                            <p className="text-sm text-muted-foreground mt-1">Add recruiters using the form above</p>
                          </div>
                        ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Email</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                              {panelMembers.map((member) => (
                                <TableRow key={member.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">{member.name}</TableCell>
                                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                  <TableCell className="text-right">
                                <Button
                                      size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    if (!selectedPanel?.id) return;
                                    const res = await removeRecruiterFromPanel(
                                      member.id,
                                      selectedPanel?.id
                                    );
                                    if (res) {
                                      toast({ title: 'Success', description: 'Recruiter removed from panel successfully' });
                                      setPanelMembers((prev) =>
                                        prev.filter((m) => m.id !== member.id)
                                      );
                                    } else {
                                      toast({ title: 'Error', description: 'Failed to remove recruiter', variant: 'destructive' });
                                    }
                                  }}
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                              ))}
                      </TableBody>
                    </Table>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="applicants" className="space-y-6">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Assign Shortlisted Applicants
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Manage applicant assignments to this panel. Applicants assigned to other panels in this department cannot be assigned here.
                      </p>
                    </div>

                    <div className="bg-card border rounded-lg overflow-hidden">
                      <div className="p-4 border-b bg-muted/30">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <ListTodo className="h-4 w-4" />
                          Applicant List
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {shortlistedApplicants.length} shortlisted applicant{shortlistedApplicants.length !== 1 ? 's' : ''} found
                        </p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        {shortlistedApplicants.length === 0 ? (
                          <div className="p-8 text-center">
                            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground font-medium">No shortlisted applicants found</p>
                            <p className="text-sm text-muted-foreground mt-1">Shortlisted applicants will appear here for assignment</p>
                          </div>
                        ) : (
                          <Table>
                      <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="font-semibold">Applicant Name</TableHead>
                                <TableHead className="font-semibold">Email</TableHead>
                                <TableHead className="font-semibold">Preference</TableHead>
                                <TableHead className="font-semibold">Assignment Status</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                              {shortlistedApplicants.map((a) => {
                            
                            const rows = [];
                            if (a.preference === 'first' || a.preference === 'both') {
                                  const isAssignedToThisPanel = a.first_pref_panel_id === selectedPanel?.id;
                                  const isAssignedToOtherPanel = a.first_pref_panel_id && a.first_pref_panel_id !== selectedPanel?.id;
                                  
                              rows.push(
                                    <TableRow key={a.id + '-first'} className="hover:bg-muted/30">
                                      <TableCell className="font-medium">{a.name}</TableCell>
                                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                          First Preference
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {isAssignedToThisPanel ? (
                                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Assigned to this panel
                                          </Badge>
                                        ) : isAssignedToOtherPanel ? (
                                          <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Assigned to other panel
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Unassigned
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                            variant={isAssignedToThisPanel ? 'default' : 'outline'}
                                            disabled={isAssignedToThisPanel || isAssignedToOtherPanel}
                                      onClick={() => handleAssignApplicantToPanel(a.id, 'first')}
                                            className={isAssignedToThisPanel ? 'bg-green-600 hover:bg-green-700' : ''}
                                          >
                                            {isAssignedToThisPanel ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Assigned
                                              </>
                                            ) : (
                                              <>
                                                <UserPlus className="h-3 w-3 mr-1" />
                                                Assign
                                              </>
                                            )}
                                    </Button>
                                          {isAssignedToThisPanel && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={async () => {
                                        try {
                                          await removeApplicantFromPanel(a.id, 'first');
                                          toast({ title: 'Removed', description: 'Applicant removed from panel' });
                                                  setShortlistedApplicants(await getShortlistedApplicantsWithAssignmentStatus(deptId, selectedPanel?.id));
                                        } catch (err: any) {
                                          toast({ title: 'Error', description: err?.message || 'Failed to remove', variant: 'destructive' });
                                        }
                                      }}
                                    >
                                              <UserMinus className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                          )}
                                        </div>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                            if (a.preference === 'second' || a.preference === 'both') {
                                  const isAssignedToThisPanel = a.second_pref_panel_id === selectedPanel?.id;
                                  const isAssignedToOtherPanel = a.second_pref_panel_id && a.second_pref_panel_id !== selectedPanel?.id;
                                  
                              rows.push(
                                    <TableRow key={a.id + '-second'} className="hover:bg-muted/30">
                                      <TableCell className="font-medium">{a.name}</TableCell>
                                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                          Second Preference
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {isAssignedToThisPanel ? (
                                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Assigned to this panel
                                          </Badge>
                                        ) : isAssignedToOtherPanel ? (
                                          <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Assigned to other panel
                                          </Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Unassigned
                                          </Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                            variant={isAssignedToThisPanel ? 'default' : 'outline'}
                                            disabled={isAssignedToThisPanel || isAssignedToOtherPanel}
                                      onClick={() => handleAssignApplicantToPanel(a.id, 'second')}
                                            className={isAssignedToThisPanel ? 'bg-green-600 hover:bg-green-700' : ''}
                                          >
                                            {isAssignedToThisPanel ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Assigned
                                              </>
                                            ) : (
                                              <>
                                                <UserPlus className="h-3 w-3 mr-1" />
                                                Assign
                                              </>
                                            )}
                                    </Button>
                                          {isAssignedToThisPanel && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={async () => {
                                        try {
                                          await removeApplicantFromPanel(a.id, 'second');
                                          toast({ title: 'Removed', description: 'Applicant removed from panel' });
                                                  setShortlistedApplicants(await getShortlistedApplicantsWithAssignmentStatus(deptId, selectedPanel?.id));
                                        } catch (err: any) {
                                          toast({ title: 'Error', description: err?.message || 'Failed to remove', variant: 'destructive' });
                                        }
                                      }}
                                    >
                                              <UserMinus className="h-3 w-3 mr-1" />
                                      Remove
                                    </Button>
                                          )}
                                        </div>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                            return rows;
                              })}
                      </TableBody>
                    </Table>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}

          {/* New Panel Dialog */}
          {canPanel && (
            <Dialog
              open={isNewPanelDialogOpen}
              onOpenChange={setIsNewPanelDialogOpen}
            >
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto  border-0">
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
                    if (panelName) {
                      const data = await createPanel(panelName, deptId);
                      if (data) {
                        setIsNewPanelDialogOpen(false);
                        toast({ title: 'Success', description: 'New panel created successfully' });
                        setPanels([]); 
                      } else {
                        toast({ title: 'Error', description: 'Failed to create new panel', variant: 'destructive' });
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
          )}

          {/* Applicant Marks Dialog */}
          {canPanel && (
            <Dialog open={isMarksDialogOpen} onOpenChange={setIsMarksDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-0">
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
                    {/* Accept and Reject Button - Only for Recruiters */}
                    {selectedApplicant && isRecruiterForDepartment && (
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
                              toast({ title: 'Success', description: 'Application accepted successfully' });
                            } else {
                              toast({ title: 'Error', description: 'Failed to accept application', variant: 'destructive' });
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
                              toast({ title: 'Success', description: 'Application rejected successfully' });
                            } else {
                              toast({ title: 'Error', description: 'Failed to reject application', variant: 'destructive' });
                            }
                          }}
                          variant="outline"
                          className="border-2 border-red-600 hover:bg-red-600"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {/* Show message for evaluators */}
                    {selectedApplicant && !isRecruiterForDepartment && (
                      <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                        <p className="font-medium">Evaluator Access</p>
                        <p>You can view marks and evaluations, but only recruiters can accept or reject applications.</p>
                      </div>
                    )}
                  </div>
                </DialogHeader>

                {selectedApplicant && evaluations.length > 0 ? (
                  <div className="space-y-6">
                    {/* Average Marks Summary */}
                    {averageMarks && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Performance Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-primary">
                              {averageMarks.average}
                            </p>
                            <p className="text-sm text-muted-foreground">Average Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {averageMarks.totalMarks}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Marks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {averageMarks.totalEvaluators}
                            </p>
                            <p className="text-sm text-muted-foreground">Evaluators</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Individual Evaluations Table */}
                    <div className="bg-card border rounded-lg overflow-hidden">
                      <div className="p-4 border-b bg-muted/30">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <NotebookText className="h-4 w-4" />
                          Individual Evaluations
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Detailed scores and remarks from each evaluator
                        </p>
                      </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                            <TableHead className="font-semibold">Evaluator</TableHead>
                            <TableHead className="font-semibold">Score</TableHead>
                            <TableHead className="font-semibold">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evaluations.map((evaluation) => (
                            <TableRow key={evaluation.recruiter.full_name} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{evaluation.recruiter.full_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {evaluation.score}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{evaluation.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <NotebookText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">No evaluations found</p>
                    <p className="text-sm text-muted-foreground mt-1">Evaluators will appear here once they submit marks</p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}

          {/* Applicant Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-0">
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
                        {new Date(selectedApplicant.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                {canShortlist && (
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
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedApplicant) {
                          const preferenceType =
                            getPreferenceType(selectedApplicant);
                          handleStatusUpdate(
                            selectedApplicant.id,
                            "pending",
                            preferenceType
                          );
                        }
                      }}
                      disabled={isUpdating}
                      className="border-gray-500 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-950/20"
                    >
                      Reset
                    </Button>

                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
