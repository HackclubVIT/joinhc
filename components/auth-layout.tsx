"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User, Settings, Menu, Bell, Sparkles, Home, FileText, UserCircle, ChevronDown, X, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { HackClubLogo } from "@/components/hackclub-logo"
import { getRecruiterDepartments, getPanelByDepartment, isCurrentUserRecruiterOrEvaluator, getShortlistDeadline } from "@/lib/supabase/data-fetching";
interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const { user, userRole, signOut } = useAuth()

  const [recruiterDepartments, setRecruiterDepartments] = React.useState<any[]>([]);
  const [recruiterPanels, setRecruiterPanels] = React.useState<any[]>([]);
  const [hasRecruiterRole, setHasRecruiterRole] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isShortlistingDeadlineOver, setIsShortlistingDeadlineOver] = React.useState(false);

  React.useEffect(() => {
    const fetchDepartmentsAndPanels = async () => {
      if (user?.id) {
        
        const hasRole = await isCurrentUserRecruiterOrEvaluator();
        setHasRecruiterRole(hasRole);
        
        if (hasRole) {
          const shortlistDeadline = await getShortlistDeadline();
          if (shortlistDeadline?.deadline) {
            const deadlineDate = new Date(shortlistDeadline.deadline);
            const currentDate = new Date();
            setIsShortlistingDeadlineOver(currentDate > deadlineDate);
          }
          
          const depts = await getRecruiterDepartments(user.id);
          setRecruiterDepartments(depts);
          
          const allPanels: any[] = [];
          for (const dept of depts) {
            const panels = await getPanelByDepartment(dept.department_id);
            if (panels && panels.length > 0) {
              for (const panel of panels) {
                allPanels.push({ ...panel, department: dept.department });
              }
            }
          }
          setRecruiterPanels(allPanels);
        } else {
          setRecruiterDepartments([]);
          setRecruiterPanels([]);
        }
      } else {
        setRecruiterDepartments([]);
        setRecruiterPanels([]);
        setHasRecruiterRole(false);
      }
    };
    fetchDepartmentsAndPanels();
  }, [user]);

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex min-h-screen flex-col hackclub-bg">
      {/* Modern Futuristic Navbar with Red Theme */}
      <header className="sticky top-0 z-50 border-b border-border/20 backdrop-blur-xl">
        {/* Animated red background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse opacity-50"></div>

        {/* Main navbar content */}
        <div className="relative">
          <div className="max-w-full mx-auto px-4 sm:px-6">
            <div className="flex h-20 items-center justify-between">
              {/* Left section - Logo and Navigation */}
              <div className="flex items-center gap-6 lg:gap-8">
                {/* Logo with enhanced red styling */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 transition-all duration-300 blur-sm"></div>
                  <HackClubLogo
                    size="md"
                    href={hasRecruiterRole ? "/dashboard/recruiter" : "/dashboard"}
                    className="relative z-10"
                  />
                </div>

                {/* Navigation Pills with Red Theme */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                  {userRole === "applicant" ? (
                    <>
                      <Link href="/dashboard">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${isActive("/dashboard")
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                          </div>
                          {isActive("/dashboard") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
                      <Link href="/application">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${isActive("/application")
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <FileText className="h-4 w-4" />
                            <span>Application</span>
                          </div>
                          {isActive("/application") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
                    </>
                  ) : hasRecruiterRole ? (
                    <>
                      <Link href="/dashboard/recruiter">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${isActive("/dashboard/recruiter")
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                          </div>
                          {isActive("/dashboard/recruiter") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
                      {recruiterDepartments && recruiterDepartments.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild >
                            <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 font-semibold cursor-pointer select-none flex items-center gap-2`}>
                              Departments
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {recruiterDepartments.map((dept: any) => (
                              <DropdownMenuItem asChild key={dept.department_id}>
                                <Link href={`/dashboard/recruiter/${dept.department_id}`}>{dept.department?.name || dept.department_id}</Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      {isShortlistingDeadlineOver && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${isActive('/dashboard/recruiter/panel')
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                              } font-semibold cursor-pointer select-none flex items-center gap-2`}>
                              Panels
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {recruiterPanels.map((panel: any) => (
                              <DropdownMenuItem asChild key={panel.id}>
                                <Link href={`/dashboard/recruiter/panel/${panel.id}`}>{panel.name}{panel.department?.name ? ` (${panel.department.name})` : ''}</Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ) : (userRole === "admin" &&
                    <>
                      <Link href="/admin">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${isActive("/admin")
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <Home className="h-4 w-4" />
                            <span>Dashboard</span>
                          </div>
                          {isActive("/admin") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300  font-semibold cursor-pointer select-none flex items-center gap-2`}>
                            Manage
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem asChild>
                            <Link href="/admin/users">Users</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/departments">Departments</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/panels">Panels</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/recruiters">Recruiters</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin/results">Results</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </nav>
              </div>

              {/* Right section - Status, Notifications, and User Menu */}
              <div className="flex items-center gap-3 lg:gap-4">
                {/* User Role Badge with Red Theme */}
                {userRole && (
                  <div className="hidden lg:flex items-center">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-red-500 to-red-600 rounded-full opacity-30 group-hover:opacity-50 transition-all duration-300 blur-sm"></div>
                      <div className="relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-red-400 animate-pulse" />
                        <span className="text-sm font-semibold text-red-400">
                          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}


                {/* User Avatar Dropdown with Red Theme */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="relative group cursor-pointer">
                      <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-red-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-all duration-300 blur-sm"></div>
                      <div className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-105 transition-all duration-300 border border-red-500/30">
                        <User className="h-5 w-5 lg:h-6 lg:w-6 text-primary-foreground" />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-72 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2 mt-2"
                  >
                    {/* User Info Header with Red Accent */}
                    <DropdownMenuLabel className="font-normal p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none text-foreground truncate max-w-[180px]">
                            {user?.email}
                          </p>
                          {userRole && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                              <span className="text-xs text-red-400 font-medium">
                                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-border/50 my-2" />

                    {/* Menu Items */}
                    <DropdownMenuItem asChild className="p-0 m-1">
                      <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-all duration-300 cursor-pointer group">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-foreground group-hover:text-blue-400 transition-colors">Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="p-0 m-1">
                      <Link href="/profile/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/80 transition-all duration-300 cursor-pointer group">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                          <Settings className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-foreground group-hover:text-purple-400 transition-colors">Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-border/50 my-2" />

                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="p-0 m-1"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all duration-300 cursor-pointer group w-full">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                          <LogOut className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="text-red-400 group-hover:text-red-300 transition-colors">Logout</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                <div className="md:hidden relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-red-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 transition-all duration-300"
                  >
                    <Menu className="h-4 w-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
                  </Button>
                </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] max-w-[400px] bg-card/95 backdrop-blur-xl border-l border-border/50">
                    <SheetHeader className="pb-6">
                      <SheetTitle className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-foreground">Menu</span>
                          <span className="text-sm text-muted-foreground">
                            {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
                          </span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-6 pb-6">
                      {/* Main Navigation */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Navigation</h3>
                        
                        {userRole === "applicant" ? (
                          <>
                                                         <Link 
                               href="/dashboard" 
                               onClick={() => setMobileMenuOpen(false)}
                               className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                 isActive("/dashboard")
                                   ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                   : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                               }`}
                             >
                               <Home className="h-5 w-5" />
                               <span className="font-medium">Dashboard</span>
                             </Link>
                                                         <Link 
                               href="/application" 
                               onClick={() => setMobileMenuOpen(false)}
                               className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                 isActive("/application")
                                   ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                   : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                               }`}
                             >
                               <FileText className="h-5 w-5" />
                               <span className="font-medium">Application</span>
                             </Link>
                          </>
                        ) : hasRecruiterRole ? (
                          <>
                                                         <Link 
                               href="/dashboard/recruiter" 
                               onClick={() => setMobileMenuOpen(false)}
                               className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                 isActive("/dashboard/recruiter")
                                   ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                   : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                               }`}
                             >
                               <Home className="h-5 w-5" />
                               <span className="font-medium">Dashboard</span>
                             </Link>
                            
                            {recruiterDepartments && recruiterDepartments.length > 0 && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Departments</h4>
                                {recruiterDepartments.map((dept: any) => (
                                                                     <Link 
                                     key={dept.department_id}
                                     href={`/dashboard/recruiter/${dept.department_id}`}
                                     onClick={() => setMobileMenuOpen(false)}
                                     className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                       isActive(`/dashboard/recruiter/${dept.department_id}`)
                                         ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                         : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                     }`}
                                   >
                                     <Building className="h-4 w-4" />
                                     <span className="font-medium text-sm">{dept.department?.name || dept.department_id}</span>
                                   </Link>
                                ))}
                              </div>
                            )}
                            
                            {isShortlistingDeadlineOver && recruiterPanels && recruiterPanels.length > 0 && (
                              <div className="space-y-1">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Panels</h4>
                                {recruiterPanels.map((panel: any) => (
                                                                     <Link 
                                     key={panel.id}
                                     href={`/dashboard/recruiter/panel/${panel.id}`}
                                     onClick={() => setMobileMenuOpen(false)}
                                     className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                       isActive(`/dashboard/recruiter/panel/${panel.id}`)
                                         ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                         : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                     }`}
                                   >
                                     <UserCircle className="h-4 w-4" />
                                     <div className="flex flex-col">
                                       <span className="font-medium text-sm">{panel.name}</span>
                                       <span className="text-xs text-muted-foreground">{panel.department?.name}</span>
                                     </div>
                                   </Link>
                                ))}
                              </div>
                            )}
                          </>
                        ) : userRole === "admin" && (
                          <>
                                                         <Link 
                               href="/admin" 
                               onClick={() => setMobileMenuOpen(false)}
                               className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                 isActive("/admin")
                                   ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                   : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                               }`}
                             >
                               <Home className="h-5 w-5" />
                               <span className="font-medium">Dashboard</span>
                             </Link>
                            
                            <div className="space-y-1">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Admin</h4>
                                                             <Link 
                                 href="/admin/users" 
                                 onClick={() => setMobileMenuOpen(false)}
                                 className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                   isActive("/admin/users")
                                     ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                     : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                 }`}
                               >
                                 <User className="h-4 w-4" />
                                 <span className="font-medium text-sm">Users</span>
                               </Link>
                                                             <Link 
                                 href="/admin/departments" 
                                 onClick={() => setMobileMenuOpen(false)}
                                 className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                   isActive("/admin/departments")
                                     ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                     : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                 }`}
                               >
                                 <Building className="h-4 w-4" />
                                 <span className="font-medium text-sm">Departments</span>
                               </Link>
                                                             <Link 
                                 href="/admin/panels" 
                                 onClick={() => setMobileMenuOpen(false)}
                                 className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                   isActive("/admin/panels")
                                     ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                     : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                 }`}
                               >
                                 <UserCircle className="h-4 w-4" />
                                 <span className="font-medium text-sm">Panels</span>
                               </Link>
                                                             <Link 
                                 href="/admin/recruiters" 
                                 onClick={() => setMobileMenuOpen(false)}
                                 className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                                   isActive("/admin/recruiters")
                                     ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground'
                                     : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                 }`}
                               >
                                 <User className="h-4 w-4" />
                                 <span className="font-medium text-sm">Recruiters</span>
                               </Link>
                            </div>
                          </>
                        )}
                      </div>

                      {/* User Actions */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Account</h3>
                        
                                                 <Link 
                           href="/profile" 
                           onClick={() => setMobileMenuOpen(false)}
                           className="flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-300"
                         >
                           <User className="h-5 w-5" />
                           <span className="font-medium">Profile</span>
                         </Link>
                        
                                                 <Link 
                           href="/profile/settings" 
                           onClick={() => setMobileMenuOpen(false)}
                           className="flex items-center gap-3 p-4 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-300"
                         >
                           <Settings className="h-5 w-5" />
                           <span className="font-medium">Settings</span>
                         </Link>
                        
                                                 <button
                           onClick={() => {
                             setMobileMenuOpen(false);
                             signOut();
                           }}
                           className="flex items-center gap-3 p-4 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-300 w-full text-left"
                         >
                           <LogOut className="h-5 w-5" />
                           <span className="font-medium">Logout</span>
                         </button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border glow effect with Red Theme */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </header>

      <main className="flex-1 min-h-0 relative z-10">{children}</main>
    </div>
  )
}