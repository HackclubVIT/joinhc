"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  User,
  ArrowRight,
  Bell,
  Zap,
  Award,
  Target,
  Video,
} from "lucide-react";
import {
  getApplicationForUser,
  getApplicationSettings,
  getDepartments,
  getMeetLinkByPanelId,
  getOverallApplicationStatus,
  getPreferenceSelectionInfo,
} from "@/lib/supabase/data-fetching";
import { createClient } from "@/lib/supabase/client";
import { HackClubLogo } from "@/components/hackclub-logo";

export default function ApplicantDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentNames, setDepartmentNames] = useState<{
    first: string;
    second: string;
  }>({ first: "", second: "" });
  const [meetLinks, setMeetLinks] = useState<{
    first: string | null;
    second: string | null;
  }>({ first: null, second: null });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const [applicationData, settingsData, departments] = await Promise.all([
          getApplicationForUser(),
          getApplicationSettings(),
          getDepartments(),
        ]);

        if (applicationData) {
          setApplication(applicationData);

          // Get department names from the joined data
          const firstDeptName =
            applicationData.first_dept?.name || "Unknown Department";
          const secondDeptName =
            applicationData.second_dept?.name || "Unknown Department";

          setDepartmentNames({
            first: firstDeptName,
            second: secondDeptName,
          });

          // get Meetlinks
          const [first, second] = await Promise.all([
            getMeetLinkByPanelId(applicationData.first_pref_panel_id),
            getMeetLinkByPanelId(applicationData.second_pref_panel_id),
          ]);

          setMeetLinks({ first, second });
        }

        if (settingsData?.deadline) {
          setDeadline(new Date(settingsData.deadline));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const today = new Date();
  const deadlinePassed = deadline ? today > deadline : false;
  const applicationSubmitted = !!application;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "shortlisted":
        return "bg-blue-500";
      case "waitlisted":
        return "bg-yello-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "shortlisted":
        return <CheckCircle className="h-4 w-4 text-white" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-white" />;
      case "pending":
        return <Clock className="h-4 w-4 text-white" />;
      default:
        return <AlertCircle className="h-4 w-4 text-white" />;
    }
  };

  const getStatusMessage = (application: any) => {
    const overallStatus = getOverallApplicationStatus(application);
    const selectedInfo = getPreferenceSelectionInfo(application);

    const bothAccepted =
      application.first_pref_status === "accepted" &&
      application.second_pref_status === "accepted";

    // Check if both preferences are shortlisted
    const bothShortlisted =
      application.first_pref_status === "shortlisted" &&
      application.second_pref_status === "shortlisted";

    let selectedDepartment = null;
    if (bothAccepted) {
      selectedDepartment = `both ${departmentNames.first} and ${departmentNames.second}`;
    } else if (bothShortlisted) {
      selectedDepartment = `both ${departmentNames.first} and ${departmentNames.second}`;
    } else if (selectedInfo.type === "first") {
      selectedDepartment = departmentNames.first;
    } else if (selectedInfo.type === "second") {
      selectedDepartment = departmentNames.second;
    }

    switch (overallStatus) {
      case "accepted":
        return {
          title: bothShortlisted
            ? "Congratulations! You've been accepted for both preferences! 🎉🎉"
            : "Congratulations! You've been accepted 🎉",
          description: selectedDepartment
            ? bothShortlisted
              ? `Amazing! You have been accepted for both of your preferences: ${departmentNames.first} and ${departmentNames.second}. You'll need to choose which department to join.`
              : `You have been accepted for ${selectedDepartment}.`
            : "You have been accepted!",
          color: "text-green-600 dark:text-green-400",
        };

      case "shortlisted":
        return {
          title: bothShortlisted
            ? "Congratulations! You've been shortlisted for both preferences! 🎉🎉"
            : "Congratulations! You've been shortlisted 🎉",
          description: selectedDepartment
            ? bothShortlisted
              ? `Amazing! You have been shortlisted for both of your preferences: ${departmentNames.first} and ${departmentNames.second}. You'll need to choose which department to join.`
              : `You have been shortlisted for ${selectedDepartment}.`
            : "You have been shortlisted!",
          color: "text-green-600 dark:text-green-400",
        };
      case "waitlisted":
        return {
          title: "You're on the waitlist",
          description:
            selectedDepartment && !bothShortlisted
              ? `You've been waitlisted for ${selectedDepartment}. We'll notify you if a spot becomes available.`
              : "You've been waitlisted. We'll notify you if a spot becomes available.",
          color: "text-blue-600 dark:text-blue-400",
        };
      case "rejected":
        return {
          title: "Application decision",
          description:
            "Thank you for your interest. Unfortunately, we cannot offer you a position at this time.",
          color: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          title: "Application under review",
          description:
            "Your application is being reviewed by our recruitment team. We'll update you soon!",
          color: "text-yellow-600 dark:text-yellow-400",
        };
    }
  };

  const statusInfo = application ? getStatusMessage(application) : null;
  const overallStatus = application
    ? getOverallApplicationStatus(application)
    : "pending";

  return (
    <div className="min-h-screen hackclub-bg page-transition">
      <div className="content-container py-8 sm:py-12">
        {/* Enhanced Hero Section */}
        <div className="mb-12 text-center px-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Welcome Back, Developer!
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
            Your <span className="gradient-text">Journey</span> Continues 🚀
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your progress, manage applications, and stay updated with your
            recruitment journey.
          </p>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="stats-card group">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-black gradient-text">
                  {applicationSubmitted ? "✓" : "○"}
                </div>
                <div
                  className={`p-2 rounded-xl ${
                    applicationSubmitted
                      ? "bg-green-500/20"
                      : "bg-yellow-500/20"
                  }`}
                >
                  {applicationSubmitted ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Application
              </p>
              <p className="text-xs text-muted-foreground">
                {applicationSubmitted ? "Submitted" : "Pending"}
              </p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-black gradient-text-accent">
                  {deadline
                    ? Math.max(
                        0,
                        Math.ceil(
                          (deadline.getTime() - today.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    : "—"}
                </div>
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Days Left
              </p>
              <p className="text-xs text-muted-foreground">Until deadline</p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-black gradient-text-secondary">
                  {applicationSubmitted ? "100%" : "0%"}
                </div>
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Progress
              </p>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-black gradient-text">
                  {overallStatus === "shortlisted" ||
                  overallStatus === "accepted"
                    ? "🎉"
                    : overallStatus === "pending"
                    ? "⏳"
                    : "📝"}
                </div>
                <div className="p-2 rounded-xl bg-orange-500/20">
                  <Target className="h-4 w-4 text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Status
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {overallStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 px-4">
          {/* Left Column - Primary Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Application Status Card */}
            <div className="neo-card overflow-hidden card-stack">
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Application Status
                    </h3>
                    <p className="text-muted-foreground">
                      Track your recruitment progress
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="loading-shimmer h-8 w-32 rounded"></div>
                    <div className="loading-shimmer h-4 w-48 rounded"></div>
                    <div className="loading-shimmer h-2 w-full rounded"></div>
                  </div>
                ) : applicationSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          overallStatus === "shortlisted" ||
                          overallStatus === "accepted"
                            ? "bg-green-500/20 border border-green-500/30"
                            : overallStatus === "waitlisted"
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : overallStatus === "rejected"
                            ? "bg-red-500/20 border border-red-500/30"
                            : "bg-yellow-500/20 border border-yellow-500/30"
                        }`}
                      >
                        {getStatusIcon(overallStatus)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={`px-3 py-1 rounded-full ${
                              overallStatus === "shortlisted" ||
                              overallStatus === "accepted"
                                ? "status-shortlisted"
                                : overallStatus === "waitlisted"
                                ? "status-waitlisted"
                                : overallStatus === "rejected"
                                ? "status-rejected"
                                : "status-pending"
                            }`}
                          >
                            {overallStatus.charAt(0).toUpperCase() +
                              overallStatus.slice(1)}
                          </Badge>
                          {overallStatus === "accepted" && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                              {application.first_pref_status === "accepted" &&
                              application.second_pref_status === "accepted"
                                ? "Both Departments!"
                                : getPreferenceSelectionInfo(application)
                                    .type === "first"
                                ? departmentNames.first
                                : departmentNames.second}
                            </Badge>
                          )}
                          {overallStatus === "shortlisted" && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                              {application.first_pref_status ===
                                "shortlisted" &&
                              application.second_pref_status === "shortlisted"
                                ? "Both Departments!"
                                : getPreferenceSelectionInfo(application)
                                    .type === "first"
                                ? departmentNames.first
                                : departmentNames.second}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted:{" "}
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Status Message */}
                    {statusInfo && (
                      <div
                        className={`neo-card p-4 ${
                          overallStatus === "shortlisted" ||
                          overallStatus === "accepted"
                            ? "bg-green-500/10 border-green-500/30"
                            : overallStatus === "waitlisted"
                            ? "bg-blue-500/10 border-blue-500/30"
                            : overallStatus === "rejected"
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        }`}
                      >
                        <h4 className={`font-bold ${statusInfo.color} mb-2`}>
                          {statusInfo.title}
                        </h4>
                        <p className={`text-sm ${statusInfo.color}`}>
                          {statusInfo.description}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          Application Progress
                        </span>
                        <span className="font-bold text-primary">
                          {overallStatus === "pending" ? "75%" : "100%"}
                        </span>
                      </div>
                      <div className="progress-modern">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                          style={{
                            width: overallStatus === "pending" ? "75%" : "100%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="neo-card p-6 bg-amber-500/10 border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-400" />
                      <div>
                        <p className="font-bold text-amber-300">
                          Application Pending
                        </p>
                        <p className="text-sm text-amber-400">
                          Complete your application to join HackClub
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-secondary/30 border-t border-border/50 p-6">
                {!applicationSubmitted && (
                  <Link href="/application" className="w-full">
                    <Button
                      className="w-full h-12 premium-button"
                      disabled={deadlinePassed}
                    >
                      {deadlinePassed
                        ? "Deadline Passed"
                        : "Submit Application"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {applicationSubmitted && !deadlinePassed && (
                  <Link href="/application" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-primary/30 hover:bg-primary/10"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Edit Application
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Enhanced Department Preferences */}
            <div className="neo-card card-stack">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Department Preferences
                    </CardTitle>
                    <CardDescription>
                      Your selected departments and their status
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 w-full animate-pulse rounded-lg bg-muted"></div>
                    <div className="h-20 w-full animate-pulse rounded-lg bg-muted"></div>
                  </div>
                ) : applicationSubmitted ? (
                  <div className="space-y-4">
                    {/* Department Preferences Card with individual status indicators */}
                    <div className="space-y-4">
                      <div
                        className={`p-6 rounded-xl border-l-4 ${
                          application.second_pref_status === "accepted"
                            ? "bg-green-500 bg-opacity-50"
                            : application.first_pref_status === "shortlisted"
                            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-500"
                            : application.first_pref_status === "waitlisted"
                            ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-500"
                            : application.first_pref_status === "rejected"
                            ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-500"
                            : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-primary">
                            First Preference
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white">1st</Badge>
                            {application.first_pref_status === "accepted" && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Accepted
                              </Badge>
                            )}
                            {application.first_pref_status ===
                              "shortlisted" && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Shortlisted
                              </Badge>
                            )}
                            {application.first_pref_status === "waitlisted" && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Waitlisted
                              </Badge>
                            )}
                            {application.first_pref_status === "rejected" && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-lg font-semibold">
                          {departmentNames.first}
                        </p>
                        {application.first_pref_status === "shortlisted" &&
                          meetLinks.first && (
                            <a
                              href={meetLinks.first}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 border-red-700 border-2"
                              >
                                <Video className="h-4 w-4" />
                                Join Meet
                              </Button>
                            </a>
                          )}
                        {application.first_pref_status === "shortlisted" &&
                          application.second_pref_status === "shortlisted" && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                              🎉 Congratulations! You're shortlisted for this
                              department!
                            </p>
                          )}
                      </div>

                      <div
                        className={`p-6 rounded-xl border-l-4 ${
                          application.second_pref_status === "accepted"
                            ? "bg-green-500 bg-opacity-50"
                            : application.second_pref_status === "shortlisted"
                            ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-500"
                            : application.second_pref_status === "waitlisted"
                            ? "bg-gradient-to-r from-blue-50 to blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-500"
                            : application.second_pref_status === "rejected"
                            ? "bg-gradient-to-r from-red-50 to red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-500"
                            : "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            Second Preference
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">2nd</Badge>
                            {application.second_pref_status === "accepted" && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Accepted
                              </Badge>
                            )}
                            {application.second_pref_status ===
                              "shortlisted" && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Shortlisted
                              </Badge>
                            )}
                            {application.second_pref_status ===
                              "waitlisted" && (
                              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Waitlisted
                              </Badge>
                            )}
                            {application.second_pref_status === "rejected" && (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-lg font-semibold">
                            {departmentNames.second}
                          </p>
                          {application.second_pref_status === "shortlisted" &&
                            meetLinks.second && (
                              <a
                                href={meetLinks.second}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-2 border-red-700 border-2"
                                >
                                  <Video className="h-4 w-4" />
                                  Join Meet
                                </Button>
                              </a>
                            )}
                        </div>
                        {application.first_pref_status === "shortlisted" &&
                          application.second_pref_status === "shortlisted" && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
                              🎉 Congratulations! You're shortlisted for this
                              department!
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground">
                      No preferences selected yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submit your application to set preferences
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>

          {/* Enhanced Right Column */}
          <div className="space-y-6">
            {/* Important Dates Card */}
            <div className="hackclub-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    Important Dates
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">
                        Application Deadline
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {deadline
                          ? deadline.toLocaleDateString()
                          : "Loading..."}
                      </p>
                    </div>
                    <Bell className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium">Results Announcement</p>
                      <p className="text-sm text-muted-foreground">TBA</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium">Orientation</p>
                      <p className="text-sm text-muted-foreground">TBA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Quick Actions Card */}
            <div className="hackclub-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Link href="/application" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-base border-2 hover:bg-primary/5"
                  >
                    <FileText className="mr-3 h-5 w-5" />
                    {applicationSubmitted
                      ? "View Application"
                      : "Start Application"}
                  </Button>
                </Link>

                <Link href="/profile" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 text-base border-2 hover:bg-primary/5"
                  >
                    <User className="mr-3 h-5 w-5" />
                    Update Profile
                  </Button>
                </Link>
              </CardContent>
            </div>

            {/* Progress Tracker */}
            <div className="hackclub-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-primary">
                  Application Journey
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        applicationSubmitted
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      } flex items-center justify-center`}
                    >
                      {applicationSubmitted && (
                        <div className="h-2 w-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        applicationSubmitted
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      Application Submitted
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <span className="text-sm text-gray-500">Under Review</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    <span className="text-sm text-gray-500">
                      Final Decision
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
