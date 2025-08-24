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
  XCircle,
  Sparkles
} from "lucide-react";
import {
  getApplicationForUser,
  getApplicationSettings,
  getDepartments,
  getMeetLinkByPanelId,
  getOverallApplicationStatus,
  getPreferenceSelectionInfo,
  getApplicationDeadline,
  getShortlistDeadline,
  getAvailableTimeSlotsForPanel,
  getApplicantTimeSlot,
  bookApplicantTimeSlot,
  cancelApplicantTimeSlot,
  getPanelByDepartment,
  isApplicantAssignedToPanel,
  isApplicantEvaluated,
  getResultsPublicationDeadline,
} from "@/lib/supabase/data-fetching";
import { createClient } from "@/lib/supabase/client";
import { HackClubLogo } from "@/components/hackclub-logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function ApplicantDashboard() {
  const [application, setApplication] = useState<any>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [shortlistDeadline, setShortlistDeadline] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentNames, setDepartmentNames] = useState<{
    first: string;
    second: string;
  }>({ first: "", second: "" });
  const [meetLinks, setMeetLinks] = useState<{
    first: string | null;
    second: string | null;
  }>({ first: null, second: null });

  type Pref = 'first' | 'second';
  type SlotState = { slots: any[]; booking: any; panel: any; meetLink: string | null };
  const [slotData, setSlotData] = useState<Record<Pref, SlotState>>({
    first: { slots: [], booking: null, panel: null, meetLink: null },
    second: { slots: [], booking: null, panel: null, meetLink: null },
  });
  const [slotLoading, setSlotLoading] = useState<Record<Pref, boolean>>({ first: false, second: false });
  const [slotError, setSlotError] = useState<Record<Pref, string | null>>({ first: null, second: null });
  const [showMeetDialog, setShowMeetDialog] = useState(false);
  const [meetDialogMsg, setMeetDialogMsg] = useState("");
  
  const [openSlotModal, setOpenSlotModal] = useState<Pref | null>(null);
  const [panelAssignments, setPanelAssignments] = useState<Record<Pref, boolean>>({ first: false, second: false });
  const [evaluationStatus, setEvaluationStatus] = useState<Record<Pref, boolean>>({ first: false, second: false });
  const [resultsPublicationDeadline, setResultsPublicationDeadline] = useState<Date | null>(null);

  const supabase = createClient();

  const toIST = (date: string | Date) => {
    return new Date(
      new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
  };
  const fetchSlotData = async (pref: Pref) => {
    setSlotLoading((l) => ({ ...l, [pref]: true }));
    setSlotError((e) => ({ ...e, [pref]: null }));
    try {
      const app = await getApplicationForUser();
      const panelId =
        pref === "first"
          ? app.first_pref_panel_id
          : app.second_pref_panel_id;
      const status =
        pref === "first"
          ? app.first_pref_status
          : app.second_pref_status;
      
      
      const isAssigned = await isApplicantAssignedToPanel(app.applicant_id, pref);
      setPanelAssignments(prev => ({ ...prev, [pref]: isAssigned }));
      
      
      const departmentId = pref === "first" ? app.first_pref_dept_id : app.second_pref_dept_id;
      const isEvaluated = await isApplicantEvaluated(app.id, departmentId);
      setEvaluationStatus(prev => ({ ...prev, [pref]: isEvaluated }));
      
      if (!panelId || status !== "shortlisted" || !isAssigned) {
        setSlotData((d) => ({ ...d, [pref]: { slots: [], booking: null, panel: null, meetLink: null } }));
        setSlotLoading((l) => ({ ...l, [pref]: false }));
        return;
      }
      const slots = await getAvailableTimeSlotsForPanel(panelId);
      const booking = await getApplicantTimeSlot(app.applicant_id, panelId);
      const panelArr = await getPanelByDepartment(app[`${pref}_pref_dept_id`]);
      const panel = panelArr.find((p) => p.id === panelId);
      setSlotData((d) => ({
        ...d,
        [pref]: {
          slots,
          booking,
          panel,
          meetLink: panel?.meet_link || null,
        },
      }));
    } catch (e) {
      setSlotError((err) => ({ ...err, [pref]: "Failed to load slots" }));
    } finally {
      setSlotLoading((l) => ({ ...l, [pref]: false }));
    }
  };
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

        const [applicationData, applicationDeadline, shortlistDeadlineData, resultsPublicationDeadlineData, departments] = await Promise.all([
          getApplicationForUser(),
          getApplicationDeadline(),
          getShortlistDeadline(),
          getResultsPublicationDeadline(),
          getDepartments(),
        ]);

        if (applicationData) {
          setApplication(applicationData);

          
          const firstDeptName =
            applicationData.first_dept?.name || "Unknown Department";
          const secondDeptName =
            applicationData.second_dept?.name || "Unknown Department";

          setDepartmentNames({
            first: firstDeptName,
            second: secondDeptName,
          });

          
          const [first, second] = await Promise.all([
            getMeetLinkByPanelId(applicationData.first_pref_panel_id),
            getMeetLinkByPanelId(applicationData.second_pref_panel_id),
          ]);

          setMeetLinks({ first, second });
        }

        if (applicationDeadline?.deadline) {
          setDeadline(new Date(applicationDeadline.deadline));
        }
        
        if (shortlistDeadlineData?.deadline) {
          setShortlistDeadline(new Date(shortlistDeadlineData.deadline));
        }
        
        if (resultsPublicationDeadlineData) {
          setResultsPublicationDeadline(resultsPublicationDeadlineData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    fetchSlotData('first');
    fetchSlotData('second');
  }, []);

  const today = new Date();
  const deadlinePassed = deadline ? today > deadline : false;
  const applicationSubmitted = !!application;
  
  
  const displayDeadline = deadlinePassed && shortlistDeadline ? shortlistDeadline : deadline;
  const displayDeadlinePassed = displayDeadline ? today > displayDeadline : false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "shortlisted":
        return "bg-blue-500";

      case "rejected":
        return "bg-red-500";
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

      case "not_selected":
        return {
          title: "Application decision",
          description:
            "Thank you for your interest. Unfortunately, we cannot offer you a position at this time.",
          color: "text-red-600 dark:text-red-400",
        };
      case "rejected":
        return {
          title: "Final decision",
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

  const canShowMeetLink = (slot: any) => {
    if (!slot) return false;
    const now = toIST(new Date());
    const start = toIST(slot.start_time);
    const end = toIST(slot.end_time);
    return now >= new Date(start.getTime() - 10 * 60 * 1000) && now <= end;
  };
  const formatIST = (date: string | Date | null | undefined) => {
    if (!date) return "—";
    const d = toIST(date);
    if (isNaN(d.getTime())) return "—";
    return format(d, "yyyy-MM-dd HH:mm");
  };

  const shouldShowResults = () => {
    if (!resultsPublicationDeadline) return false;
    const now = new Date();
    return now >= resultsPublicationDeadline;
  };

  const getStatusBadge = (status: string, preference: 'first' | 'second') => {
    const statusKey = preference === 'first' ? 'first_pref_status' : 'second_pref_status';
    const currentStatus = application[statusKey];
    
    
    if (shouldShowResults()) {
      switch (currentStatus) {
        case 'accepted':
          return (
            <Badge className="bg-green-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepted
            </Badge>
          );
        case 'rejected':
          return (
            <Badge className="bg-red-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <XCircle className="h-3 w-3 mr-1" />
              Not Selected
            </Badge>
          );
        case 'shortlisted':
          return (
            <Badge className="bg-green-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Shortlisted
            </Badge>
          );
        case 'not_selected':
          return (
            <Badge className="bg-red-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          );
        case 'pending':
          return (
            <Badge className="bg-yellow-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          );
        default:
          return (
            <Badge className="bg-gray-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          );
      }
    } else {
      
      switch (currentStatus) {
        case 'shortlisted':
          return (
            <Badge className="bg-green-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Shortlisted
            </Badge>
          );
        case 'not_selected':
          return (
            <Badge className="bg-red-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <XCircle className="h-3 w-3 mr-1" />
              Rejected
            </Badge>
          );
        case 'pending':
          return (
            <Badge className="bg-yellow-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          );
        case 'accepted':
        case 'rejected':
          
          return (
            <Badge className="bg-green-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Shortlisted
            </Badge>
          );
        default:
          return (
            <Badge className="bg-gray-500/90 text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          );
      }
    }
  };

  return (
    <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Enhanced Hero Section */}
        <div className="mb-6 sm:mb-8 md:mb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4 sm:mb-6">
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">
              Welcome Back !
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
            Tech. <span className="gradient-text">Meets.</span> Innovaton
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            Onboarding to HackClub VITC begins here.
          </p>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            <div className="stats-card group">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl sm:text-2xl font-black gradient-text">
                  {applicationSubmitted ? "✓" : "❌"}
                </div>
                <div
                  className={`p-1.5 sm:p-2 rounded-xl ${
                    applicationSubmitted
                      ? "bg-green-500/20"
                      : "bg-yellow-500/20"
                  }`}
                >
                  {applicationSubmitted ? (
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                  ) : (
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Application
              </p>
              <p className="text-xs text-muted-foreground">
                {applicationSubmitted ? "Submitted" : "Pending"}
              </p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl sm:text-2xl font-black gradient-text-accent">
                  {displayDeadline
                    ? Math.max(
                        0,
                        Math.ceil(
                          (displayDeadline.getTime() - today.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                    : "—"}
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Days Left
              </p>
              <p className="text-xs text-muted-foreground">
                {deadlinePassed && shortlistDeadline ? "Until shortlist deadline" : "Until deadline"}
              </p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl sm:text-2xl font-black">
                  {overallStatus === "shortlisted" || overallStatus === "accepted" 
                    ? "🌟" 
                    : overallStatus === "rejected" 
                    ? "✖️" 
                    : applicationSubmitted 
                    ? "📝" 
                    : "⏳"}
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-blue-500/20">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Round Status
              </p>
              <p className="text-xs text-muted-foreground">
                {overallStatus === "shortlisted" 
                  ? "Interview Round" 
                  : overallStatus === "accepted"
                  ? "Selection Complete"
                  : overallStatus === "rejected"
                  ? "Better luck next time"
                  : applicationSubmitted
                  ? "Application Review"
                  : "Not Started"}
              </p>
            </div>

            <div className="stats-card">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl sm:text-2xl font-black">
                  {overallStatus === "shortlisted" ||
                  overallStatus === "accepted"
                    ? "🎉"
                    : overallStatus === "pending"
                    ? "⏳"
                    : "📝"}
                </div>
                <div className="p-1.5 sm:p-2 rounded-xl bg-orange-500/20">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Status
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {overallStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 px-4">
          {/* Left Column - Primary Cards */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Enhanced Application Status Card */}
            <div className="neo-card overflow-hidden !p-0 card-stack">
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 sm:p-6 border-b border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">
                      Application Status
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Track your recruitment progress
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 self-start sm:self-auto">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="loading-shimmer h-8 w-32 rounded"></div>
                    <div className="loading-shimmer h-4 w-48 rounded"></div>
                    <div className="loading-shimmer h-2 w-full rounded"></div>
                  </div>
                ) : applicationSubmitted ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl self-start ${
                          overallStatus === "shortlisted" ||
                          overallStatus === "accepted"
                            ? "bg-green-500/20 border border-green-500/30"

                            : overallStatus === "rejected"
                            ? "bg-red-500/20 border border-red-500/30"
                            : "bg-yellow-500/20 border border-yellow-500/30"
                        }`}
                      >
                        {getStatusIcon(overallStatus)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <Badge
                            className={`px-3 py-1 rounded-full ${
                              overallStatus === "shortlisted" ||
                              overallStatus === "accepted"
                                ? "status-shortlisted"

                                : overallStatus === "rejected"
                                ? "status-rejected"
                                : "status-pending"
                            }`}
                          >
                            {overallStatus.charAt(0).toUpperCase() +
                              overallStatus.slice(1)}
                          </Badge>
                          {overallStatus === "accepted" && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs sm:text-sm">
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
                          ).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
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
                      disabled={displayDeadlinePassed}
                    >
                      {displayDeadlinePassed
                        ? "Deadline Passed"
                        : "Start Application"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {applicationSubmitted && !displayDeadlinePassed && (
                  <Link href="/application" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full h-10 sm:h-12 border-2 border-primary/30 hover:bg-primary/10 text-sm sm:text-base"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">
                      Department Preferences
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Your selected departments and their status
                    </CardDescription>
                  </div>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 self-start sm:self-auto">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
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
                    {/* Enhanced Department Preferences Cards */}
                    <div className="space-y-6">
                      {/* First Preference Card */}
                      <div
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          application.first_pref_status === "accepted"
                            ? "bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/50 shadow-green-500/10"
                            : application.first_pref_status === "rejected"
                            ? "bg-gradient-to-br from-red-900/40 to-rose-900/20 border-red-500/50 shadow-red-500/10"
                            : application.first_pref_status === "shortlisted"
                            ? "bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border-blue-500/50 shadow-blue-500/10"
                            : application.first_pref_status === "waitlisted"
                            ? "bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border-yellow-500/50 shadow-yellow-500/10"
                            : "bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-500/50 shadow-gray-500/10"
                        }`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
                        
                        <div className="relative p-6">
                          {/* Header Section */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                application.first_pref_status === "accepted"
                                  ? "bg-green-500/20 text-green-400"
                                  : application.first_pref_status === "rejected"
                                  ? "bg-red-500/20 text-red-400"
                                  : application.first_pref_status === "shortlisted"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : application.first_pref_status === "waitlisted"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}>
                                <Target className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`text-sm font-semibold tracking-wide uppercase ${
                                  application.first_pref_status === "accepted"
                                    ? "text-green-400"
                                    : application.first_pref_status === "rejected"
                                    ? "text-red-400"
                                    : application.first_pref_status === "shortlisted"
                                    ? "text-blue-400"
                                    : application.first_pref_status === "waitlisted"
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                                }`}>
                                  First Preference
                                </span>
                                <p className="text-lg sm:text-xl font-bold text-white mt-1">
                                  {departmentNames.first}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${
                                application.first_pref_status === "accepted"
                                  ? "bg-green-600/80 backdrop-blur-sm"
                                  : application.first_pref_status === "rejected"
                                  ? "bg-red-600/80 backdrop-blur-sm"
                                  : application.first_pref_status === "shortlisted"
                                  ? "bg-blue-600/80 backdrop-blur-sm"
                                  : application.first_pref_status === "waitlisted"
                                  ? "bg-yellow-600/80 backdrop-blur-sm"
                                  : "bg-gray-600/80 backdrop-blur-sm"
                              }`}>1st</Badge>
                              {getStatusBadge(application.first_pref_status, 'first')}
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          {application.first_pref_status === "shortlisted" && (
                          <div className="mt-4">
                            {!panelAssignments.first ? (
                              <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Wait till the shortlist period to get over</span>
                                </div>
                                <p className="text-xs text-amber-300 mt-1">
                                  You'll be able to book slots once the shortlist period ends
                                </p>
                              </div>
                            ) : evaluationStatus.first ? (
                              <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Evaluation completed</span>
                                </div>
                                <p className="text-xs text-green-300 mt-1">
                                  Your interview has been completed and evaluated
                                </p>
                              </div>
                            ) : (
                              <>
                                {/* Debug info for troubleshooting Join Meet button */}
                                {slotData.first.booking && (
                                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>
                                    <div>Slot start: {formatIST(slotData.first.booking.start_time)}</div>
                                    <div>Slot end: {formatIST(slotData.first.booking.end_time)}</div>
                                  </div>
                                )}
                                {/* Join Meet button outside modal */}
                                {slotData.first.booking && canShowMeetLink(slotData.first.booking) && (
                                  <div className="mb-2">
                                    <a href={slotData.first.meetLink || ''} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="flex items-center gap-2 border-red-700 border-2 w-full sm:w-auto text-xs sm:text-sm">
                                        <Video className="h-4 w-4" />
                                        Join Meet
                                      </Button>
                                    </a>
                                  </div>
                                )}
                                {/* Meet link access info */}
                                {slotData.first.booking && (
                                  <div className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>You will get access to the meet link 10 minutes before your time slot</span>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenSlotModal('first')}
                                  disabled={evaluationStatus.first}
                                  className="mb-2 w-full sm:w-auto text-sm sm:text-base"
                                >
                                  Book/Manage Slot
                                </Button>
                              </>
                            )}
                            <Dialog open={openSlotModal === 'first'} onOpenChange={(open) => setOpenSlotModal(open ? 'first' : null)}>
                                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>First Preference Slot Booking</DialogTitle>
                                </DialogHeader>
                                {slotLoading.first ? (
                                  <div>Loading slots...</div>
                                ) : slotError.first ? (
                                  <div className="text-red-500">{slotError.first}</div>
                                ) : slotData.first.booking ? (
                                  <div className="space-y-2">
                                    <div>
                                      <b>Your booked slot:</b> {formatIST(slotData.first.booking.start_time)} to {formatIST(slotData.first.booking.end_time)} IST
                                    </div>
                                    <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                        onClick={async () => {
                                          await cancelApplicantTimeSlot(application.applicant_id, slotData.first.booking.panel_id);
                                          fetchSlotData('first');
                                        }}
                                          className="w-full sm:w-auto text-sm"
                              >
                                        Cancel Booking
                              </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="mb-2">Select a slot:</div>
                                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                                      <Table className="min-w-full">
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Start</TableHead>
                                            <TableHead>End</TableHead>
                                            <TableHead>Action</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {slotData.first.slots.length === 0 ? (
                                            <TableRow>
                                              <TableCell colSpan={3}>No available slots.</TableCell>
                                            </TableRow>
                                          ) : (
                                            slotData.first.slots.map((slot: any) => (
                                              <TableRow key={slot.id}>
                                                <TableCell>{formatIST(slot.start_time)}</TableCell>
                                                <TableCell>{formatIST(slot.end_time)}</TableCell>
                                                <TableCell>
                                                  <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                      try {
                                                        await bookApplicantTimeSlot(application.applicant_id, slotData.first.panel.id, slot.id);
                                                        fetchSlotData('first');
                                                      } catch (error: any) {
                                                        alert(error.message || 'Failed to book slot');
                                                      }
                                                    }}
                                                  >
                                                    Book
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ))
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                        </div>
                      </div>

                      {/* Second Preference Card */}
                      <div
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                          application.second_pref_status === "accepted"
                            ? "bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/50 shadow-green-500/10"
                            : application.second_pref_status === "rejected"
                            ? "bg-gradient-to-br from-red-900/40 to-rose-900/20 border-red-500/50 shadow-red-500/10"
                            : application.second_pref_status === "shortlisted"
                            ? "bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border-blue-500/50 shadow-blue-500/10"
                            : application.second_pref_status === "waitlisted"
                            ? "bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border-yellow-500/50 shadow-yellow-500/10"
                            : "bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-500/50 shadow-gray-500/10"
                        }`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30"></div>
                        
                        <div className="relative p-6">
                          {/* Header Section */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                application.second_pref_status === "accepted"
                                  ? "bg-green-500/20 text-green-400"
                                  : application.second_pref_status === "rejected"
                                  ? "bg-red-500/20 text-red-400"
                                  : application.second_pref_status === "shortlisted"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : application.second_pref_status === "waitlisted"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}>
                                <Target className="h-5 w-5" />
                              </div>
                              <div>
                                <span className={`text-sm font-semibold tracking-wide uppercase ${
                                  application.second_pref_status === "accepted"
                                    ? "text-green-400"
                                    : application.second_pref_status === "rejected"
                                    ? "text-red-400"
                                    : application.second_pref_status === "shortlisted"
                                    ? "text-blue-400"
                                    : application.second_pref_status === "waitlisted"
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                                }`}>
                                  Second Preference
                                </span>
                                <p className="text-lg sm:text-xl font-bold text-white mt-1">
                                  {departmentNames.second}
                                </p>
                              </div>
                            </div>
                            
                            {/* Status Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`text-white text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${
                                application.second_pref_status === "accepted"
                                  ? "bg-green-600/80 backdrop-blur-sm"
                                  : application.second_pref_status === "rejected"
                                  ? "bg-red-600/80 backdrop-blur-sm"
                                  : application.second_pref_status === "shortlisted"
                                  ? "bg-blue-600/80 backdrop-blur-sm"
                                  : application.second_pref_status === "waitlisted"
                                  ? "bg-yellow-600/80 backdrop-blur-sm"
                                  : "bg-gray-600/80 backdrop-blur-sm"
                              }`}>2nd</Badge>
                              {getStatusBadge(application.second_pref_status, 'second')}
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          {application.second_pref_status === "shortlisted" && (
                            <div className="mt-4">
                              {!panelAssignments.second ? (
                                <div className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Wait till the shortlist period to get over</span>
                                  </div>
                                  <p className="text-xs text-amber-300 mt-1">
                                    You'll be able to book slots once the shortlist period ends
                                  </p>
                                </div>
                              ) : evaluationStatus.second ? (
                                <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Evaluation completed</span>
                                  </div>
                                  <p className="text-xs text-green-300 mt-1">
                                    Your interview has been completed and evaluated
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {/* Debug info for troubleshooting Join Meet button */}
                                  {slotData.second.booking && (
                                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>  
                                      <div>Slot start: {formatIST(slotData.second.booking.start_time)}</div>
                                      <div>Slot end: {formatIST(slotData.second.booking.end_time)}</div>
                                    </div>
                                  )}
                                  {/* Join Meet button outside modal */}
                                  {slotData.second.booking && canShowMeetLink(slotData.second.booking) && (
                                    <div className="mb-2">
                                      <a href={slotData.second.meetLink || ''} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="flex items-center gap-2 border-red-700 border-2 w-full sm:w-auto text-xs sm:text-sm">
                                        <Video className="h-4 w-4" />
                                        Join Meet
                                      </Button>
                                    </a>
                                  </div>
                                )}
                                {/* Meet link access info */}
                                {slotData.second.booking && (
                                  <div className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      <span>You will get access to the meet link 10 minutes before your time slot</span>
                                    </div>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  onClick={() => setOpenSlotModal('second')}
                                  disabled={evaluationStatus.second}
                                  className="mb-2 w-full sm:w-auto text-sm sm:text-base"
                                >
                                  Book/Manage Slot
                                </Button>
                              </>
                            )}
                              <Dialog open={openSlotModal === 'second'} onOpenChange={(open) => setOpenSlotModal(open ? 'second' : null)}>
                                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Second Preference Slot Booking</DialogTitle>
                                  </DialogHeader>
                                  {slotLoading.second ? (
                                    <div>Loading slots...</div>
                                  ) : slotError.second ? (
                                    <div className="text-red-500">{slotError.second}</div>
                                  ) : slotData.second.booking ? (
                                    <div className="space-y-2">
                                      <div>
                                        <b>Your booked slot:</b> {formatIST(slotData.second.booking.start_time)} to {formatIST(slotData.second.booking.end_time)} IST
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                <Button
                                  variant="outline"
                                          onClick={async () => {
                                            await cancelApplicantTimeSlot(application.applicant_id, slotData.second.booking.panel_id);
                                            fetchSlotData('second');
                                          }}
                                          className="w-full sm:w-auto text-sm"
                                >
                                          Cancel Booking
                                </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="mb-2">Select a slot:</div>
                                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                                        <Table className="min-w-full">
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Start</TableHead>
                                              <TableHead>End</TableHead>
                                              <TableHead>Action</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {slotData.second.slots.length === 0 ? (
                                              <TableRow>
                                                <TableCell colSpan={3}>No available slots.</TableCell>
                                              </TableRow>
                                            ) : (
                                              slotData.second.slots.map((slot: any) => (
                                                <TableRow key={slot.id}>
                                                  <TableCell>{formatIST(slot.start_time)}</TableCell>
                                                  <TableCell>{formatIST(slot.end_time)}</TableCell>
                                                  <TableCell>
                                                    <Button
                                                      size="sm"
                                                      onClick={async () => {
                                                        try {
                                                          await bookApplicantTimeSlot(application.applicant_id, slotData.second.panel.id, slot.id);
                                                          fetchSlotData('second');
                                                        } catch (error: any) {
                                                          alert(error.message || 'Failed to book slot');
                                                        }
                                                      }}
                                                    >
                                                      Book
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              ))
                                            )}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
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
          <div className="space-y-6 lg:space-y-8">
            {/* Important Dates Card */}
            <div className="hackclub-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-semibold">
                    Important Dates
                  </CardTitle>
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-red-800 dark:text-red-200 text-sm sm:text-base">
                        {deadlinePassed && shortlistDeadline ? "Shortlist Deadline" : "Application Deadline"}
                      </p>
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                        {displayDeadline
                          ? displayDeadline.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
                          : "Loading..."}
                      </p>
                    </div>
                    <Bell className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 ml-2" />
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Quick Actions Card */}
            <div className="hackclub-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <Link href="/application" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10 sm:h-12 text-sm sm:text-base border-2 hover:bg-primary/5"
                  >
                    <FileText className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                    {applicationSubmitted
                      ? "View Application"
                      : "Start Application"}
                  </Button>
                </Link>

                <Link href="/profile" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10 sm:h-12 text-sm sm:text-base border-2 hover:bg-primary/5"
                  >
                    <User className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                    Profile
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10 sm:h-12 text-sm sm:text-base border-2 hover:bg-primary/5"
                  >
                    <User className="mr-3 h-4 w-4 sm:h-5 sm:w-5" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showMeetDialog} onOpenChange={setShowMeetDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Meet Link Unavailable</DialogTitle>
          </DialogHeader>
          <div>{meetDialogMsg}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
