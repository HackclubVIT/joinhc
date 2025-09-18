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
    | "not_selected"
    | "accepted"
    | "rejected";
  second_pref_dept_id: string;
  second_pref_reason: string;
  second_pref_status:
    | "pending"
    | "shortlisted"
    | "not_selected"
    | "accepted"
    | "rejected";
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
  deadline_name: "application" | "shortlist";
  deadline: string | null;
  created_at: string;
  updated_at: string;
};


export type PanelTimeSlot = {
  id: string;
  panel_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type ApplicantTimeSlot = {
  id: string;
  applicant_id: string;
  panel_id: string;
  time_slot_id: string;
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
      .limit(1);

    if (error) {
      console.error("Error fetching application:", error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error("Error in getApplicationForUser:", err);
    return null;
  }
}


export async function getSelectedDepartmentForApplication(
  applicationId: string
): Promise<string | null> {
  const supabase = createClient();

  try {
    
    
    
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
  first_pref_status?: "pending" | "shortlisted" | "not_selected" | "accepted" | "rejected";
  second_pref_status?: "pending" | "shortlisted" | "not_selected" | "accepted" | "rejected";
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
      first_pref_status: applicationData.first_pref_status || "pending",
      second_pref_status: applicationData.second_pref_status || "pending",
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

export async function getRecruiterDepartments(recruiterId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select(
        `
        *,
        department:departments(id, name, description)
      `
      )
      .eq("recruiter_id", recruiterId);

    if (error) {
      console.error("Error fetching recruiter departments:", error);
      return [];
    }

    
    const processedData = data.map((item) => ({
      ...item,
      department_id: item.department?.id || item.department_id,
    }));

    return processedData as RecruiterDepartment[];
  } catch (err) {
    console.error("Error in getRecruiterDepartments:", err);
    return [];
  }
}

export async function getAssignedPanelsForRecruiter(recruiterId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select(
        `
        *,
        department:departments(id, name, description),
        panel:recruitment_panel(id, name, meet_link)
      `
      )
      .eq("recruiter_id", recruiterId)
      .not("panel_id", "is", null);

    if (error) {
      console.error("Error fetching assigned panels for recruiter:", error);
      return [];
    }

    
    const assignedPanels = data
      .filter((item) => item.panel)
      .map((item) => ({
        ...item.panel,
        department: item.department,
      }));

    return assignedPanels;
  } catch (err) {
    console.error("Error in getAssignedPanelsForRecruiter:", err);
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
    const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'recruiter')
    .order('full_name');
  if (error) throw error;
    return data;
}


export async function getAllDepartments() {
  const supabase = createClient();
    const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}


export async function assignRecruiterToDepartment(recruiterId: string, departmentId: string, role: 'recruiter' | 'evaluator') {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recruiter_departments')
    .insert({ recruiter_id: recruiterId, department_id: departmentId, role })
    .select()
    .single();
  if (error) throw error;
    return data;
}


export async function removeRecruiterFromDepartment(recruiterId: string, departmentId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('recruiter_departments')
    .delete()
    .eq('recruiter_id', recruiterId)
    .eq('department_id', departmentId);
  if (error) throw error;
  return true;
}

export async function getAllUsers() {
  const supabase = createClient();
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
    return data;
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'recruiter' | 'applicant') {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) throw error;
  return true;
    }

export async function createDepartment(name: string, description: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('departments').insert({ name, description }).select().single();
  if (error) throw error;
  return data;
  }

export async function getAllPanels() {
  const supabase = createClient();
  const { data, error } = await supabase.from('recruitment_panel').select('*');
  if (error) throw error;
  return data;
}



export async function assignRecruiterToPanel(recruiterId: string, departmentId: string, panelId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from('recruiter_departments').update({ panel_id: panelId }).eq('recruiter_id', recruiterId).eq('department_id', departmentId).select().single();
  if (error) throw error;
    return data;
}



export async function getShortlistedApplicantsByDepartment(departmentId: string) {
  const supabase = createClient();
    const { data, error } = await supabase
    .from('applications')
    .select('*')
    .or(
      `and(first_pref_dept_id.eq.${departmentId},first_pref_status.eq.shortlisted),and(second_pref_dept_id.eq.${departmentId},second_pref_status.eq.shortlisted)`
    );
  if (error) throw error;
  
  const normDeptId = String(departmentId).trim();
  const result = (data || []).map((a) => {
    let preference = null;
    const firstId = String(a.first_pref_dept_id).trim();
    const secondId = String(a.second_pref_dept_id).trim();
    if (firstId === normDeptId && a.first_pref_status === 'shortlisted') preference = 'first';
    if (secondId === normDeptId && a.second_pref_status === 'shortlisted') preference = preference ? 'both' : 'second';
    if (!preference) {
      
      
    }
    return { ...a, preference };
  });
  return result;
}


export async function getShortlistedApplicantsWithAssignmentStatus(departmentId: string, targetPanelId?: string) {
  const supabase = createClient();
  
  
  const { data: panels, error: panelsError } = await supabase
    .from('recruitment_panel')
    .select('id')
    .eq('department_id', departmentId);
  
  if (panelsError) throw panelsError;
  
  const panelIds = panels.map(p => p.id);
  
  
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .or(
      `and(first_pref_dept_id.eq.${departmentId},first_pref_status.eq.shortlisted),and(second_pref_dept_id.eq.${departmentId},second_pref_status.eq.shortlisted)`
    );
  
  if (error) throw error;
  
  const normDeptId = String(departmentId).trim();
  const result = (data || []).map((a) => {
    const firstId = String(a.first_pref_dept_id).trim();
    const secondId = String(a.second_pref_dept_id).trim();
    
    let preference = null;
    let isAssignedToAnyPanel = false;
    let isAssignedToTargetPanel = false;
    
    
    if (firstId === normDeptId && a.first_pref_status === 'shortlisted') {
      preference = 'first';
      if (a.first_pref_panel_id && panelIds.includes(a.first_pref_panel_id)) {
        isAssignedToAnyPanel = true;
        if (targetPanelId && a.first_pref_panel_id === targetPanelId) {
          isAssignedToTargetPanel = true;
        }
      }
    }
    
    
    if (secondId === normDeptId && a.second_pref_status === 'shortlisted') {
      if (preference) preference = 'both';
      else preference = 'second';
      
      if (a.second_pref_panel_id && panelIds.includes(a.second_pref_panel_id)) {
        isAssignedToAnyPanel = true;
        if (targetPanelId && a.second_pref_panel_id === targetPanelId) {
          isAssignedToTargetPanel = true;
        }
      }
    }
    
    return { 
      ...a, 
      preference,
      isAssignedToAnyPanel,
      isAssignedToTargetPanel
    };
  });
  
  return result;
}


export async function getUnassignedShortlistedApplicantsByDepartment(departmentId: string) {
  const applicants = await getShortlistedApplicantsWithAssignmentStatus(departmentId);
  return applicants.filter(a => !a.isAssignedToAnyPanel);
}

export async function assignApplicantToPanel(applicantId: string, panelId: string, preference: 'first' | 'second') {
  const supabase = createClient();
  const field = preference === 'first' ? 'first_pref_panel_id' : 'second_pref_panel_id';
  const { data, error } = await supabase.from('applications').update({ [field]: panelId }).eq('id', applicantId).select().single();
  if (error) throw error;
    return data;
}


export async function removeApplicantFromPanel(applicantId: string, preference: 'first' | 'second') {
  const supabase = createClient();
  const field = preference === 'first' ? 'first_pref_panel_id' : 'second_pref_panel_id';
  const { error } = await supabase
    .from('applications')
    .update({ [field]: null })
    .eq('id', applicantId);
  if (error) throw error;
  return true;
}



export async function getAllDeadlines() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("application_settings")
      .select("deadline_name, deadline")
      .in('deadline_name', ['application', 'shortlist']);

    if (error) {
      console.error("Error fetching deadlines:", error);
      return { applicationDeadline: null, shortlistDeadline: null };
    }

    const applicationDeadline = data?.find(d => d.deadline_name === 'application')?.deadline;
    const shortlistDeadline = data?.find(d => d.deadline_name === 'shortlist')?.deadline;

    return {
      applicationDeadline: applicationDeadline ? { deadline: applicationDeadline } : null,
      shortlistDeadline: shortlistDeadline ? { deadline: shortlistDeadline } : null
    };
  } catch (err) {
    console.error("Error in getAllDeadlines:", err);
    return { applicationDeadline: null, shortlistDeadline: null };
  }
}

