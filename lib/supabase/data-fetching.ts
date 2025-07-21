import { createClient } from "@/lib/supabase/client";

export type Application = {
  id: string;
  name: string;
  register_no: string;
  email: string;
  applicant_id: string;
  first_pref_dept_id: string;
  first_pref_reason: string;
  first_pref_status:
    | "pending"
    | "shortlisted"
    | "waitlisted"
    | "rejected"
    | "accepted";
  second_pref_dept_id: string;
  second_pref_reason: string;
  second_pref_status:
    | "pending"
    | "shortlisted"
    | "waitlisted"
    | "rejected"
    | "accepted";
  priority_reason: string;
  portfolio_link: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  register_no: string | null;
  role: "applicant" | "recruiter";
  email: string;
  created_at: string;
  updated_at: string;
};

export type Department = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type RecruiterDepartment = {
  id: string;
  recruiter_id: string;
  department_id: string;
  created_at: string;
  department?: Department;
  role: "recruiter" | "evaluator";
  panel_id?: string;
};

export type ApplicationSettings = {
  id: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }

  return user;
}

export async function getApplicationForUser() {
  const supabase = createClient();

  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        first_dept:departments!applications_first_pref_dept_id_fkey(id, name),
        second_dept:departments!applications_second_pref_dept_id_fkey(id, name)
      `
      )
      .eq("applicant_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching application:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in getApplicationForUser:", err);
    return null;
  }
}

// Add new function to get selected department for shortlisted applications
export async function getSelectedDepartmentForApplication(
  applicationId: string
): Promise<string | null> {
  const supabase = createClient();

  try {
    // This would need to be determined by your business logic
    // For now, we'll assume first preference is selected unless specified otherwise
    // You might want to add a 'selected_department_id' field to applications table
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        *,
        first_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_dept:departments!applications_second_pref_dept_id_fkey(name)
      `
      )
      .eq("id", applicationId)
      .single();

    if (error) {
      console.error("Error fetching selected department:", error);
      return null;
    }

    // For now, return first preference department name
    // You should modify this logic based on how you track which department was selected
    return data.first_dept?.name || null;
  } catch (err) {
    console.error("Error in getSelectedDepartmentForApplication:", err);
    return null;
  }
}

export async function saveApplication(applicationData: {
  name: string;
  register_no: string;
  email: string;
  first_pref_dept_id: string;
  first_pref_reason: string;
  second_pref_dept_id: string;
  second_pref_reason: string;
  priority_reason: string;
  portfolio_link?: string;
  status?: string;
}) {
  const supabase = createClient();

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const { data: existingApp } = await supabase
      .from("applications")
      .select("id")
      .eq("applicant_id", user.id)
      .single();

    const dataToSave = {
      applicant_id: user.id,
      ...applicationData,
      updated_at: new Date().toISOString(),
    };

    if (existingApp) {
      const { data, error } = await supabase
        .from("applications")
        .update(dataToSave)
        .eq("id", existingApp.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating application:", error);
        throw error;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from("applications")
        .insert(dataToSave)
        .select()
        .single();

      if (error) {
        console.error("Error creating application:", error);
        throw error;
      }

      return data;
    }
  } catch (err) {
    console.error("Error in saveApplication:", err);
    throw err;
  }
}

export async function getProfile(userId?: string) {
  const supabase = createClient();

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await getCurrentUser();
      if (!user) return null;
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile | null;
  } catch (err) {
    console.error("Error in getProfile:", err);
    return null;
  }
}

export async function updateProfile(profileData: Partial<Profile>) {
  const supabase = createClient();

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in updateProfile:", err);
    throw err;
  }
}

export async function getDepartments() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
      return [];
    }

    return data as Department[];
  } catch (err) {
    console.error("Error in getDepartments:", err);
    return [];
  }
}

