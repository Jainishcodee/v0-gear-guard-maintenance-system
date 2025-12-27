import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewTeamPage() {
  const supabase = await createClient()

  const { data: users } = await supabase.from("profiles").select("id, full_name, email").order("full_name")

  async function createTeam(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const teamData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    const { data: team, error } = await supabase.from("teams").insert(teamData).select().single()

    if (!error && team) {
      const memberIds = formData.getAll("team_members")
      if (memberIds.length > 0) {
        const teamMembers = memberIds.map((userId) => ({
          team_id: team.id,
          user_id: userId as string,
        }))
        await supabase.from("team_members").insert(teamMembers)
      }
      redirect("/dashboard/teams")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/teams">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
          <p className="text-muted-foreground">Set up a new maintenance team</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTeam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input id="name" name="name" required placeholder="e.g., HVAC Team" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_members">Team Members</Label>
              <div className="space-y-2 rounded-lg border p-3 max-h-48 overflow-y-auto">
                {users?.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded">
                    <input type="checkbox" name="team_members" value={user.id} className="h-4 w-4" />
                    <span className="text-sm">
                      {user.full_name} <span className="text-muted-foreground">({user.email})</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Select technicians to add to this team</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Team description..." rows={4} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Team
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/teams">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
