import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewRequestPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch equipment for dropdown
  const { data: equipment } = await supabase.from("equipment").select("id, name, category").order("name")

  // Fetch teams for assignment
  const { data: teams } = await supabase.from("teams").select("id, name").order("name")

  // Fetch users for assignment
  const { data: users } = await supabase.from("profiles").select("id, full_name").order("full_name")

  async function createRequest(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const equipmentId = formData.get("equipment_id") as string
    const assignedTo = formData.get("assigned_to") as string
    const assignedTeam = formData.get("assigned_team") as string

    const requestData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      equipment_id: equipmentId === "none" ? null : equipmentId,
      priority: formData.get("priority") as string,
      status: "pending",
      requested_by: user.id,
      assigned_to: assignedTo === "none" ? null : assignedTo,
      assigned_team: assignedTeam === "none" ? null : assignedTeam,
      scheduled_date: formData.get("scheduled_date") as string,
      estimated_hours: formData.get("estimated_hours") as string,
      notes: formData.get("notes") as string,
    }

    const { error } = await supabase.from("maintenance_requests").insert(requestData)

    if (!error) {
      redirect("/dashboard/requests")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/requests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Maintenance Request</h1>
          <p className="text-muted-foreground">Create a new maintenance work order</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Brief description of the issue" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" required placeholder="Detailed description..." rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="equipment_id">Equipment</Label>
                <Select name="equipment_id" defaultValue="none">
                  <SelectTrigger id="equipment_id">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No equipment</SelectItem>
                    {equipment?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign to User</Label>
                <Select name="assigned_to" defaultValue="none">
                  <SelectTrigger id="assigned_to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_team">Assign to Team</Label>
                <Select name="assigned_team" defaultValue="none">
                  <SelectTrigger id="assigned_team">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team</SelectItem>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date</Label>
                <Input id="scheduled_date" name="scheduled_date" type="datetime-local" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input id="estimated_hours" name="estimated_hours" type="number" step="0.5" placeholder="e.g., 2.5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any additional information..." rows={3} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Request
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/requests">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
