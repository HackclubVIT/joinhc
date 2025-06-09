import { createClient } from "@/lib/supabase/client"

// Type definitions matching your database schema
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

// Helper function to get current user
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

// Data fetching functions
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

    // Check if application already exists
    const { data: existingApp } = await supabase.from("applications").select("id").eq("applicant_id", user.id).single()

    const dataToSave = {
      applicant_id: user.id,
      ...applicationData,
      updated_at: new Date().toISOString(),
    }

    if (existingApp) {
      // Update existing application
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
      // Insert new application
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

// Updated to work with recruiter_id based recruiter departments
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

// New function to assign department to recruiter
export async function assignDepartmentToRecruiter(recruiterId: string, departmentId: string) {
  const supabase = createClient()

  try {
    // Check if user is a recruiter or admin
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

// New function to remove department assignment
export async function removeDepartmentFromRecruiter(assignmentId: string) {
  const supabase = createClient()

  try {
    // Check if user is a recruiter or admin
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

// New function to get all recruiters
export async function getAllRecruiters() {
  const supabase = createClient()

  try {
    // Check if user is a recruiter or admin
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

// New function to get all users for admin purposes
export async function getAllUsers() {
  const supabase = createClient()

  try {
    // Check if user is a recruiter or admin
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

// Updated function to update user role
export async function updateUserRole(userId: string, newRole: "applicant" | "recruiter") {
  const supabase = createClient()

  try {
    // Check if user is a recruiter or admin
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

  // Normalize departmentId: remove spaces, convert to lowercase, add hyphens if needed
  function normalizeUuid(str: string) {
    const cleaned = str.replace(/\s+/g, "").toLowerCase()
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(cleaned)) {
      return cleaned
    }
    // Try to insert hyphens if missing (32 chars)
    if (/^[0-9a-f]{32}$/.test(cleaned)) {
      return `${cleaned.slice(0,8)}-${cleaned.slice(8,12)}-${cleaned.slice(12,16)}-${cleaned.slice(16,20)}-${cleaned.slice(20)}`
    }
    return str // fallback
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

// Helper function to check if current user is a recruiter
export async function isCurrentUserRecruiter() {
  const supabase = createClient()

  try {
    const user = await getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase.rpc("is_recruiter", { user_id: user.id })

    if (error) {
      console.error("Error checking if user is recruiter:", error)
      return false
    }

    return data
  } catch (err) {
    console.error("Error in isCurrentUserRecruiter:", err)
    return false
  }
}

// Fetch department name by department id
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
