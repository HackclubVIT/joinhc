"use client";

import { HackClubLogo } from "@/components/hackclub-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkIsEvaluatorOrRecruiter,
  getApplicantMarkByRecruiter,
  getPanelData,
  updateMeetLink,
  updateOrCreateApplicantMark,
  getPanelTimeSlotsWithBookingStatus,
  createPanelTimeSlot,
  updatePanelTimeSlot,
  deletePanelTimeSlot,
  getDepartmentNameById,
  type PanelTimeSlot,
} from "@/lib/supabase/data-fetching";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Edit,
  ExternalLink,
  Eye,
  Hash,
  Mail,
  Search,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";
import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

type PanelData = {
  name: string;
  meet_link?: string;
  department_id: string;
  first_pref_count: number;
  second_pref_count: number;
  applicants: Applicant[];
};

type Applicant = {
  id: string;
  name: string;
  email: string;
  register_no: string;
  first_pref_dept_id: string;
  first_pref_reason: string;
  second_pref_dept_id: string;
  second_pref_reason: string;
  priority_reason: string;
  portfolio_link?: string;
  created_at: string;
  first_pref_status: "pending" | "shortlisted" | "not_selected" | "accepted" | "rejected";
  second_pref_status: "pending" | "shortlisted" | "not_selected" | "accepted" | "rejected";
};

