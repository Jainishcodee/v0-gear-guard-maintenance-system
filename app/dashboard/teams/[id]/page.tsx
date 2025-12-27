import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserPlus, UserMinus, Mail } from "lucide-react"
import Link from "next/link"

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: team } = await supabase.from("teams").select("*").eq("id", params.id).single()

  if (!team) {
    notFound()
  }

  // Fetch team members
  const { data: members } = await supabase
    .from("team_members")
    .select("*, user:profiles!team_members_user_id_fkey(id, full_name, email, role)")
    .eq("team_id", params.id)
    .order("joined_at", { ascending: false })

  // Fetch all users for adding members
  const { data: allUsers } = await supabase.from("profiles").select("id, full_name, email, role").order("full_name")

  // Filter out users already in team
  const memberIds = new Set(members?.map((m) => m.user_id))
  const availableUsers = allUsers?.filter((u) => !memberIds.has(u.id))

  // Fetch requests assigned to this team
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("*, equipment:equipment_id(name)")
    .eq("assigned_team", params.id)
    .order("created_at", { ascending: false })
    .limit(10)

  async function addMember(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const userId = formData.get("user_id") as string

    if (userId === "none") return

    await supabase.from("team_members").insert({
      team_id: params.id,
      user_id: userId,
    })

    redirect(`/dashboard/teams/${params.id}`)
  }

  async function removeMember(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const memberId = formData.get("member_id") as string

    await supabase.from("team_members").delete().eq("id", memberId)

    redirect(`/dashboard/teams/${params.id}`)
  }

  const roleColors = {
    admin: "bg-purple-100 text-purple-800",
    manager: "bg-blue-100 text-blue-800",
    technician: "bg-green-100 text-green-800",
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            {team.description && <p className="text-muted-foreground">{team.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({members?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Member Form */}
            <form action={addMember} className="flex gap-2">
              <Select name="user_id" defaultValue="none">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select user to add" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select user...</SelectItem>
                  {availableUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" size="icon">
                <UserPlus className="h-4 w-4" />
              </Button>
            </form>

            {/* Member List */}
            <div className="space-y-3">
              {members && members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.user?.full_name}</span>
                        <Badge variant="outline" className={roleColors[member.user?.role as keyof typeof roleColors]}>
                          {member.user?.role}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.user?.email}
                      </div>
                    </div>
                    <form action={removeMember}>
                      <input type="hidden" name="member_id" value={member.id} />
                      <Button type="submit" variant="ghost" size="icon" className="text-destructive">
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No members yet. Add members to this team.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assigned Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests && requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium leading-none line-clamp-1">{request.title}</h4>
                        <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.equipment && <p className="text-xs text-muted-foreground">{request.equipment.name}</p>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No requests assigned to this team yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
