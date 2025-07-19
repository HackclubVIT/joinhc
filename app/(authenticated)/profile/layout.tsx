"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings } from "lucide-react"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen hackclub-bg">
      <div className="content-container py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Tabs value={pathname} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-card border shadow-lg">
                <TabsTrigger
                  value="/profile"
                  asChild
                  className="h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile Info
                  </Link>
                </TabsTrigger>
                <TabsTrigger
                  value="/profile/settings"
                  asChild
                  className="h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Link
                    href="/profile/settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