export default function PanelPage() {
  const { panelId }: { panelId: string } = useParams();
  const router = useRouter();
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case "shortlisted":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "accepted":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
      case "not_selected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatStatus = (status: string) => {
    if (status === "not_selected") {
      return "Rejected";
    }
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const [panelData, setPanelData] = useState<PanelData>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [remark, setRemark] = useState<string>("");
  const [meetLink, setMeetLink] = useState<string>("");
  const [meetLinkEditable, setMeetLinkEditable] = useState(false);
  const [isTimeSlotDialogOpen, setIsTimeSlotDialogOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<(PanelTimeSlot & { isBooked: boolean; bookedBy?: string; bookedByName?: string })[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotForm, setSlotForm] = useState({ start: "", end: "" });
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ start: "", end: "" });
  const [slotError, setSlotError] = useState<string | null>(null);
  
  
  const [firstPrefDeptName, setFirstPrefDeptName] = useState<string>("");
  const [secondPrefDeptName, setSecondPrefDeptName] = useState<string>("");

  
  const fetchTimeSlots = async () => {
    setLoadingSlots(true);
    try {
      const slots = await getPanelTimeSlotsWithBookingStatus(panelId);
      setTimeSlots(slots);
    } catch (e) {
      setSlotError("Failed to load time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (isMarkDialogOpen && selectedApplicant?.id && panelData?.department_id) {
      
      setScore(null);
      setRemark("");
      
      
      getApplicantMarkByRecruiter(
        selectedApplicant?.id,
        panelData?.department_id
      ).then((res) => {
        if (res) {
          setScore(res.score);
          setRemark(res.remarks);
        }
      });
    } else if (!isMarkDialogOpen) {
      
      setScore(null);
      setRemark("");
    }
  }, [isMarkDialogOpen, selectedApplicant?.id, panelData?.department_id]);

  
  useEffect(() => {
    const fetchDeptNames = async () => {
      if (selectedApplicant) {
        try {
          const [first, second] = await Promise.all([
            getDepartmentNameById(selectedApplicant.first_pref_dept_id),
            getDepartmentNameById(selectedApplicant.second_pref_dept_id),
          ]);
          setFirstPrefDeptName(first || selectedApplicant.first_pref_dept_id);
          setSecondPrefDeptName(second || selectedApplicant.second_pref_dept_id);
        } catch (error) {
          console.error("Error fetching department names:", error);
          
          setFirstPrefDeptName(selectedApplicant.first_pref_dept_id);
          setSecondPrefDeptName(selectedApplicant.second_pref_dept_id);
        }
      } else {
        setFirstPrefDeptName("");
        setSecondPrefDeptName("");
      }
    };
    fetchDeptNames();
  }, [selectedApplicant]);

  useEffect(() => {
    const fetchData = async () => {
      const valid = await checkIsEvaluatorOrRecruiter(panelId);
      if (!valid) redirect("/dashboard/recruiter");
      const data = await getPanelData(panelId);
      setPanelData(data);
      setMeetLink(data?.meet_link || "");
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isTimeSlotDialogOpen) fetchTimeSlots();
  }, [isTimeSlotDialogOpen]);

  if (!panelData) {
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

  const filteredApplicants = panelData.applicants.filter((applicant) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      applicant.name?.toLowerCase().includes(query) ||
      applicant.email?.toLowerCase().includes(query) ||
      applicant.register_no?.toLowerCase().includes(query)
    );
  });

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
                <span>Panels</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{panelData.name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex justify-center sm:justify-start">
                <HackClubLogo size="md" showText={false} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {panelData.name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage evaluation for this panel
                </p>
                <Button
                  variant="outline"
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => setIsTimeSlotDialogOpen(true)}
                >
                  Manage Interview Time Slots
                </Button>
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
                    {panelData.applicants.length}
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
                    {panelData.first_pref_count}
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
                    Second Preference
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {panelData.second_pref_count}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
          <Card className="">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-4">
                  <CardTitle className="text-xl sm:text-2xl font-semibold">
                    Applicants
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Input
                      placeholder="Enter Meet link"
                      className="bg-input border-border border-2 w-full sm:w-auto"
                      disabled={!meetLinkEditable}
                      value={meetLink}
                      onChange={(e) => setMeetLink(e.target.value)}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      {meetLink && !meetLinkEditable && (
                        <a
                          target="_blank"
                          className="cursor-pointer text-xs sm:text-sm bg-red-500 rounded-sm w-full sm:w-24 flex justify-center items-center px-2 py-1"
                          href={meetLink}
                        >
                          <p>Join Meet</p>
                        </a>
                      )}
                      <Button
                        size="sm"
                        className="w-full sm:w-auto text-xs sm:text-sm"
                        onClick={async () => {
                          if (!meetLinkEditable) {
                            setMeetLinkEditable(true);
                          } else {
                            if (await updateMeetLink(panelId, meetLink)) {
                              toast.success("Meet link updated successfully");
                            } else {
                              toast.error("Failed to update meet link");
                            }
                            setMeetLinkEditable(false);
                          }
                        }}
                      >
                        {meetLinkEditable
                          ? "Save Link"
                          : meetLink
                          ? "Update Link"
                          : "Add Link"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applicants..."
                  className="pl-8 bg-input border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                {filteredApplicants.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No applicants found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your filters to see more results."
                        : "Applications will appear here once students start applying."}
                    </p>
                  </div>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <Card
                      key={applicant.id}
                      className="transition-all duration-300 hover:scale-[1.02]"
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
                              <div className="flex flex-col sm:flex-row gap-2">
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
                                  <span className="hidden sm:inline">View Application</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplicant(applicant);
                                    setIsMarkDialogOpen(true);
                                  }}
                                  className="border-2 text-xs sm:text-sm"
                                >
                                  <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">Mark Application</span>
                                  <span className="sm:hidden">Mark</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isMarkDialogOpen} onOpenChange={(open) => {
            setIsMarkDialogOpen(open);
            if (!open) {
              
              setScore(null);
              setRemark("");
              setSelectedApplicant(undefined);
            }
          }}>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Mark & Remark</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Enter the mark and remark for {selectedApplicant?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mark">Mark</Label>
                  <Input
                    id="mark"
                    type="number"
                    min={1}
                    max={10}
                    value={score ?? ""}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    placeholder="Enter mark"
                  />
                </div>
                <div>
                  <Label htmlFor="remark">Remark</Label>
                  <Input
                    id="remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter remark"
                  />
                </div>
                <Button
                  onClick={async () => {
                    const score = parseInt(
                      (document.getElementById("mark") as HTMLInputElement)
                        .value
                    );
                    const remark = (
                      document.getElementById("remark") as HTMLInputElement
                    ).value;
                    if (isNaN(score) || score < 1 || score > 10) {
                      toast.error("Please enter a valid mark between 1 and 10");
                      return;
                    }

                    if (
                      score &&
                      selectedApplicant?.id &&
                      panelData?.department_id
                    ) {
                      const success = await updateOrCreateApplicantMark(
                        selectedApplicant.id,
                        panelData.department_id,
                        score,
                        remark
                      );

                      if (success) {
                        toast.success("Applicant marked successfully");
                      } else {
                        toast.error("Failed to mark applicant");
                      }
                    }
                    setIsMarkDialogOpen(false);
                    setSelectedApplicant(undefined);
                    
                    setScore(null);
                    setRemark("");
                  }}
                  className="mt-2 w-full"
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Applicant Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              
              setFirstPrefDeptName("");
              setSecondPrefDeptName("");
              setSelectedApplicant(undefined);
            }
          }}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-y-auto border-0">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  Applicant Details
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Detailed information about {selectedApplicant?.name}
                </DialogDescription>
              </DialogHeader>

              {selectedApplicant && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Name</Label>
                      <p className="text-xs sm:text-sm">{selectedApplicant.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">Email</Label>
                      <p className="text-xs sm:text-sm">{selectedApplicant.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-medium">
                        Register Number
                      </Label>
                      <p className="text-xs sm:text-sm">{selectedApplicant.register_no}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs sm:text-sm font-medium">
                          First Preference
                        </Label>
                        <span className={getStatusBadge(selectedApplicant.first_pref_status)}>
                          {formatStatus(selectedApplicant.first_pref_status)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">
                        {firstPrefDeptName || selectedApplicant.first_pref_dept_id}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {selectedApplicant.first_pref_reason}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs sm:text-sm font-medium">
                          Second Preference
                        </Label>
                        <span className={getStatusBadge(selectedApplicant.second_pref_status)}>
                          {formatStatus(selectedApplicant.second_pref_status)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">
                        {secondPrefDeptName || selectedApplicant.second_pref_dept_id}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {selectedApplicant.second_pref_reason}
                      </p>
                    </div>

                    <div>
                      <Label className="text-xs sm:text-sm font-medium">
                        Priority Reasoning
                      </Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {selectedApplicant.priority_reason}
                      </p>
                    </div>

                    {selectedApplicant.portfolio_link && (
                      <div>
                        <Label className="text-xs sm:text-sm font-medium">
                          Portfolio/Links
                        </Label>
                        <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">
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
                                      className="text-primary hover:underline break-all"
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
                      <Label className="text-xs sm:text-sm font-medium">
                        Submitted At
                      </Label>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(
                          selectedApplicant.created_at
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Time Slot Management Dialog */}
          <Dialog open={isTimeSlotDialogOpen} onOpenChange={setIsTimeSlotDialogOpen}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Manage Interview Time Slots</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Create, edit, or delete interview time slots for this panel. Each slot can be booked by one applicant only.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-4">
              {/* Create new slot */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="datetime-local"
                  value={slotForm.start}
                  onChange={e => setSlotForm(f => ({ ...f, start: e.target.value }))}
                  placeholder="Start time"
                  className="text-sm sm:text-base"
                />
                <Input
                  type="datetime-local"
                  value={slotForm.end}
                  onChange={e => setSlotForm(f => ({ ...f, end: e.target.value }))}
                  placeholder="End time"
                  className="text-sm sm:text-base"
                />
                <Button
                  onClick={async () => {
                    setSlotError(null);
                    if (!slotForm.start || !slotForm.end) {
                      setSlotError("Start and end time required");
                      return;
                    }
                    try {
                      await createPanelTimeSlot(panelId, slotForm.start, slotForm.end);
                      setSlotForm({ start: "", end: "" });
                      fetchTimeSlots();
                    } catch (e) {
                      setSlotError("Failed to create slot");
                    }
                  }}
                  className="text-sm sm:text-base"
                >
                  Add Slot
                </Button>
              </div>
              {slotError && <div className="text-red-500 text-xs sm:text-sm">{slotError}</div>}
              {/* List slots */}
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Start</TableHead>
                      <TableHead className="text-xs sm:text-sm">End</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Booked By</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingSlots ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-xs sm:text-sm">Loading...</TableCell>
                      </TableRow>
                    ) : timeSlots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-xs sm:text-sm">No time slots yet.</TableCell>
                      </TableRow>
                    ) : (
                      timeSlots.map(slot => (
                        <TableRow key={slot.id}>
                          <TableCell className="text-xs sm:text-sm">{format(new Date(slot.start_time), "yyyy-MM-dd HH:mm")}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{format(new Date(slot.end_time), "yyyy-MM-dd HH:mm")}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {slot.isBooked ? (
                              <span className="text-red-600 font-medium">Booked</span>
                            ) : (
                              <span className="text-green-600 font-medium">Available</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {slot.isBooked && slot.bookedByName ? (
                              <span className="text-blue-600 font-medium">{slot.bookedByName}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {editingSlotId === slot.id ? (
                              <>
                                <Input
                                  type="datetime-local"
                                  value={editForm.start}
                                  onChange={e => setEditForm(f => ({ ...f, start: e.target.value }))}
                                  className="mb-1 text-xs sm:text-sm"
                                />
                                <Input
                                  type="datetime-local"
                                  value={editForm.end}
                                  onChange={e => setEditForm(f => ({ ...f, end: e.target.value }))}
                                  className="mb-1 text-xs sm:text-sm"
                                />
                                <div className="flex gap-1">
                                <Button
                                  size="sm"
                                    className="text-xs sm:text-sm"
                                  onClick={async () => {
                                    try {
                                      await updatePanelTimeSlot(slot.id, editForm.start, editForm.end);
                                      setEditingSlotId(null);
                                      fetchTimeSlots();
                                      toast.success('Time slot updated successfully!');
                                    } catch (e: any) {
                                      const errorMessage = e.message || "Failed to update slot";
                                      setSlotError(errorMessage);
                                      toast.error(errorMessage);
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                  <Button size="sm" variant="ghost" className="text-xs sm:text-sm" onClick={() => setEditingSlotId(null)}>
                                  Cancel
                                </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col sm:flex-row gap-1">
                                  {(() => {
                                    const now = new Date();
                                    const slotStartTime = new Date(slot.start_time);
                                    const isExpired = now >= slotStartTime;
                                    const canEdit = !(slot.isBooked && isExpired);
                                    
                                    return (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className={`text-xs sm:text-sm ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!canEdit}
                                        title={!canEdit ? "Cannot edit booked slot that has already passed" : ""}
                                        onClick={() => {
                                          if (!canEdit) return;
                                          setEditingSlotId(slot.id);
                                          setEditForm({ start: slot.start_time.slice(0, 16), end: slot.end_time.slice(0, 16) });
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    );
                                  })()}
                                  {(() => {
                                    const now = new Date();
                                    const slotStartTime = new Date(slot.start_time);
                                    const isExpired = now >= slotStartTime;
                                    const canDelete = !(slot.isBooked && isExpired);
                                    
                                    return (
                                      <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        className={`text-xs sm:text-sm ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!canDelete}
                                        title={!canDelete ? "Cannot delete booked slot that has already passed" : ""}
                                        onClick={async () => {
                                          if (!canDelete) return;
                                          try {
                                            await deletePanelTimeSlot(slot.id);
                                            fetchTimeSlots();
                                            toast.success('Time slot deleted successfully!');
                                          } catch (e: any) {
                                            const errorMessage = e.message || "Failed to delete slot";
                                            setSlotError(errorMessage);
                                            toast.error(errorMessage);
                                          }
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    );
                                  })()}
                                </div>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
