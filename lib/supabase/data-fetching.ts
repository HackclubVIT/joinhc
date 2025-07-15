import { createClient } from "@/lib/supabase/client"


export type Application = {
  id: string
  name: string
  register_no: string
  email: string
  applicant_id: string
  first_pref_dept_id: string
  first_pref_reason: string
  second_pref_dept_id: string
  second_pref_reason: string
  priority_reason: string
  portfolio_link: string | null
  status: "pending" | "shortlisted" | "waitlisted" | "rejected"
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  register_no: string | null
  role: "applicant" | "recruiter"
  email: string
  created_at: string
  updated_at: string
}

export type Department = {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type RecruiterDepartment = {
  id: string
  recruiter_id: string
  department_id: string
  created_at: string
  department?: Department
}

export type ApplicationSettings = {
  id: string
  deadline: string | null
  created_at: string
  updated_at: string
}


async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}


export async function getApplicationForUser() {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        first_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_dept:departments!applications_second_pref_dept_id_fkey(name)
      `)
      .eq("applicant_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching application:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("Error in getApplicationForUser:", err)
    return null
  }
}

export async function saveApplication(applicationData: {
  name: string
  register_no: string
  email: string
  first_pref_dept_id: string
  first_pref_reason: string
  second_pref_dept_id: string
  second_pref_reason: string
  priority_reason: string
  portfolio_link?: string
  status?: string
}) {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data: existingApp } = await supabase.from("applications").select("id").eq("applicant_id", user.id).single()

    const dataToSave = {
      applicant_id: user.id,
      ...applicationData,
      updated_at: new Date().toISOString(),
    }

    if (existingApp) {
      const { data, error } = await supabase
        .from("applications")
        .update(dataToSave)
        .eq("id", existingApp.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating application:", error)
        throw error
      }

      return data
    } else {
      const { data, error } = await supabase.from("applications").insert(dataToSave).select().single()

      if (error) {
        console.error("Error creating application:", error)
        throw error
      }

      return data
    }
  } catch (err) {
    console.error("Error in saveApplication:", err)
    throw err
  }
}

export async function getProfile(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", targetUserId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data as Profile | null
  } catch (err) {
    console.error("Error in getProfile:", err)
    return null
  }
}

export async function updateProfile(profileData: Partial<Profile>) {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Error in updateProfile:", err)
    throw err
  }
}

export async function getDepartments() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("departments").select("*").order("name")

    if (error) {
      console.error("Error fetching departments:", error)
      return []
    }

    return data as Department[]
  } catch (err) {
    console.error("Error in getDepartments:", err)
    return []
  }
}


export async function getRecruiterDepartments(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) return []
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from("recruiter_departments")
      .select(`
        *,
        department:departments(*)
      `)
      .eq("recruiter_id", targetUserId)

    if (error) {
      console.error("Error fetching recruiter departments:", error)
      return []
    }

    return data as RecruiterDepartment[]
  } catch (err) {
    console.error("Error in getRecruiterDepartments:", err)
    return []
  }
}


export async function assignDepartmentToRecruiter(recruiterId: string, departmentId: string) {
  const supabase = createClient()

  try {
    
    const isAdmin = await isCurrentUserRecruiter()
    if (!isAdmin) {
      throw new Error("Only recruiters can assign departments")
    }

    const { data, error } = await supabase
      .from("recruiter_departments")
      .insert({
        recruiter_id: recruiterId,
        department_id: departmentId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error assigning department:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Error in assignDepartmentToRecruiter:", err)
    throw err
  }
}


export async function removeDepartmentFromRecruiter(assignmentId: string) {
  const supabase = createClient()

  try {
    
    const isAdmin = await isCurrentUserRecruiter()
    if (!isAdmin) {
      throw new Error("Only recruiters can remove department assignments")
    }

    const { error } = await supabase.from("recruiter_departments").delete().eq("id", assignmentId)

    if (error) {
      console.error("Error removing department assignment:", error)
      throw error
    }

    return true
  } catch (err) {
    console.error("Error in removeDepartmentFromRecruiter:", err)
    throw err
  }
}


export async function getAllRecruiters() {
  const supabase = createClient()

  try {
    
    const isAdmin = await isCurrentUserRecruiter()
    if (!isAdmin) {
      throw new Error("Only recruiters can view all recruiters")
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "recruiter")
      .order("full_name")

    if (error) {
      console.error("Error fetching recruiters:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Error in getAllRecruiters:", err)
    return []
  }
}


export async function getAllUsers() {
  const supabase = createClient()

  try {
    
    const isAdmin = await isCurrentUserRecruiter()
    if (!isAdmin) {
      throw new Error("Only recruiters can view all users")
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, register_no")
      .order("role")
      .order("full_name")

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Error in getAllUsers:", err)
    return []
  }
}


export async function updateUserRole(userId: string, newRole: "applicant" | "recruiter") {
  const supabase = createClient()

  try {
    
    const isAdmin = await isCurrentUserRecruiter()
    if (!isAdmin) {
      throw new Error("Only recruiters can update user roles")
    }

    const { data, error } = await supabase.rpc("update_user_role", {
      user_id: userId,
      new_role: newRole,
    })

    if (error) {
      console.error("Error updating user role:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Error in updateUserRole:", err)
    throw err
  }
}

export async function getDepartmentApplicants(departmentId: string) {
  const supabase = createClient()

  function normalizeUuid(str: string) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase()
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(cleaned)) {
      return cleaned
    }
    
    if (/^[0-9a-f]{32}$/.test(cleaned)) {
      return `${cleaned.slice(0,8)}-${cleaned.slice(8,12)}-${cleaned.slice(12,16)}-${cleaned.slice(16,20)}-${cleaned.slice(20)}`
    }
    return str 
  }
  
  function isUuid(str: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
  }
  
  const normalizedId = normalizeUuid(departmentId)
  if (!isUuid(normalizedId)) {
    console.error("Invalid departmentId passed to getDepartmentApplicants:", departmentId)
    return []
  }

  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .or(`first_pref_dept_id.eq.${normalizedId},second_pref_dept_id.eq.${normalizedId}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching department applicants:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Error in getDepartmentApplicants:", err)
    return []
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select()
      .single()

    if (error) {
      console.error("Error updating application status:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Error in updateApplicationStatus:", err)
    throw err
  }
}

