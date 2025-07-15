"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <Tabs value={pathname} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="/profile" asChild>
                <Link href="/profile">Profile Info</Link>
              </TabsTrigger>
              <TabsTrigger value="/profile/settings" asChild>
                <Link href="/profile/settings">Settings</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {children}
      </div>
    </div>
  )
}
