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
  isCurrentUserRecruiter,
  getPanelsForRecruiter,
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
  waitlistedCount: number;
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
    totalWaitlisted: 0,
    totalRejected: 0,
  });
  const [deadline, setDeadline] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || userRole !== "recruiter") {
          setIsLoading(false);
          return;
        }

        const isRecruiter = await isCurrentUserRecruiter();
        if (!isRecruiter) {
          setIsLoading(false);
          return;
        }

        const [recruiterDepts, settingsData] = await Promise.all([
          getRecruiterDepartments(),
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
          totalWaitlisted: 0,
          totalRejected: 0,
        };

        setPanels(await getPanelsForRecruiter(recruiterDepts[0].recruiter_id));
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
            overallStats.totalWaitlisted += stats.waitlistedCount;
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

    fetchData();
  }, [user, userRole]);

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
    let waitlistedCount = 0;
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
        case "waitlisted":
          waitlistedCount++;
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
      waitlistedCount,
      rejectedCount,
    };
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      dept.role === "recruiter"
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
            new Date(app.created_at).toLocaleDateString(),
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

  if (userRole !== "recruiter") {
    return (
      <div className="min-h-screen hackclub-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hackclub-bg page-transition">
      <div className="content-container py-8 sm:py-12">
        {/* Enhanced Header */}
        <div className="mb-12 text-center px-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Recruiter Dashboard
            </span>
          </div>

          <div className="flex justify-center mb-6">
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

          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-foreground">
            Recruitment <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage applications, review candidates, and track recruitment
            progress.
          </p>

          {deadline && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                Application Deadline: {deadline.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 px-4">
          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-black gradient-text">
                {totalStats.totalApplicants}
              </div>
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Total Applications
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-black gradient-text-accent">
                {totalStats.totalPending}
              </div>
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Pending Review
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-black text-green-600">
                {totalStats.totalShortlisted}
              </div>
              <div className="p-2 rounded-xl bg-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Shortlisted
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-black text-blue-600">
                {totalStats.totalWaitlisted}
              </div>
              <div className="p-2 rounded-xl bg-blue-500/20">
                <AlertTriangle className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Waitlisted
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-black text-red-600">
                {totalStats.totalRejected}
              </div>
              <div className="p-2 rounded-xl bg-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Rejected
            </p>
          </div>
        </div>

        <div className="px-4 space-y-8">
          {/* Departments Section */}
          <Card className="neo-card card-stack">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Department Overview
                  </CardTitle>
                  <CardDescription>
                    Applications and statistics for your assigned departments
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search departments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    onClick={exportAllApplications}
                    className="premium-button"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDepartments.map((dept) => (
                    <Link
                      key={dept.id}
                      href={`/dashboard/recruiter/${dept.id}`}
                    >
                      <Card className="neo-card transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                  {dept.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {dept.totalApplicants} applicants
                                </p>
                              </div>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3 text-sm">
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
          <Card className="neo-card card-stack">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Panel Overview
                  </CardTitle>
                  <CardDescription>Your assigned panels</CardDescription>
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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {panels.map((panel) => (
                    <Link
                      key={panel.id}
                      href={`/dashboard/recruiter/panel/${panel.id}`}
                    >
                      <Card className="neo-card transition-all duration-300 hover:scale-105 cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                  {panel.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground h-1"></p>
                              </div>
                            </div>
                            <BarChart3 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