export async function getApplicationDeadline() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('application_settings')
    .select('deadline')
    .eq('deadline_name', 'application')
    .single();
  if (error) return null;
  return data;
}


export async function getShortlistDeadline() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('application_settings')
    .select('deadline')
    .eq('deadline_name', 'shortlist')
    .single();
  if (error) return null;
  return data;
}


export function getOverallApplicationStatus(
  application: Application
): "pending" | "shortlisted" | "rejected" | "accepted" | "not_selected" {
  

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

  


  
  if (
    application.first_pref_status === "rejected" ||
    application.second_pref_status === "rejected"
  ) {
    return "rejected";
  }

  if (
    application.first_pref_status === "not_selected" &&
    application.second_pref_status === "not_selected"
  ) {
    return "not_selected";
  }

  
  return "pending";
}


export function getPreferenceSelectionInfo(application: Application): {
  type: "first" | "second" | "both" | null;
  status: string;
} {
  const firstAccepted = application.first_pref_status === "accepted";
  const secondAccepted = application.second_pref_status === "accepted";

  const firstShortlisted = application.first_pref_status === "shortlisted";
  const secondShortlisted = application.second_pref_status === "shortlisted";

  const firstNotSelected = application.first_pref_status === "not_selected";
  const secondNotSelected = application.second_pref_status === "not_selected";

  const firstRejected = application.first_pref_status === "rejected";
  const secondRejected = application.second_pref_status === "rejected";

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

  if (firstRejected && secondRejected) {
    return { type: "both", status: "rejected" };
  }

  if (firstRejected) {
    return { type: "first", status: "rejected" };
  }
  if (secondRejected) {
    return { type: "second", status: "rejected" };
  }

  if (firstNotSelected && secondNotSelected) {
    return { type: "both", status: "not_selected" };
  }

  if (firstNotSelected) {
    return { type: "first", status: "not_selected" };
  }
  if (secondNotSelected) {
    return { type: "second", status: "not_selected" };
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


export async function isCurrentUserRecruiterOrEvaluator(): Promise<boolean> {
  const supabase = createClient();

  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("recruiter_departments")
      .select("role")
      .eq("recruiter_id", user.id)
      .limit(1);

    if (error) {
      console.error("Error checking if user is recruiter or evaluator:", error);
      return false;
    }

    
    return data && data.length > 0;
  } catch (err) {
    console.error("Error in isCurrentUserRecruiterOrEvaluator:", err);
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


export async function getPanelsForUser(userId: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruiter_departments")
      .select("panel: recruitment_panel(id, name)")
      .eq("recruiter_id", userId)
      .not("panel_id", "is", null);

    if (error) {
      console.error("Error fetching panels for user:", error);
      return [];
    }

    return data.map((e) => e.panel as unknown as { id: string; name: string });
  } catch (err) {
    console.error("Error in getPanelsForUser:", err);
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


export async function getApplicantAverageMarks(
  application_id: string,
  department_id: string
): Promise<{ average: number; totalMarks: number; totalEvaluators: number } | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select("score")
      .eq("application_id", application_id)
      .eq("department_id", department_id);

    if (error) {
      console.error("Error fetching applicant average marks:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const totalMarks = data.reduce((sum, item) => sum + item.score, 0);
    const totalEvaluators = data.length;
    const average = totalMarks / totalEvaluators;

    return {
      average: Math.round(average * 100) / 100, 
      totalMarks,
      totalEvaluators
    };
  } catch (err) {
    console.error("Error in getApplicantAverageMarks:", err);
    return null;
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

export const getMeetLinkByPanelId = async (panel_id: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("recruitment_panel")
      .select("meet_link")
      .eq("id", panel_id)
      .single();

    if (error) {
      console.error("Error fetching meet link by panel ID:", error);
      return null;
    }

    return data?.meet_link || null;
  } catch (err) {
    console.error("Error in getMeetLinkByPanelId:", err);
    return null;
  }
};


export const getMeetLinksByPanelIds = async (firstPanelId: string | null, secondPanelId: string | null) => {
  const supabase = createClient();

  try {
    const panelIds = [firstPanelId, secondPanelId].filter(Boolean);
    
    if (panelIds.length === 0) {
      return { first: null, second: null };
    }

    const { data, error } = await supabase
      .from("recruitment_panel")
      .select("id, meet_link")
      .in("id", panelIds);

    if (error) {
      console.error("Error fetching meet links:", error);
      return { first: null, second: null };
    }

    const firstLink = data?.find(p => p.id === firstPanelId)?.meet_link || null;
    const secondLink = data?.find(p => p.id === secondPanelId)?.meet_link || null;

    return { first: firstLink, second: secondLink };
  } catch (err) {
    console.error("Error in getMeetLinksByPanelIds:", err);
    return { first: null, second: null };
  }
};

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
    
    const [appDeadline, shortlistDeadline] = await Promise.all([
      getApplicationDeadline(),
      getShortlistDeadline(),
    ]);

    const now = new Date();
    const appDeadlineDate = appDeadline?.deadline ? new Date(appDeadline.deadline) : null;
    const shortlistDeadlineDate = shortlistDeadline?.deadline ? new Date(shortlistDeadline.deadline) : null;

    let statusFilter: string[] = [];

    if (appDeadlineDate && shortlistDeadlineDate) {
      if (now < appDeadlineDate) {
        
        statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
      } else if (now < shortlistDeadlineDate) {
        
        statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
      } else {
        
        statusFilter = ['shortlisted', 'accepted', 'rejected'];
      }
    } else {
      
      statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .or(
        `and(first_pref_dept_id.eq.${normalizedId},first_pref_status.in.(${statusFilter.join(',')})),and(second_pref_dept_id.eq.${normalizedId},second_pref_status.in.(${statusFilter.join(',')}))`
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


export async function getDepartmentApplicantsOptimized(
  departmentId: string, 
  appDeadline: { deadline: string } | null,
  shortlistDeadline: { deadline: string } | null
) {
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
      "Invalid departmentId passed to getDepartmentApplicantsOptimized:",
      departmentId
    );
    return [];
  }

  try {
    
    const now = new Date();
    const appDeadlineDate = appDeadline?.deadline ? new Date(appDeadline.deadline) : null;
    const shortlistDeadlineDate = shortlistDeadline?.deadline ? new Date(shortlistDeadline.deadline) : null;

    let statusFilter: string[] = [];

    if (appDeadlineDate && shortlistDeadlineDate) {
      if (now < appDeadlineDate) {
        statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
      } else if (now < shortlistDeadlineDate) {
        statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
      } else {
        statusFilter = ['shortlisted', 'accepted', 'rejected'];
      }
    } else {
      statusFilter = ['pending', 'shortlisted', 'not_selected', 'accepted', 'rejected'];
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .or(
        `and(first_pref_dept_id.eq.${normalizedId},first_pref_status.in.(${statusFilter.join(',')})),and(second_pref_dept_id.eq.${normalizedId},second_pref_status.in.(${statusFilter.join(',')}))`
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching department applicants:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error in getDepartmentApplicantsOptimized:", err);
    return [];
  }
}

export async function updateRecruiterDepartmentRole(recruiterId: string, departmentId: string, newRole: 'recruiter' | 'evaluator') {
  const supabase = createClient();
  const { error } = await supabase
    .from('recruiter_departments')
    .update({ role: newRole })
    .eq('recruiter_id', recruiterId)
    .eq('department_id', departmentId);
  if (error) throw error;
  return true;
}


export async function isCurrentUserRecruiterForDepartment(departmentId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('recruiter_departments')
      .select('role')
      .eq('recruiter_id', user.id)
      .eq('department_id', departmentId)
      .single();

    if (error) {
      console.error('Error checking user role for department:', error);
      return false;
    }

    
    return data?.role === 'recruiter';
  } catch (err) {
    console.error('Error in isCurrentUserRecruiterForDepartment:', err);
    return false;
  }
}
export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  preference: "first" | "second"
) {
  const supabase = createClient();

  try {
    
    const resultsPublished = await areResultsPublished();
    if (resultsPublished) {
      throw new Error('Cannot update application status after results have been published');
    }

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


export async function assignApplicantsToPanels(departmentId: string, panelIds: string[], applicantIds: string[], preference: 'first' | 'second') {
  const supabase = createClient();
  if (panelIds.length === 0 || applicantIds.length === 0) return;
  const field = preference === 'first' ? 'first_pref_panel_id' : 'second_pref_panel_id';
  
  const updates = applicantIds.map((applicantId, i) => ({
    id: applicantId,
    [field]: panelIds[i % panelIds.length],
  }));
  const { error } = await supabase.from('applications').upsert(updates, { onConflict: 'id' });
  if (error) throw error;
  return true;
}


export async function rebalanceApplicantsAcrossPanels(departmentId: string, panelIds: string[], preference: 'first' | 'second') {
  const supabase = createClient();
  const field = preference === 'first' ? 'first_pref_panel_id' : 'second_pref_panel_id';
  
  const { data: applicants, error } = await supabase
    .from('applications')
    .select('id')
    .or(`${preference}_pref_dept_id.eq.${departmentId}`)
    .in(`${preference}_pref_status`, ['shortlisted']);
  if (error) throw error;
  if (!applicants || applicants.length === 0) return;
  const applicantIds = applicants.map((a) => a.id);
  return assignApplicantsToPanels(departmentId, panelIds, applicantIds, preference);
}


export async function getPanelTimeSlots(panelId: string): Promise<PanelTimeSlot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('panel_time_slots')
    .select('*')
    .eq('panel_id', panelId)
    .order('start_time');
  if (error) throw error;
  return data;
}

export async function getPanelTimeSlotsWithBookingStatus(panelId: string): Promise<(PanelTimeSlot & { isBooked: boolean; bookedBy?: string; bookedByName?: string })[]> {
  const supabase = createClient();
  
  
  const { data: slots, error: slotsError } = await supabase
    .from('panel_time_slots')
    .select('*')
    .eq('panel_id', panelId)
    .order('start_time');
  if (slotsError) throw slotsError;
  
  
  const { data: bookings, error: bookingsError } = await supabase
    .from('applicant_time_slot')
    .select('time_slot_id, applicant_id')
    .eq('panel_id', panelId);
  if (bookingsError) throw bookingsError;
  
  
  const applicantIds = bookings.map((b: any) => b.applicant_id);
  let applicantNames: { [key: string]: string } = {};
  
  if (applicantIds.length > 0) {
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('applicant_id, name')
      .in('applicant_id', applicantIds);
    if (applicationsError) throw applicationsError;
    
    applicantNames = applications.reduce((acc: any, app: any) => {
      acc[app.applicant_id] = app.name;
      return acc;
    }, {});
  }
  
  
  const bookedSlots = new Map(bookings.map((b: any) => [
    b.time_slot_id, 
    { 
      applicantId: b.applicant_id, 
      applicantName: applicantNames[b.applicant_id] || 'Unknown'
    }
  ]));
  
  
  return slots.map((slot: any) => {
    const booking = bookedSlots.get(slot.id);
    return {
      ...slot,
      isBooked: bookedSlots.has(slot.id),
      bookedBy: booking?.applicantId || undefined,
      bookedByName: booking?.applicantName || undefined
    };
  });
}

export async function isTimeSlotAvailable(timeSlotId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applicant_time_slot')
    .select('id')
    .eq('time_slot_id', timeSlotId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !data; 
}

export async function createPanelTimeSlot(panelId: string, start_time: string, end_time: string): Promise<PanelTimeSlot> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('panel_time_slots')
    .insert({ panel_id: panelId, start_time, end_time })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePanelTimeSlot(timeSlotId: string, start_time: string, end_time: string): Promise<PanelTimeSlot> {
  const supabase = createClient();
  
  
  const { data: slotCheck, error: slotError } = await supabase
    .from('panel_time_slots')
    .select('start_time')
    .eq('id', timeSlotId)
    .single();
  
  if (slotError) throw new Error('Time slot not found');
  
  
  const { data: booking, error: bookingError } = await supabase
    .from('applicant_time_slot')
    .select('id')
    .eq('time_slot_id', timeSlotId)
    .single();
  
  
  if (booking && !bookingError) {
    const now = new Date();
    const slotStartTime = new Date(slotCheck.start_time);
    const isExpired = now >= slotStartTime;
    
    if (isExpired) {
      throw new Error('Cannot edit booked slot that has already passed');
    }
  }
  
  
  const { data, error } = await supabase
    .from('panel_time_slots')
    .update({ start_time, end_time, updated_at: new Date().toISOString() })
    .eq('id', timeSlotId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePanelTimeSlot(timeSlotId: string): Promise<boolean> {
  const supabase = createClient();
  
  
  const { data: slotCheck, error: slotError } = await supabase
    .from('panel_time_slots')
    .select('start_time')
    .eq('id', timeSlotId)
    .single();
  
  if (slotError) throw new Error('Time slot not found');
  
  
  const { data: booking, error: bookingError } = await supabase
    .from('applicant_time_slot')
    .select('id')
    .eq('time_slot_id', timeSlotId)
    .single();
  
  
  if (booking && !bookingError) {
    const now = new Date();
    const slotStartTime = new Date(slotCheck.start_time);
    const isExpired = now >= slotStartTime;
    
    if (isExpired) {
      throw new Error('Cannot delete booked slot that has already passed');
    }
  }
  
  
  const { error } = await supabase
    .from('panel_time_slots')
    .delete()
    .eq('id', timeSlotId);
  if (error) throw error;
  return true;
}


export async function getAvailableTimeSlotsForPanel(panelId: string): Promise<PanelTimeSlot[]> {
  const supabase = createClient();
  
  const { data: allSlots, error: slotsError } = await supabase
    .from('panel_time_slots')
    .select('*')
    .eq('panel_id', panelId)
    .order('start_time');
  if (slotsError) throw slotsError;
  
  const { data: booked, error: bookedError } = await supabase
    .from('applicant_time_slot')
    .select('time_slot_id');
  if (bookedError) throw bookedError;
  const bookedIds = new Set(booked.map((b: any) => b.time_slot_id));
  
  return allSlots.filter((slot: any) => !bookedIds.has(slot.id));
}

export async function getApplicantTimeSlot(applicantId: string, panelId: string): Promise<any | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('applicant_time_slot')
    .select('*, panel_time_slots(start_time, end_time)')
    .eq('applicant_id', applicantId)
    .eq('panel_id', panelId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  return {
    ...data,
    start_time: data.panel_time_slots?.start_time,
    end_time: data.panel_time_slots?.end_time,
  };
}

export async function bookApplicantTimeSlot(applicantId: string, panelId: string, timeSlotId: string): Promise<ApplicantTimeSlot> {
  const supabase = createClient();
  
  
  const { data: slotData, error: slotError } = await supabase
    .from('panel_time_slots')
    .select('start_time, end_time')
    .eq('id', timeSlotId)
    .single();
  
  if (slotError) throw new Error('Time slot not found');
  
  
  const { data: timeCheck, error: timeError } = await supabase
    .rpc('is_slot_expired', { slot_id: timeSlotId });
  
  if (timeError) {
    
    
    console.warn('is_slot_expired function not available, skipping time check:', timeError);
  } else if (timeCheck) {
    throw new Error('Time slot has already passed');
  }
  
  
  const { data: deptData, error: deptError } = await supabase
    .from('recruitment_panel')
    .select('department_id')
    .eq('id', panelId)
    .single();
  
  if (deptError) throw new Error('Panel not found');
  
  
  const { data: appData, error: appError } = await supabase
    .from('applications')
    .select('id')
    .eq('applicant_id', applicantId)
    .single();
  
  if (appError) throw new Error('Application not found');
  
  const isEvaluated = await isApplicantEvaluated(appData.id, deptData.department_id);
  if (isEvaluated) {
    throw new Error('Cannot book slot - interview already completed and evaluated');
  }
  
  
  const isAvailable = await isTimeSlotAvailable(timeSlotId);
  if (!isAvailable) {
    throw new Error('Time slot is already booked by another applicant');
  }
  
  
  const { data: existingBooking, error: checkError } = await supabase
    .from('applicant_time_slot')
    .select('id')
    .eq('applicant_id', applicantId)
    .eq('panel_id', panelId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') throw checkError;
  
  if (existingBooking) {
    throw new Error('You already have a booking for this panel');
  }
  
  
  const { data, error } = await supabase
    .from('applicant_time_slot')
    .insert({ 
      applicant_id: applicantId, 
      panel_id: panelId, 
      time_slot_id: timeSlotId, 
      updated_at: new Date().toISOString() 
    })
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') { 
      throw new Error('Time slot was just booked by another applicant');
    }
    throw error;
  }
  
  return data;
}

export async function cancelApplicantTimeSlot(applicantId: string, panelId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('applicant_time_slot')
    .delete()
    .eq('applicant_id', applicantId)
    .eq('panel_id', panelId);
  if (error) throw error;
  return true;
}

export async function updateApplicationDeadline(deadlineName: string, newDeadline: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('application_settings')
    .update({ deadline: newDeadline, updated_at: new Date().toISOString() })
    .eq('deadline_name', deadlineName);
  if (error) throw error;
  return true;
}

export async function getResultsPublicationDeadline() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('application_settings')
    .select('deadline')
    .eq('deadline_name', 'results_publication')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data?.deadline ? new Date(data.deadline) : null;
}

export async function areResultsPublished(): Promise<boolean> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('application_settings')
      .select('deadline')
      .eq('deadline_name', 'results_publication')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking results publication status:', error);
      return false;
    }
    
    if (!data?.deadline) return false;
    
    const publicationDate = new Date(data.deadline);
    const now = new Date();
    
    return now >= publicationDate;
  } catch (err) {
    console.error('Error in areResultsPublished:', err);
    return false;
  }
}

export async function publishResults() {
  const supabase = createClient();
  const { error } = await supabase
    .from('application_settings')
    .update({ 
      deadline: new Date().toISOString(), 
      updated_at: new Date().toISOString() 
    })
    .eq('deadline_name', 'results_publication');
  
  if (error) throw error;
  return true;
}

export async function isApplicantAssignedToPanel(applicantId: string, preference: 'first' | 'second'): Promise<boolean> {
  const supabase = createClient();
  
  const { data: application, error } = await supabase
    .from('applications')
    .select('first_pref_panel_id, second_pref_panel_id')
    .eq('applicant_id', applicantId)
    .single();
    
  if (error) {
    console.error('Error checking panel assignment:', error);
    return false;
  }
  
  if (preference === 'first') {
    return !!application?.first_pref_panel_id;
  } else {
    return !!application?.second_pref_panel_id;
  }
}

export async function isApplicantEvaluated(applicationId: string, departmentId: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('id')
      .eq('application_id', applicationId)
      .eq('department_id', departmentId);

    if (error) {
      console.error('Error checking applicant evaluation:', error);
      return false;
    }

    
    return evaluations && evaluations.length > 0;
  } catch (error) {
    console.error('Error checking applicant evaluation:', error);
    return false;
  }
}

export async function getShortlistedApplicantsForExport() {
  const supabase = createClient();
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        first_pref_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_pref_dept:departments!applications_second_pref_dept_id_fkey(name)
      `)
      .or('first_pref_status.eq.shortlisted,second_pref_status.eq.shortlisted');

    if (error) {
      console.error('Error fetching shortlisted applicants:', error);
      throw error;
    }

    return applications || [];
  } catch (error) {
    console.error('Error in getShortlistedApplicantsForExport:', error);
    throw error;
  }
}

export async function getAcceptedApplicantsForExport() {
  const supabase = createClient();
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        first_pref_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_pref_dept:departments!applications_second_pref_dept_id_fkey(name)
      `)
      .or('first_pref_status.eq.accepted,second_pref_status.eq.accepted');

    if (error) {
      console.error('Error fetching accepted applicants:', error);
      throw error;
    }

    return applications || [];
  } catch (error) {
    console.error('Error in getAcceptedApplicantsForExport:', error);
    throw error;
  }
}

export async function getPendingApplicantsForExport() {
  const supabase = createClient();
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        first_pref_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_pref_dept:departments!applications_second_pref_dept_id_fkey(name)
      `)
      .or('first_pref_status.eq.pending,second_pref_status.eq.pending');

    if (error) {
      console.error('Error fetching pending applicants:', error);
      throw error;
    }

    return applications || [];
  } catch (error) {
    console.error('Error in getPendingApplicantsForExport:', error);
    throw error;
  }
}


export async function getRecruiterDashboardDataOptimized(
  recruiterId: string,
  appDeadline: { deadline: string } | null,
  shortlistDeadline: { deadline: string } | null
) {
  const supabase = createClient();

  try {
    
    const { data: recruiterDepts, error: deptError } = await supabase
      .from("recruiter_departments")
      .select(`
        *,
        department:departments(id, name, description)
      `)
      .eq("recruiter_id", recruiterId);

    if (deptError) {
      console.error("Error fetching recruiter departments:", deptError);
      return { departments: [], panels: [] };
    }

    if (!recruiterDepts || recruiterDepts.length === 0) {
      return { departments: [], panels: [] };
    }

    
    const departmentIds = recruiterDepts
      .map(dept => dept.department?.id || dept.department_id)
      .filter(Boolean);

    
    let applicationsQuery = supabase
      .from('applications')
      .select('*')
      .or(
        departmentIds.map(id => 
          `first_pref_dept_id.eq.${id},second_pref_dept_id.eq.${id}`
        ).join(',')
      );

    
    if (appDeadline) {
      applicationsQuery = applicationsQuery.lte('created_at', appDeadline.deadline);
    }

    const { data: allApplications, error: appError } = await applicationsQuery;

    if (appError) {
      console.error("Error fetching applications:", appError);
      return { departments: [], panels: [] };
    }

    
    const { data: userPanelData, error: userPanelError } = await supabase
      .from("recruiter_departments")
      .select("panel: recruitment_panel(id, name)")
      .eq("recruiter_id", recruiterId)
      .not("panel_id", "is", null);

    let panels: any[] = [];
    if (!userPanelError && userPanelData) {
      panels = userPanelData.map((e) => e.panel as unknown as { id: string; name: string }).filter(Boolean);
    }

    
    const departmentStats = recruiterDepts.map(dept => {
      const deptId = dept.department?.id || dept.department_id;
      const deptApplications = (allApplications || []).filter(app => 
        app.first_pref_dept_id === deptId || app.second_pref_dept_id === deptId
      );

      
      const totalApplicants = deptApplications.length;
      const firstPrefCount = deptApplications.filter(app => app.first_pref_dept_id === deptId).length;
      const secondPrefCount = deptApplications.filter(app => app.second_pref_dept_id === deptId).length;

      let pendingCount = 0;
      let shortlistedCount = 0;
      let rejectedCount = 0;
      let acceptedCount = 0;

      deptApplications.forEach(app => {
        const isFirstPref = app.first_pref_dept_id === deptId;
        const isSecondPref = app.second_pref_dept_id === deptId;

        let status = null;
        if (isFirstPref) {
          status = app.first_pref_status;
        } else if (isSecondPref) {
          status = app.second_pref_status;
        }

        if (status) {
          switch (status) {
            case "pending":
              pendingCount++;
              break;
            case "shortlisted":
              shortlistedCount++;
              break;
            case "rejected":
            case "not_selected":
              rejectedCount++;
              break;
            case "accepted":
              acceptedCount++;
              break;
          }
        }
      });

      return {
        id: deptId,
        name: dept.department?.name || "Unknown Department",
        role: dept.role,
        totalApplicants,
        firstPrefCount,
        secondPrefCount,
        pendingCount,
        shortlistedCount,
        rejectedCount,
        acceptedCount,
        panel_id: dept.panel_id
      };
    });

    return {
      departments: departmentStats,
      panels: panels || []
    };

  } catch (error) {
    console.error("Error in getRecruiterDashboardDataOptimized:", error);
    return { departments: [], panels: [] };
  }
}