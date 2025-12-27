import type React from "react"
import { TopNav } from "@/components/top-nav"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        user={{
          email: user.email,
          full_name: profile?.full_name,
          role: profile?.role,
        }}
      />
      <main className="p-6">{children}</main>
    </div>
  )
}
