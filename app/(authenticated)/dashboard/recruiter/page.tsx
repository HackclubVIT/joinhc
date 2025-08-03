"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  getRecruiterDepartments,
  getAllApplicationsForExport,
  getDepartmentApplicants,
  getDepartmentNameById,
  getApplicationSettings,
  isCurrentUserRecruiterOrEvaluator,
  getPanelsForUser,
  getApplicationDeadline,
  getShortlistDeadline,
} from "@/lib/supabase/data-fetching";
import { useAuth } from "@/contexts/auth-context";
import { HackClubLogo } from "@/components/hackclub-logo";

type DepartmentStats = {
  id: string;
  name: string;
  totalApplicants: number;
  firstPrefCount: number;
  secondPrefCount: number;
  pendingCount: number;
  shortlistedCount: number;
  rejectedCount: number;
  role: "recruiter" | "evaluator";
  panel_id?: string;
};

type PanelStats = {
  id: string;
  name: string;
};

export default function RecruiterDashboard() {
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [panels, setPanels] = useState<PanelStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalStats, setTotalStats] = useState({
    totalApplicants: 0,
    totalPending: 0,
    totalShortlisted: 0,
    totalRejected: 0,
  });
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [shortlistDeadline, setShortlistDeadline] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const hasRole = await isCurrentUserRecruiterOrEvaluator();
        if (!hasRole) {
          setIsLoading(false);
          return;
        }

        const [recruiterDepts, settingsData] = await Promise.all([
          getRecruiterDepartments(user.id),
          getApplicationSettings(),
        ]);

        if (settingsData?.deadline) {
          setDeadline(new Date(settingsData.deadline));
        }

        const departmentStats: DepartmentStats[] = [];
        let overallStats = {
          totalApplicants: 0,
          totalPending: 0,
          totalShortlisted: 0,
          totalRejected: 0,
        };

        setPanels(await getPanelsForUser(user.id));
        for (const dept of recruiterDepts) {
          if (dept.department_id) {
            const [applicants, deptName] = await Promise.all([
              getDepartmentApplicants(dept.department_id),
              getDepartmentNameById(dept.department_id),
            ]);

            const stats = calculateDepartmentStats(
              applicants,
              dept.department_id
            );
            const departmentStat: DepartmentStats = {
              id: dept.department_id,
              name: deptName || dept.department?.name || "Unknown Department",
              role: dept.role,
              ...stats,
            };

            departmentStats.push(departmentStat);

            overallStats.totalApplicants += stats.totalApplicants;
            overallStats.totalPending += stats.pendingCount;
            overallStats.totalShortlisted += stats.shortlistedCount;
            overallStats.totalRejected += stats.rejectedCount;
          }
        }

        setDepartments(departmentStats);
        setTotalStats(overallStats);
      } catch (err) {
        console.error("Error fetching recruiter dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDeadlines = async () => {
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
    };

    fetchData();
    fetchDeadlines();
  }, [user, userRole]);

  const now = new Date();
  const canPanel = shortlistDeadline && now > shortlistDeadline;

  const calculateDepartmentStats = (
    applicants: any[],
    departmentId: string
  ) => {
    const totalApplicants = applicants.length;
    const firstPrefCount = applicants.filter(
      (app) => app.first_pref_dept_id === departmentId
    ).length;
    const secondPrefCount = applicants.filter(
      (app) => app.second_pref_dept_id === departmentId
    ).length;

    let pendingCount = 0;
    let shortlistedCount = 0;
    let rejectedCount = 0;

    applicants.forEach((app) => {
      const isFirstPref = app.first_pref_dept_id === departmentId;
      const isSecondPref = app.second_pref_dept_id === departmentId;

      let status = "pending";
      if (isFirstPref) {
        status = app.first_pref_status || "pending";
      } else if (isSecondPref) {
        status = app.second_pref_status || "pending";
      }

      switch (status) {
        case "shortlisted":
          shortlistedCount++;
          break;
        case "rejected":
          rejectedCount++;
          break;
        default:
          pendingCount++;
      }
    });

    return {
      totalApplicants,
      firstPrefCount,
      secondPrefCount,
      pendingCount,
      shortlistedCount,
      rejectedCount,
    };
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportAllApplications = async () => {
    try {
      const applications = await getAllApplicationsForExport();

      const headers = [
        "Name",
        "Email",
        "Register Number",
        "First Preference",
        "Second Preference",
        "First Pref Status",
        "Second Pref Status",
        "Submitted At",
      ];

      const csvContent = [
        headers.join(","),
        ...applications.map((app) =>
          [
            app.name || "",
            app.email || "",
            app.register_no || "",
            app.dept_first_pref || "",
            app.dept_second_pref || "",
            app.first_pref_status || "pending",
            app.second_pref_status || "pending",
            new Date(app.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all_applications_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting applications:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen hackclub-bg">
        <div className="content-container py-8">
          <div className="space-y-6 px-4">
            <div className="loading-shimmer h-8 w-64 rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="loading-shimmer h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4 sm:mb-6">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Recruitment Dashboard
            </span>
          </div>

          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative floating-element">
              <div className="absolute inset-0 blur-2xl opacity-30">
                <HackClubLogo size="lg" showText={false} />
              </div>
              <HackClubLogo
                size="lg"
                showText={false}
                className="relative z-10"
              />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-foreground">
            Recruitment <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Manage applications, review candidates, and track recruitment progress.
            <br />
            <span className="text-xs sm:text-sm text-muted-foreground/80">
              Access for Recruiters and Evaluators
            </span>
          </p>

          {deadline && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-medium text-amber-300">
                Application Deadline: {deadline.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            </div>
          )}
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          <div className="stats-card min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl sm:text-2xl font-black gradient-text">
                {totalStats.totalApplicants}
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
              Total Applications
            </p>
          </div>

          <div className="stats-card min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl sm:text-2xl font-black gradient-text-accent">
                {totalStats.totalPending}
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-yellow-500/20">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
              Pending Review
            </p>
          </div>

          <div className="stats-card min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl sm:text-2xl font-black text-green-600">
                {totalStats.totalShortlisted}
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-green-500/20">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
              Shortlisted
            </p>
          </div>



          <div className="stats-card min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl sm:text-2xl font-black text-red-600">
                {totalStats.totalRejected}
              </div>
              <div className="p-1.5 sm:p-2 rounded-xl bg-red-500/20">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
              Rejected
            </p>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Departments Section */}
          <Card className=" card-stack">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Department Overview
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Applications and statistics for your assigned departments
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search departments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  {/* <Button
                    onClick={exportAllApplications}
                    className="premium-button"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button> */}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filteredDepartments.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No departments found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No departments match your search."
                      : "You haven't been assigned to any departments yet."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDepartments.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/dashboard/recruiter/${dept.id}`}
                    >
                      <Card className=" transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors truncate">
                                  {dept.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                  {dept.totalApplicants} applicants
                                </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      dept.role === 'recruiter' 
                                        ? 'bg-green-100 text-green-800 border-green-200' 
                                        : 'bg-orange-100 text-orange-800 border-orange-200'
                                    }`}
                                  >
                                    {dept.role}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                              <span className="text-muted-foreground">
                                1st Choice
                              </span>
                              <span className="font-bold text-primary">
                                {dept.firstPrefCount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                              <span className="text-muted-foreground">
                                2nd Choice
                              </span>
                              <span className="font-bold">
                                {dept.secondPrefCount}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-center p-2 rounded bg-yellow-500/10">
                              <div className="font-bold text-yellow-600">
                                {dept.pendingCount}
                              </div>
                              <div className="text-muted-foreground">
                                Pending
                              </div>
                            </div>
                            <div className="text-center p-2 rounded bg-green-500/10">
                              <div className="font-bold text-green-600">
                                {dept.shortlistedCount}
                              </div>
                              <div className="text-muted-foreground">
                                Shortlisted
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panels Section */}
          {canPanel && (
          <Card className=" card-stack">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Panel Overview
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">Your assigned panels</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {panels.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Panels found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No panels match your search."
                      : "You haven't been assigned to any panels yet."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {panels.map((panel) => (
                    <Link
                      key={panel.id}
                      href={`/dashboard/recruiter/panel/${panel.id}`}
                        className="block"
                    >
                        <Card className="transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors truncate">
                                  {panel.name}
                                </CardTitle>
                                <p className="text-xs sm:text-sm text-muted-foreground h-1"></p>
                              </div>
                            </div>
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
