"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const { user, userRole, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={userRole === "recruiter" ? "/dashboard/recruiter" : "/dashboard"} className="text-xl font-bold">
              Recruitment Portal
            </Link>
            <nav className="hidden md:flex">
              {userRole === "applicant" ? (
                <>
                  <Link href="/dashboard" className={`px-4 py-2 ${pathname === "/dashboard" ? "font-medium" : ""}`}>
                    Dashboard
                  </Link>
                  <Link href="/application" className={`px-4 py-2 ${pathname === "/application" ? "font-medium" : ""}`}>
                    Application
                  </Link>
                  <Link href="/profile" className={`px-4 py-2 ${pathname === "/profile" ? "font-medium" : ""}`}>
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/recruiter"
                    className={`px-4 py-2 ${pathname === "/dashboard/recruiter" ? "font-medium" : ""}`}
                  >
                    Dashboard
                  </Link>
                  <Link href="/profile" className={`px-4 py-2 ${pathname === "/profile" ? "font-medium" : ""}`}>
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {userRole && <span className="hidden rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary md:block">
              {userRole}
            </span>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuItem className="md:hidden">{userRole}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
