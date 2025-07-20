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
  updateOrCreateApplicantMark,
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
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  first_pref_dept: string;
  first_pref_reason: string;
  second_pref_dept: string;
  second_pref_reason: string;
  priority_reason: string;
  portfolio_link?: string;
  created_at: string;
};

export default function PanelPage({
  params,
}: {
  params: Promise<{ panelId: string }>;
}) {
  const router = useRouter();

  const [panelData, setPanelData] = useState<PanelData>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [remark, setRemark] = useState<string>("");

  useEffect(() => {
    if (isMarkDialogOpen && selectedApplicant?.id && panelData?.department_id) {
      getApplicantMarkByRecruiter(
        selectedApplicant?.id,
        panelData?.department_id
      ).then((res) => {
        if (res) {
          setScore(res.score);
          setRemark(res.remarks);
        }
      });
    }
  }, [isMarkDialogOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const { panelId } = await params;
      const valid = await checkIsEvaluatorOrRecruiter(panelId);
      if (!valid) redirect("/recruiter");
      setPanelData(await getPanelData(panelId));
    };

    fetchData();
  }, []);

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

  const filteredApplicants = panelData.applicants.filter((data) =>
    data.name.startsWith(searchQuery)
  );

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
                <span>Panels</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{panelData.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex justify-center">
                <HackClubLogo size="md" showText={false} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {panelData.name}
                </h1>
                <p className="text-muted-foreground">
                  Manage evaluation for this panel
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
          <Card className="neo-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    Applicants
                  </CardTitle>
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
                              <div className="flex flex-col gap-2">
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
                                  View Application
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplicant(applicant);
                                    setIsMarkDialogOpen(true);
                                  }}
                                  className="border-2"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Mark Application
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

          <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Mark & Remark</DialogTitle>
                <DialogDescription>
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
                      console.log("Marking applicant:", score, remark);
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
                  }}
                  className="mt-2 w-full"
                >
                  Save
                </Button>
              </div>
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
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        First Preference
                      </Label>
                      <p className="text-sm font-medium">
                        {selectedApplicant.first_pref_dept}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedApplicant.first_pref_reason}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Second Preference
                      </Label>
                      <p className="text-sm font-medium">
                        {selectedApplicant.second_pref_dept}
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
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
