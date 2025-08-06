"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getDepartments,
  getApplicationForUser,
  saveApplication,
  getApplicationDeadline,
  type Application,
  type Department,
  getAvailableTimeSlotsForPanel,
  getApplicantTimeSlot,
  bookApplicantTimeSlot,
  cancelApplicantTimeSlot,
  getPanelByDepartment,
} from "@/lib/supabase/data-fetching";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function ApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [DEPARTMENTS, setDepartments] = useState<Department[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [existingApplication, setExistingApplication] =
    useState<Application | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    register_no: "",
    dept_first_pref: "",
    reason_first_pref: "",
    dept_second_pref: "",
    reason_second_pref: "",
    reason_priority: "",
    links: "",
  });

  
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
      if (!panelId || status !== "shortlisted") {
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
        
        const departments = await getDepartments();
        setDepartments(departments);

        
        const applicationDeadline = await getApplicationDeadline();
        if (applicationDeadline?.deadline) {
          setDeadline(new Date(applicationDeadline.deadline));
        }

        
        const application = await getApplicationForUser();
        setExistingApplication(application);

        const userName = user?.user_metadata?.full_name;
        const userRegisterNo = user?.user_metadata?.register_no;

        if (application) {
          setFormData({
            name: application.name || userName,
            email: application.email || user?.email || "",
            register_no: application.register_no || userRegisterNo || "",
            dept_first_pref: application.first_pref_dept_id || "",
            reason_first_pref: application.first_pref_reason || "",
            dept_second_pref: application.second_pref_dept_id || "",
            reason_second_pref: application.second_pref_reason || "",
            reason_priority: application.priority_reason || "",
            links: application.portfolio_link || "",
          });
        } else {
          
          setFormData((prev) => ({
            ...prev,
            name: userName,
            email: user?.email || "",
            register_no: userRegisterNo || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load application data. Please try again.");
      }
    };

    if (user) {
      fetchData();
      fetchSlotData('first');
      fetchSlotData('second');
    }
  }, [user]);

  if (!user) {
    return <div className="content-container py-6 sm:py-10">Loading...</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    
    if (formData.dept_first_pref === formData.dept_second_pref) {
      setError("First and second preference departments must be different.");
      setIsSubmitting(false);
      return;
    }

    try {
      await saveApplication({
        name: formData.name,
        email: formData.email,
        register_no: formData.register_no,
        first_pref_dept_id: formData.dept_first_pref,
        first_pref_reason: formData.reason_first_pref,
        second_pref_dept_id: formData.dept_second_pref,
        second_pref_reason: formData.reason_second_pref,
        priority_reason: formData.reason_priority,
        portfolio_link: formData.links,
        first_pref_status: "pending",
        second_pref_status: "pending",
      });

      const successMessage = existingApplication
        ? "Application updated successfully!"
        : "Application submitted successfully!";

      setSuccess(successMessage);
      
      toast({
        title: "Success!",
        description: successMessage,
        variant: "default",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (err: any) {
      setError(
        err.message || "Failed to submit application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const canShowMeetLink = (slot: any) => {
    if (!slot) return false;
    const now = toIST(new Date());
    const start = toIST(slot.start_time);
    const end = toIST(slot.end_time);
    return now >= new Date(start.getTime() - 10 * 60 * 1000) && now <= end;
  };

  
  const formatIST = (date: string | Date) =>
    format(toIST(date), "yyyy-MM-dd HH:mm");

  const deadlinePassed = deadline ? new Date() > deadline : false;

  return (
    <div className="min-h-screen hackclub-bg page-transition overflow-x-hidden">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10">
        <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Application Form</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {existingApplication
            ? "Update your application details below."
            : "Please fill out the form below to submit your application."}
        </p>
        {deadline && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Application deadline:{" "}
            {deadline.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} at{" "}
            {deadline.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
        )}
      </div>

        {deadlinePassed && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Application Closed</AlertTitle>
            <AlertDescription>
              The application deadline has passed. You can no longer submit or
              edit your application.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Please provide your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={true}
                    className="bg-muted" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={true} 
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register_no">Register Number</Label>
                <Input
                  id="register_no"
                  name="register_no"
                  value={formData.register_no}
                  onChange={handleChange}
                  required
                  disabled={true}
                  className="bg-muted" 
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Department Preferences</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Select your preferred departments and provide reasons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept_first_pref">
                    First Preference Department
                  </Label>
                  <Select
                    disabled={deadlinePassed}
                    onValueChange={(value) =>
                      handleSelectChange("dept_first_pref", value)
                    }
                    value={formData.dept_first_pref}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_first_pref">
                    Reason for First Preference
                  </Label>
                  <Textarea
                    id="reason_first_pref"
                    name="reason_first_pref"
                    value={formData.reason_first_pref}
                    onChange={handleChange}
                    rows={3}
                    required
                    disabled={deadlinePassed}
                    placeholder="Explain why this is your first choice..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept_second_pref">
                    Second Preference Department
                  </Label>
                  <Select
                    disabled={deadlinePassed}
                    onValueChange={(value) =>
                      handleSelectChange("dept_second_pref", value)
                    }
                    value={formData.dept_second_pref}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter(
                        (dept) => dept.id !== formData.dept_first_pref,
                      ).map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason_second_pref">
                    Reason for Second Preference
                  </Label>
                  <Textarea
                    id="reason_second_pref"
                    name="reason_second_pref"
                    value={formData.reason_second_pref}
                    onChange={handleChange}
                    rows={3}
                    required
                    disabled={deadlinePassed}
                    placeholder="Explain why this is your second choice..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason_priority">
                  Why Hackclub?(Explain what makes you a good fit for your preferred departments)
                </Label>
                <Textarea
                  id="reason_priority"
                  name="reason_priority"
                  value={formData.reason_priority}
                  onChange={handleChange}
                  rows={3}
                  required
                  disabled={deadlinePassed}
                  placeholder="Why should we recruit you..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Provide links to your portfolio, resume, or GitHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="links">Portfolio/Resume/GitHub Links</Label>
                <Textarea
                  id="links"
                  name="links"
                  value={formData.links}
                  onChange={handleChange}
                  placeholder="https://portfolio.com&#10;https://github.com/username&#10;https://resume-link.com"
                  disabled={deadlinePassed}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  You can add multiple links, one per line
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || deadlinePassed}
              >
                {isSubmitting
                  ? existingApplication
                    ? "Updating..."
                    : "Submitting..."
                  : deadlinePassed
                    ? "Deadline Passed"
                    : existingApplication
                      ? "Update Application"
                      : "Submit Application"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="px-4 mt-8">
        {(['first', 'second'] as Pref[]).map((pref) => {
          const prefLabel = pref === 'first' ? 'First' : 'Second';
          const d = slotData[pref];
          if (!d.panel) return null;
          return (
            <Card className="mb-6" key={pref}>
              <CardHeader>
                <CardTitle>
                  {prefLabel} Preference Interview Slot
                </CardTitle>
                <CardDescription>
                  Book your interview slot for the {d.panel.name} panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {slotLoading[pref] ? (
                  <div>Loading slots...</div>
                ) : slotError[pref] ? (
                  <div className="text-red-500">{slotError[pref]}</div>
                ) : d.booking ? (
                  <div className="space-y-2">
                    <div>
                      <b>Your booked slot:</b> {formatIST(d.booking.start_time)} to {formatIST(d.booking.end_time)} IST
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await cancelApplicantTimeSlot(d.booking.applicant_id, d.booking.panel_id);
                          fetchSlotData(pref);
                        }}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                    {d.meetLink && (
                      <div className="mt-4">
                        {canShowMeetLink(d.booking) ? (
                          <a href={d.meetLink} target="_blank" rel="noopener noreferrer">
                            <Button>Join Meet</Button>
                          </a>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setMeetDialogMsg(
                                `Your interview time is from ${formatIST(d.booking.start_time)} to ${formatIST(d.booking.end_time)} IST. The meet link will be available 10 minutes before your slot.`
                              );
                              setShowMeetDialog(true);
                            }}
                          >
                            Join Meet
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">Select a slot:</div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Start</TableHead>
                            <TableHead>End</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {d.slots.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3}>No available slots.</TableCell>
                            </TableRow>
                          ) : (
                            d.slots.map((slot: any) => (
                              <TableRow key={slot.id}>
                                <TableCell>{formatIST(slot.start_time)}</TableCell>
                                <TableCell>{formatIST(slot.end_time)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      if (!user) return;
                                      await bookApplicantTimeSlot(user.id, d.panel.id, slot.id);
                                      fetchSlotData(pref);
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
              </CardContent>
            </Card>
          );
        })}
        <Dialog open={showMeetDialog} onOpenChange={setShowMeetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Meet Link Unavailable</DialogTitle>
            </DialogHeader>
            <div>{meetDialogMsg}</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