export async function getApplicationSettings() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("application_settings").select("*").single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching application settings:", error)
      return null
    }

    return data as ApplicationSettings | null
  } catch (err) {
    console.error("Error in getApplicationSettings:", err)
    return null
  }
}

export async function getAllApplicationsForExport(departmentId?: string) {
  const supabase = createClient()

  try {
    let query = supabase
      .from("applications")
      .select(`
        *,
        applicant:profiles!applications_applicant_id_fkey(full_name, register_no, email),
        first_dept:departments!applications_first_pref_dept_id_fkey(name),
        second_dept:departments!applications_second_pref_dept_id_fkey(name)
      `)
      .order("created_at", { ascending: false })

    if (departmentId) {
      query = query.or(`first_pref_dept_id.eq.${departmentId},second_pref_dept_id.eq.${departmentId}`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching applications for export:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Error in getAllApplicationsForExport:", err)
    return []
  }
}


export async function isCurrentUserRecruiter() {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error checking if user is recruiter:", error)
      return false
    }

    return data?.role === "recruiter"
  } catch (err) {
    console.error("Error in isCurrentUserRecruiter:", err)
    return false
  }
}


export async function getDepartmentNameById(departmentId: string): Promise<string | null> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .single()
    if (error) {
      console.error("Error fetching department name:", error)
      return null
    }
    return data?.name ?? null
  } catch (err) {
    console.error("Error in getDepartmentNameById:", err)
    return null
  }
}

export async function changePassword(newPassword: string) {
  const supabase = createClient()
  try {
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Session check timeout")), 10000)
    )
    
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any
    
    if (sessionError) {
      console.error("Session error:", sessionError)
      return { error: { message: "Session error. Please try again." } }
    }

    if (!session || !session.user) {
      console.error("No active session found")
      return { error: { message: "No active session. Please try again." } }
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error("Supabase password update error:", error)
      return { error: { message: error.message || "Failed to update password" } }
    }
    return { error: null }
  } catch (err: any) {
    console.error("Unexpected error in changePassword:", err)
    if (err.message === "Session check timeout") {
      return { error: { message: "Session check timed out. Please refresh the page and try again." } }
    }
    return { error: { message: "An unexpected error occurred" } }
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://join.hackclubvit.xyz/auth/callback`
    })

    if (error) {
      console.error("Error sending reset password email:", error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error("Error sending reset password email:", err)
    return { error: err }
  }
}

export async function magicLinkLogin(email: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false
      }
    })

    if (error) {
      console.error("Error sending magic link:", error)
      return { error }
    }
    return { data, error: null }
  } catch (err) {
    console.error("Error sending magic link:", err)
    return { error: err }
  }
}

// Add a new function for PKCE flow (if you want to use it)
export async function verifyTokenHash(tokenHash: string, type: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any
    })

    if (error) {
      console.error("Error verifying token hash:", error)
      return { error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Error verifying token hash:", err)
    return { error: err }
  }
}