export async function getRecruiterDepartments(userId?: string) {
  const supabase = createClient();

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await getCurrentUser();
      if (!user) return [];
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from("recruiter_departments")
      .select(
        `
        *,
        department:departments(id, name, description)
      `
      )
      .eq("recruiter_id", targetUserId);

    if (error) {
      console.error("Error fetching recruiter departments:", error);
      return [];
    }

    console.log("Raw recruiter departments data:", data);

    // Ensure we have consistent data structure
    const processedData = data.map((item) => ({
      ...item,
      department_id: item.department?.id || item.department_id,
    }));

    console.log("Processed recruiter departments:", processedData);

    return processedData as RecruiterDepartment[];
  } catch (err) {
    console.error("Error in getRecruiterDepartments:", err);
    return [];
  }
}

export async function assignDepartmentToRecruiter(
  recruiterId: string,
  departmentId: string
) {
  const supabase = createClient();

  try {
    const isAdmin = await isCurrentUserRecruiter();
    if (!isAdmin) {
      throw new Error("Only recruiters can assign departments");
    }

    const { data, error } = await supabase
      .from("recruiter_departments")
      .insert({
        recruiter_id: recruiterId,
        department_id: departmentId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error assigning department:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in assignDepartmentToRecruiter:", err);
    throw err;
  }
}

export async function removeDepartmentFromRecruiter(assignmentId: string) {
  const supabase = createClient();

  try {
    const isAdmin = await isCurrentUserRecruiter();
    if (!isAdmin) {
      throw new Error("Only recruiters can remove department assignments");
    }

    const { error } = await supabase
      .from("recruiter_departments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      console.error("Error removing department assignment:", error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error("Error in removeDepartmentFromRecruiter:", err);
    throw err;
  }
}

export async function getAllRecruiters() {
  const supabase = createClient();

  try {
    const isAdmin = await isCurrentUserRecruiter();
    if (!isAdmin) {
      throw new Error("Only recruiters can view all recruiters");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "recruiter")
      .order("full_name");

    if (error) {
      console.error("Error fetching recruiters:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error in getAllRecruiters:", err);
    return [];
  }
}

export async function getAllUsers() {
  const supabase = createClient();

  try {
    const isAdmin = await isCurrentUserRecruiter();
    if (!isAdmin) {
      throw new Error("Only recruiters can view all users");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, register_no")
      .order("role")
      .order("full_name");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    return [];
  }
}

export async function updateUserRole(
  userId: string,
  newRole: "applicant" | "recruiter"
) {
  const supabase = createClient();

  try {
    const isAdmin = await isCurrentUserRecruiter();
    if (!isAdmin) {
      throw new Error("Only recruiters can update user roles");
    }

    const { data, error } = await supabase.rpc("update_user_role", {
      user_id: userId,
      new_role: newRole,
    });

    if (error) {
      console.error("Error updating user role:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in updateUserRole:", err);
    throw err;
  }
}

export async function getDepartmentApplicants(departmentId: string) {
  const supabase = createClient();

  function normalizeUuid(str: string) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase();
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        cleaned
      )
    ) {
      return cleaned;
    }

    if (/^[0-9a-f]{32}$/.test(cleaned)) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(
        12,
        16
      )}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
    }
    return str;
  }

  function isUuid(str: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      str
    );
  }

  const normalizedId = normalizeUuid(departmentId);
  if (!isUuid(normalizedId)) {
    console.error(
      "Invalid departmentId passed to getDepartmentApplicants:",
      departmentId
    );
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .or(
        `first_pref_dept_id.eq.${normalizedId},second_pref_dept_id.eq.${normalizedId}`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching department applicants:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error in getDepartmentApplicants:", err);
    return [];
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  preference: "first" | "second"
) {
  const supabase = createClient();

  try {
    const updateField =
      preference === "first" ? "first_pref_status" : "second_pref_status";

    const { data, error } = await supabase
      .from("applications")
      .update({
        [updateField]: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating application status:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error in updateApplicationStatus:", err);
    throw err;
  }
}

// Helper function to get overall application status based on preferences
export function getOverallApplicationStatus(
  application: Application
): "pending" | "shortlisted" | "waitlisted" | "rejected" | "accepted" {
  // If either preference is shortlisted, overall is shortlisted

  if (
    application.first_pref_status === "accepted" ||
    application.second_pref_status === "accepted"
  ) {
    return "accepted";
  }

  if (
    application.first_pref_status === "shortlisted" ||
    application.second_pref_status === "shortlisted"
  ) {
    return "shortlisted";
  }

  // If either preference is waitlisted, overall is waitlisted
  if (
    application.first_pref_status === "waitlisted" ||
    application.second_pref_status === "waitlisted"
  ) {
    return "waitlisted";
  }

  // If both are rejected, overall is rejected
  if (
    application.first_pref_status === "rejected" &&
    application.second_pref_status === "rejected"
  ) {
    return "rejected";
  }

  // Otherwise, it's pending
  return "pending";
}

// Helper function to get which department preference was shortlisted/waitlisted
export function getPreferenceSelectionInfo(application: Application): {
  type: "first" | "second" | "both" | null;
  status: string;
} {
  const firstAccepted = application.first_pref_status === "accepted";
  const secondAccepted = application.second_pref_status === "accepted";

  const firstShortlisted = application.first_pref_status === "shortlisted";
  const secondShortlisted = application.second_pref_status === "shortlisted";

  if (firstAccepted && secondAccepted) {
    return { type: "both", status: "accepted" };
  }

  if (firstAccepted) {
    return { type: "first", status: "accepted" };
  }
  if (secondAccepted) {
    return { type: "second", status: "accepted" };
  }

  if (firstShortlisted && secondShortlisted) {
    return { type: "both", status: "shortlisted" };
  }

  if (firstShortlisted) {
    return { type: "first", status: "shortlisted" };
  }
  if (secondShortlisted) {
    return { type: "second", status: "shortlisted" };
  }
  if (application.first_pref_status === "waitlisted") {
    return { type: "first", status: "waitlisted" };
  }
  if (application.second_pref_status === "waitlisted") {
    return { type: "second", status: "waitlisted" };
  }
  return { type: null, status: "pending" };
}

export async function getApplicationSettings() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("application_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching application settings:", error);
      return null;
    }

    return data as ApplicationSettings | null;
  } catch (err) {
    console.error("Error in getApplicationSettings:", err);
    return null;
  }
}

export async function getAllApplicationsForExport(departmentId?: string) {
  const supabase = createClient();

  try {
    let query = supabase
      .from("applications")
      .select(
        `
        *,
        first_dept:departments!applications_first_pref_dept_id_fkey(id, name),
        second_dept:departments!applications_second_pref_dept_id_fkey(id, name)
      `
      )
      .order("created_at", { ascending: false });

    if (departmentId) {
      query = query.or(
        `first_pref_dept_id.eq.${departmentId},second_pref_dept_id.eq.${departmentId}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching applications for export:", error);
      return [];
    }

    // Transform the data to include department names
    const transformedData = data.map((app) => ({
      ...app,
      dept_first_pref: app.first_dept?.name || "Unknown",
      dept_second_pref: app.second_dept?.name || "Unknown",
    }));

    return transformedData;
  } catch (err) {
    console.error("Error in getAllApplicationsForExport:", err);
    return [];
  }
}

export async function isCurrentUserRecruiter() {
  const supabase = createClient();

  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking if user is recruiter:", error);
      return false;
    }

    return data?.role === "recruiter";
  } catch (err) {
    console.error("Error in isCurrentUserRecruiter:", err);
    return false;
  }
}

export async function getDepartmentNameById(
  departmentId: string
): Promise<string | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .single();
    if (error) {
      console.error("Error fetching department name:", error);
      return null;
    }
    return data?.name ?? null;
  } catch (err) {
    console.error("Error in getDepartmentNameById:", err);
    return null;
  }
}

export async function changePassword(newPassword: string) {
  const supabase = createClient();
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session check timeout")), 10000)
    );

    const {
      data: { session },
      error: sessionError,
    } = (await Promise.race([sessionPromise, timeoutPromise])) as any;

    if (sessionError) {
      console.error("Session error:", sessionError);
      return { error: { message: "Session error. Please try again." } };
    }

    if (!session || !session.user) {
      console.error("No active session found");
      return { error: { message: "No active session. Please try again." } };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Supabase password update error:", error);
      return {
        error: { message: error.message || "Failed to update password" },
      };
    }
    return { error: null };
  } catch (err: any) {
    console.error("Unexpected error in changePassword:", err);
    if (err.message === "Session check timeout") {
      return {
        error: {
          message:
            "Session check timed out. Please refresh the page and try again.",
        },
      };
    }
    return { error: { message: "An unexpected error occurred" } };
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://join.hackclubvit.xyz/auth/callback`,
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error("Error sending reset password email:", err);
    return { error: err };
  }
}

export async function magicLinkLogin(email: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.error("Error sending magic link:", error);
      return { error };
    }
    return { data, error: null };
  } catch (err) {
    console.error("Error sending magic link:", err);
    return { error: err };
  }
}

// Add a new function for PKCE flow (if you want to use it)
export async function verifyTokenHash(tokenHash: string, type: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    });

    if (error) {
      console.error("Error verifying token hash:", error);
      return { error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error verifying token hash:", err);
    return { error: err };
  }
}

