"use client";

import { useEffect, useState, useMemo } from "react";
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
  BarChart3,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  getAllApplicationsForExport,
  isCurrentUserRecruiterOrEvaluator,
  getAllDeadlines,
  getRecruiterDashboardDataOptimized,
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
  acceptedCount: number;
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
    totalAccepted: 0,
  });
  const [applicationDeadline, setApplicationDeadline] = useState<Date | null>(null);
  const [shortlistDeadline, setShortlistDeadline] = useState<Date | null>(null);
  const [deadlinesLoaded, setDeadlinesLoaded] = useState(false);

  useEffect(() => {
    const fetchDeadlines = async () => {
      
      try {
        const { applicationDeadline, shortlistDeadline } = await getAllDeadlines();
        
        setApplicationDeadline(applicationDeadline?.deadline ? new Date(applicationDeadline.deadline) : null);
        setShortlistDeadline(shortlistDeadline?.deadline ? new Date(shortlistDeadline.deadline) : null);
        
        
      } catch (err) {
        console.error('❌ Error fetching deadlines:', err);
        setApplicationDeadline(null);
        setShortlistDeadline(null);
      } finally {
        setDeadlinesLoaded(true);
      }
    };

    
    if (user && !deadlinesLoaded) {
      fetchDeadlines();
    }
  }, [user]); 

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        if (!user || !deadlinesLoaded) {
          setIsLoading(false);
          return;
        }

        const hasRole = await isCurrentUserRecruiterOrEvaluator();
        if (!hasRole) {
          setIsLoading(false);
          return;
        }

        
        const appDeadlineObj = applicationDeadline ? { deadline: applicationDeadline.toISOString() } : null;
        const shortlistDeadlineObj = shortlistDeadline ? { deadline: shortlistDeadline.toISOString() } : null;
        
        const { departments: departmentStats, panels: userPanels } = await getRecruiterDashboardDataOptimized(
          user.id,
          appDeadlineObj,
          shortlistDeadlineObj
        );

        
        let overallStats = {
          totalApplicants: 0,
          totalPending: 0,
          totalShortlisted: 0,
          totalRejected: 0,
          totalAccepted: 0,
        };

        departmentStats.forEach(stats => {
          overallStats.totalApplicants += stats.totalApplicants;
          overallStats.totalPending += stats.pendingCount;
          overallStats.totalShortlisted += stats.shortlistedCount;
          overallStats.totalRejected += stats.rejectedCount;
          overallStats.totalAccepted += stats.acceptedCount;
        });

        setDepartments(departmentStats);
        setPanels(userPanels);
        setTotalStats(overallStats);
        
      } catch (err) {
        console.error("❌ Error fetching recruiter dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    
    if (deadlinesLoaded) {
      fetchData();
    }
  }, [user, userRole, deadlinesLoaded, applicationDeadline, shortlistDeadline]);

  const now = new Date();
  const canPanel = shortlistDeadline && now > shortlistDeadline;

  
  const isBeforeShortlistDeadline = () => {
    return shortlistDeadline && now < shortlistDeadline;
  };

  const isAfterShortlistDeadline = () => {
    return shortlistDeadline && now >= shortlistDeadline;
  };

  const getPhaseAppropriateStats = () => {
    if (isBeforeShortlistDeadline()) {
      
      return [
        {
          value: totalStats.totalApplicants,
          label: "Total Applications Received",
          icon: Users,
          color: "blue",
        },
        {
          value: totalStats.totalPending,
          label: "Pending Review",
          icon: Clock,
          color: "yellow",
        },
        {
          value: totalStats.totalShortlisted,
          label: "Shortlisted",
          icon: CheckCircle,
          color: "green",
        },
      ];
    } else {
      
      return [
        {
          value: totalStats.totalApplicants,
          label: "Total Applications Received",
          icon: Users,
          color: "blue",
        },
        {
          value: totalStats.totalShortlisted,
          label: "Total Shortlisted",
          icon: CheckCircle,
          color: "green",
        },
        {
          value: totalStats.totalAccepted,
          label: "Accepted Applications",
          icon: UserCheck,
          color: "emerald",
        },
      ];
    }
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
              Welcome Recruiters !
            </span>
          </div>

          {/* Recruitment Phase Indicator */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50">
              {isBeforeShortlistDeadline() ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-400">
                    Application Review Phase
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">
                    Interview & Selection Phase
                  </span>
                </>
              )}
            </div>
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
            Tech. <span className="gradient-text">Meets.</span> Innovation
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            {isBeforeShortlistDeadline() 
              ? "Review applications, shortlist candidates, and prepare for the interview phase."
              : "Conduct interviews, finalize selections, and manage the recruitment process."
            }
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {getPhaseAppropriateStats().map((stat, index) => {
            const IconComponent = stat.icon;
            const getColorClasses = (color: string) => {
              switch (color) {
                case "blue":
                  return {
                    text: "gradient-text",
                    bg: "bg-blue-500/20",
                    icon: "text-blue-400",
                  };
                case "yellow":
                  return {
                    text: "gradient-text-accent",
                    bg: "bg-yellow-500/20",
                    icon: "text-yellow-400",
                  };
                case "green":
                  return {
                    text: "text-green-600",
                    bg: "bg-green-500/20",
                    icon: "text-green-400",
                  };
                case "emerald":
                  return {
                    text: "text-emerald-600",
                    bg: "bg-emerald-500/20",
                    icon: "text-emerald-400",
                  };
                case "red":
                  return {
                    text: "text-red-600",
                    bg: "bg-red-500/20",
                    icon: "text-red-400",
                  };
                default:
                  return {
                    text: "gradient-text",
                    bg: "bg-gray-500/20",
                    icon: "text-gray-400",
                  };
              }
            };
            
            const colors = getColorClasses(stat.color);
            
            return (
              <div key={index} className="stats-card min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className={`text-xl sm:text-2xl font-black ${colors.text}`}>
                    {stat.value}
                  </div>
                  <div className={`p-1.5 sm:p-2 rounded-xl ${colors.bg}`}>
                    <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.icon}`} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">
                  {stat.label}
                </p>
              </div>
            );
          })}
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
