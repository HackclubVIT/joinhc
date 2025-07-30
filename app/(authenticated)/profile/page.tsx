"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  Mail,
  Hash,
  Calendar,
  Building,
  Shield,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  Divide,
} from "lucide-react";
import {
  getProfile,
  getApplicationForUser,
  getRecruiterDepartments,
  getDepartments,
  getOverallApplicationStatus,
  getPreferenceSelectionInfo,
} from "@/lib/supabase/data-fetching";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function ProfilePage() {
  const { userRole, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);

        if (userRole === "applicant") {
          const applicationData = await getApplicationForUser();

          if (applicationData) {
            const depts = await getDepartments();
            const firstDept = depts.find(
              (d) => d.id === applicationData.first_pref_dept_id,
            );
            const secondDept = depts.find(
              (d) => d.id === applicationData.second_pref_dept_id,
            );

            setApplication({
              ...applicationData,
              firstPrefDept: firstDept?.name || "Unknown",
              secondPrefDept: secondDept?.name || "Unknown",
            });
          }
        } else if (userRole === "recruiter" && user?.id) {
          const recruiterDepts = await getRecruiterDepartments(user.id);
          setDepartments(
            recruiterDepts.map((rd) => rd.department?.name || "Unknown"),
          );
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, userRole]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "waitlisted":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <div className="h-8 w-32 animate-pulse rounded bg-muted mx-auto mb-4"></div>
              <div className="h-4 w-64 animate-pulse rounded bg-muted mx-auto"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hackclub-card">
                <CardHeader>
                  <div className="h-6 w-24 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 md:mb-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <HackClubLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">
              {profile?.full_name || user?.email?.split("@")[0] || "User Profile"}{" "}
              👤
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Badge
                variant={userRole === "recruiter" ? "default" : "secondary"}
                className="px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium"
              >
                <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {userRole
                  ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                  : "User"}
              </Badge>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })
                  : "N/A"}
              </span>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 px-2">
              {userRole === "recruiter"
                ? "Manage recruitment processes and review applications for assigned departments"
                : "Track your application status and manage your recruitment journey"}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {userRole === "recruiter" ? (
              <>
                {/* Recruiter Personal Information */}
                <Card className="hackclub-card !p-0 overflow-hidden">
                  <div className=" bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Your account and contact details
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Full Name
                          </p>
                          <p className="font-semibold text-foreground">
                            {profile?.full_name || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Email Address
                          </p>
                          <p className="font-semibold text-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Account Created
                          </p>
                          <p className="font-semibold text-foreground">
                            {user?.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  timeZone: "Asia/Kolkata",
                                },
                              )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Department Assignments */}
                <Card className="hackclub-card !p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/20 dark:to-purple-950/20 p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-blue-100/80 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Department Assignments
                        </CardTitle>
                        <CardDescription>
                          Departments you manage recruitment for
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {departments.length > 0 ? (
                      <div className="space-y-4">
                        {departments.map((dept, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg border border-border bg-gradient-to-r from-secondary/30 to-secondary/10 hover:from-secondary/50 hover:to-secondary/20 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                              <span className="font-medium text-foreground">
                                {dept}
                              </span>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
                              Active
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          No departments assigned yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Contact admin for department assignments
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : userRole === "applicant" ? (
              <>
                {/* Applicant Personal Information */}
                <Card className="hackclub-card !p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Your account and personal details
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Full Name
                          </p>
                          <p className="font-semibold text-foreground">
                            {profile?.full_name || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Email Address
                          </p>
                          <p className="font-semibold text-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Register Number
                          </p>
                          <p className="font-semibold text-foreground">
                            {profile?.register_no || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Summary */}
                <Card className="hackclub-card !p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-950/20 dark:to-blue-950/20 p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-green-100/80 dark:bg-green-900/50 border border-green-200 dark:border-green-800">
                        <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Application Summary
                        </CardTitle>
                        <CardDescription>
                          Your recruitment application details
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {application ? (
                      <div className="space-y-6">
                        {/* Overall Status */}
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Overall Application Status
                              </p>
                              {getStatusIcon(
                                getOverallApplicationStatus(application),
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-base font-medium px-3 py-1"
                            >
                              {getOverallApplicationStatus(application)
                                .charAt(0)
                                .toUpperCase() +
                                getOverallApplicationStatus(application).slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Individual Preference Status */}
                        <div className="space-y-4">
                          <div
                            className={`p-4 rounded-lg border ${application.first_pref_status === "shortlisted"
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : application.first_pref_status === "waitlisted"
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                : application.first_pref_status === "rejected"
                                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                  : "bg-primary/5 border-primary/20"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-primary">
                                First Preference
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary text-white">
                                  1st
                                </Badge>
                                {application.first_pref_status ===
                                  "shortlisted" && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      ✓ Selected
                                    </Badge>
                                  )}
                                {application.first_pref_status ===
                                  "waitlisted" && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      Waitlisted
                                    </Badge>
                                  )}
                                {application.first_pref_status === "rejected" && (
                                  <Badge variant="destructive">Rejected</Badge>
                                )}
                              </div>
                            </div>
                            <p className="font-semibold text-foreground">
                              {application.firstPrefDept}
                            </p>
                          </div>

                          <div
                            className={`p-4 rounded-lg border ${application.second_pref_status === "shortlisted"
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : application.second_pref_status === "waitlisted"
                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                : application.second_pref_status === "rejected"
                                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                  : "bg-secondary/50 border-border"
                              }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Second Preference
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">2nd</Badge>
                                {application.second_pref_status ===
                                  "shortlisted" && (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                      ✓ Selected
                                    </Badge>
                                  )}
                                {application.second_pref_status ===
                                  "waitlisted" && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                      Waitlisted
                                    </Badge>
                                  )}
                                {application.second_pref_status ===
                                  "rejected" && (
                                    <Badge variant="destructive">Rejected</Badge>
                                  )}
                              </div>
                            </div>
                            <p className="font-semibold text-foreground">
                              {application.secondPrefDept}
                            </p>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Submitted On
                            </p>
                            <p className="font-semibold text-foreground">
                              {new Date(
                                application.created_at,
                              ).toLocaleDateString("en-IN", {
                                timeZone: "Asia/Kolkata",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
                          <Building className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          No application submitted yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Submit your application to see details here
                        </p>
                        <Button className="hackclub-button" asChild>
                          <a href="/application">Submit Application</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="hackclub-card overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold">
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Your account and contact details
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Full Name
                          </p>
                          <p className="font-semibold text-foreground">
                            {profile?.full_name || "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Email Address
                          </p>
                          <p className="font-semibold text-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            Account Created
                          </p>
                          <p className="font-semibold text-foreground">
                            {user?.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  timeZone: "Asia/Kolkata",
                                },
                              )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
