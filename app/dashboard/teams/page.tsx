import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users } from "lucide-react"
import Link from "next/link"

export default async function TeamsPage() {
  const supabase = await createClient()

  const { data: teams } = await supabase.from("teams").select("*").order("name")

  // Get member counts for each team
  const teamsWithCounts = await Promise.all(
    (teams || []).map(async (team) => {
      const { count } = await supabase
        .from("team_members")
        .select("*", { count: "exact", head: true })
        .eq("team_id", team.id)

      return {
        ...team,
        memberCount: count || 0,
      }
    }),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage your maintenance teams and members</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      {/* Teams Grid */}
      {teamsWithCounts && teamsWithCounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamsWithCounts.map((team) => (
            <Link key={team.id} href={`/dashboard/teams/${team.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {team.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No teams created yet. Create your first team to get started.</p>
            <Button asChild>
              <Link href="/dashboard/teams/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
