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

  // Fetch equipment for dropdown - using 'name' column instead of 'equipment_name'
  const { data: equipment } = await supabase.from("equipment").select("id, name, category").order("name")

  // Fetch teams for assignment - using 'teams' table instead of 'maintenance_teams'
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
    const assignedTo = formData.get("assigned_technician_id") as string
    const assignedTeam = formData.get("maintenance_team_id") as string

    const requestData = {
      title: formData.get("subject") as string,
      description: formData.get("description") as string,
      equipment_id: equipmentId === "none" ? null : equipmentId,
      priority: formData.get("priority") as string,
      status: "new",
      requested_by: user.id,
      assigned_to: assignedTo === "none" ? null : assignedTo,
      assigned_team: assignedTeam === "none" ? null : assignedTeam,
      scheduled_date: (formData.get("scheduled_date") as string) || null,
      estimated_hours: Number.parseFloat(formData.get("duration_hours") as string) || null,
      notes: (formData.get("notes") as string) || null,
    }

    const { error } = await supabase.from("maintenance_requests").insert(requestData)

    if (!error) {
      redirect("/dashboard")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
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
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" name="subject" required placeholder="Brief description of the issue" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" required placeholder="Detailed description..." rows={4} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" name="company" required placeholder="Company name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue="Corrective">
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Predictive">Predictive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_id">Equipment</Label>
              <Select name="equipment_id" defaultValue="none">
                <SelectTrigger id="equipment_id">
                  <SelectValue placeholder="Select equipment" />
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
              <Select name="priority" defaultValue="Medium">
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned_technician_id">Assign to Technician</Label>
                <Select name="assigned_technician_id" defaultValue="none">
                  <SelectTrigger id="assigned_technician_id">
                    <SelectValue placeholder="Select technician" />
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
                <Label htmlFor="maintenance_team_id">Assign to Team</Label>
                <Select name="maintenance_team_id" defaultValue="none">
                  <SelectTrigger id="maintenance_team_id">
                    <SelectValue placeholder="Select team" />
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
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input id="duration_hours" name="duration_hours" type="number" step="0.5" placeholder="e.g., 2.5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Additional notes..." rows={2} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Request
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