export async function getPanelsForRecruiter(departmentId: string) {
  const supabase = createClient();

  function normalizeUuid(str: string) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase();
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        cleaned
      )
    ) {
      return cleaned;
    }

    if (/^[0-9a-f]{32}$/.test(cleaned)) {
      return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(
        12,
        16
      )}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`;
    }
    return str;
  }

  function isUuid(str: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      str
    );
  }

  const normalizedId = normalizeUuid(departmentId);
  if (!isUuid(normalizedId)) {
    console.error("Invalid departmentId passed to getPanels:", departmentId);
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select("panel: recruitment_panel(id, name)")
      .eq("recruiter_id", normalizedId)
      .not("panel_id", "is", null);

    if (error) {
      console.error("Error fetching panels:", error);
      return [];
    }

    return data.map((e) => e.panel as unknown as { id: string; name: string });
  } catch (err) {
    console.error("Error in getPanels:", err);
    return [];
  }
}

export async function getPanelData(panel_id: string) {
  const supabase = createClient();

  const fields = "*";

  try {
    const { data: firstPref, error: error1 } = await supabase
      .from("recruitment_panel")
      .select(
        `*, applicants: applications!applications_first_pref_panel_id_fkey(${fields})`
      )
      .eq("id", panel_id)
      .single();

    if (error1) {
      console.error("Error fetching Panel Data: ", error1);
      return;
    }
    const { data: secPref, error: error2 } = await supabase
      .from("recruitment_panel")
      .select(
        `applicants: applications!applications_second_pref_panel_id_fkey(${fields})`
      )
      .eq("id", panel_id)
      .single();

    if (error2) {
      console.error("Error fetching Panel Data: ", error2);
      return;
    }

    const applicants1 = firstPref.applicants;
    const applicants2 = secPref.applicants;

    return {
      name: firstPref.name as string,
      meet_link: firstPref.meet_link as string,
      applicants: [...applicants1, ...applicants2],
      first_pref_count: applicants1.length,
      second_pref_count: applicants2.length,
      department_id: firstPref.department_id as string,
    };
  } catch (err) {
    console.error("Error in getPanelData: ", err);
    return;
  }
}

export async function checkIsEvaluatorOrRecruiter(
  panel_id: string
): Promise<boolean> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select()
      .eq("panel_id", panel_id);

    if (error) {
      console.error("Error in checkIsEvaluatorOrRecruiter: ", error);
      return false;
    }

    let allowed = false;

    for (const rec of data) {
      if (rec.recruiter_id === (await supabase.auth.getUser()).data.user?.id) {
        allowed = true;
        break;
      }
    }

    return allowed;
  } catch (e) {
    console.error("Error in checkIsEvaluatorOrRecruiter: ", e);
    return false;
  }
}

export async function updateOrCreateApplicantMark(
  application_id: string,
  department_id: string,
  marks: number,
  remarks: string
) {
  const supabase = createClient();

  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    console.log(userId);
    const { data, error } = await supabase
      .from("evaluations")
      .select()
      .eq("application_id", application_id)
      .eq("department_id", department_id)
      .eq("recruiter_id", userId)
      .select();

    if (error) {
      console.error("Error updating or creating applicant mark:", error);
      return false;
    }

    if (data.length > 0) {
      // Update existing mark
      const { error: updateError } = await supabase
        .from("evaluations")
        .update({
          score: marks,
          remarks: remarks,
        })
        .eq("id", data[0].id);

      if (updateError) {
        console.error("Error updating applicant mark:", updateError);
        return false;
      }
    } else {
      // Create new mark
      const { error: insertError } = await supabase.from("evaluations").insert({
        application_id: application_id,
        department_id: department_id,
        recruiter_id: userId,
        score: marks,
        remarks: remarks,
      });

      if (insertError) {
        console.error("Error creating applicant mark:", insertError);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Error in updateOrCreateApplicantMark:", err);
    throw false;
  }
}

export async function getApplicantMarkByRecruiter(
  application_id: string,
  department_id: string
): Promise<{ score: number; remarks: string } | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("score, remarks")
      .eq("application_id", application_id)
      .eq("department_id", department_id)
      .eq("recruiter_id", (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (error) {
      console.error("Error fetching applicant marks:", error);
      return null;
    }

    return data ? { score: data.score, remarks: data.remarks } : null;
  } catch (err) {
    console.error("Error in getApplicantMarks:", err);
    return null;
  }
}

export async function getApplicantMarks(
  application_id: string,
  department_id: string
): Promise<{ score: number; remarks: string; recruiter: any }[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("score, remarks, profile:profiles(full_name)")
      .eq("application_id", application_id)
      .eq("department_id", department_id);

    if (error) {
      console.error("Error fetching applicant marks:", error);
      return [];
    }

    return data.map((item) => ({
      score: item.score,
      remarks: item.remarks,
      recruiter: item.profile,
    }));
  } catch (err) {
    console.error("Error in getApplicantMarks:", err);
    return [];
  }
}

export const updateMeetLink = async (panel_id: string, meet_link: string) => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("recruitment_panel")
      .update({ meet_link })
      .eq("id", panel_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating meet link:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateMeetLink:", err);
    return false;
  }
};

export const getPanelByDepartment = async (department_id: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruitment_panel")
      .select()
      .eq("department_id", department_id);

    if (error) {
      console.error("Error fetching panel by department:", error);
      return [];
    }

    return data as { id: string; name: string; meet_link: string }[];
  } catch (err) {
    console.error("Error in getPanelByDepartment:", err);
    return [];
  }
};

export const createPanel = async (name: string, department_id: string) => {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("recruitment_panel").insert({
      name,
      department_id,
    });

    if (error) {
      console.error("Error creating panel:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in createPanel:", err);
    return false;
  }
};

export const getPanelMembers = async (panel_id: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select("profiles:profiles(id, full_name, email)")
      .eq("panel_id", panel_id);

    if (error) {
      console.error("Error fetching panel members:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.profiles.id,
      name: item.profiles.full_name,
      email: item.profiles.email,
    }));
  } catch (err) {
    console.error("Error in getPanelMembers:", err);
    return [];
  }
};

export const getRecruiterByDepartment = async (department_id: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select("recruiter_id, panel_id, profiles:profiles(full_name, email)")
      .eq("department_id", department_id);

    if (error) {
      console.error("Error fetching recruiters by department:", error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.recruiter_id,
      name: item.profiles.full_name,
      email: item.profiles.email,
      panel_id: item.panel_id,
    }));
  } catch (err) {
    console.error("Error in getRecruiterByDepartment:", err);
    return [];
  }
};

export const addRecruiterToPanel = async (
  recruiter_id: string,
  department_id: string,
  panel_id: string
) => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("recruiter_departments")
      .update({
        panel_id,
      })
      .eq("recruiter_id", recruiter_id)
      .eq("department_id", department_id);

    if (error) {
      console.error("Error adding recruiter to panel:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in addRecruiterToPanel:", err);
    return false;
  }
};

export const removeRecruiterFromPanel = async (
  recruiter_id: string,
  panel_id: string
) => {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("recruiter_departments")
      .update({
        panel_id: null,
      })
      .eq("recruiter_id", recruiter_id)
      .eq("panel_id", panel_id);

    if (error) {
      console.error("Error removing recruiter from panel:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in removeRecruiterFromPanel:", err);
    return false;
  }
};
