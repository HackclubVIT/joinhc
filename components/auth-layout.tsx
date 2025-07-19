"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User, Settings, Menu, Bell, Sparkles, Home, FileText, UserCircle } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"
import { HackClubLogo } from "@/components/hackclub-logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const { user, userRole, signOut } = useAuth()

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
                    href={userRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard"}
                    className="relative z-10"
                  />
                </div>

                {/* Navigation Pills with Red Theme */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                  {userRole === "applicant" ? (
                    <>
                      <Link href="/dashboard">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${
                          isActive("/dashboard") 
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
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${
                          isActive("/application") 
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
                      <Link href="/profile">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${
                          pathname.startsWith("/profile") 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <UserCircle className="h-4 w-4" />
                            <span>Profile</span>
                          </div>
                          {pathname.startsWith("/profile") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard/recruiter">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${
                          isActive("/dashboard/recruiter") 
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
                      <Link href="/profile">
                        <div className={`group relative px-4 lg:px-6 py-3 rounded-xl transition-all duration-300 ${
                          pathname.startsWith("/profile") 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-primary-foreground shadow-lg shadow-red-500/25' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        }`}>
                          <div className="flex items-center gap-2 font-semibold">
                            <UserCircle className="h-4 w-4" />
                            <span>Profile</span>
                          </div>
                          {pathname.startsWith("/profile") && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/10 animate-pulse"></div>
                          )}
                        </div>
                      </Link>
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

                {/* Notification Button with Red Accent */}
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 transition-all duration-300"
                  >
                    <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground group-hover:text-red-400 transition-colors" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse border border-background"></div>
                  </Button>
                </div>

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
                      <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all duration-300 cursor-pointer group">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                          <User className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-foreground group-hover:text-red-400 transition-colors">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="p-0 m-1">
                      <Link href="/profile/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-all duration-300 cursor-pointer group">
                        <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                          <Settings className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-foreground group-hover:text-red-400 transition-colors">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border/50 my-2" />
                    
                    <DropdownMenuItem 
                      onClick={() => signOut()} 
                      className="p-0 m-1"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 transition-all duration-300 cursor-pointer group w-full">
                        <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                          <LogOut className="h-4 w-4 text-red-400" />
                        </div>
                        <span className="text-red-400 group-hover:text-red-300 transition-colors">Logout</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
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