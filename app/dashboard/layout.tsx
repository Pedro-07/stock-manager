import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error && !error.message?.includes("Demo mode")) {
      redirect("/auth/login")
    }

    if (!data?.user && !error?.message?.includes("Demo mode")) {
      redirect("/auth/login")
    }

    const user = data?.user || {
      id: "demo-user",
      email: "demo@example.com",
      user_metadata: { store_name: "Demo Store" },
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="lg:pl-64">
          <DashboardHeader user={user} />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Dashboard layout error:", error)
    redirect("/auth/login")
  }
}
