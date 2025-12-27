"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewRequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [equipment, setEquipment] = useState<any[]>([])
  const [workCenters, setWorkCenters] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [maintenanceFor, setMaintenanceFor] = useState("equipment")

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      const { data: equipmentData } = await supabase
        .from("equipment")
        .select("id, equipment_name, category")
        .order("equipment_name")
      setEquipment(equipmentData || [])

      const { data: workCentersData } = await supabase
        .from("work_centers")
        .select("id, work_center_name, code")
        .order("work_center_name")
      setWorkCenters(workCentersData || [])

      const { data: teamsData } = await supabase.from("maintenance_teams").select("id, name").order("name")
      setTeams(teamsData || [])

      const { data: usersData } = await supabase.from("profiles").select("id, full_name").order("full_name")
      setUsers(usersData || [])
    }
    fetchData()
  }, [])

  async function createRequest(formData: FormData) {
    if (!user) return

    const equipmentId = formData.get("equipment_id") as string
    const workCenterId = formData.get("work_center_id") as string
    const assignedTo = formData.get("assigned_technician_id") as string
    const assignedTeam = formData.get("maintenance_team_id") as string

    const requestData = {
      subject: formData.get("subject") as string,
      description: formData.get("description") as string,
      maintenance_for: formData.get("maintenance_for") as string,
      equipment_id: maintenanceFor === "equipment" && equipmentId !== "none" ? equipmentId : null,
      work_center_id: maintenanceFor === "work_center" && workCenterId !== "none" ? workCenterId : null,
      priority: formData.get("priority") as string,
      stage: "new",
      request_type: formData.get("request_type") as string,
      created_by_id: user.id,
      assigned_technician_id: assignedTo === "none" ? null : assignedTo,
      maintenance_team_id: assignedTeam === "none" ? null : assignedTeam,
      scheduled_date: (formData.get("scheduled_date") as string) || null,
      duration_hours: Number.parseFloat(formData.get("duration_hours") as string) || null,
      category: formData.get("category") as string,
      company: formData.get("company") as string,
    }

    const { error } = await supabase.from("maintenance_requests").insert(requestData)

    if (!error) {
      router.push("/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await createRequest(formData)
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="request_type">Request Type *</Label>
                <Select name="request_type" defaultValue="corrective">
                  <SelectTrigger id="request_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="maintenance_for">Maintenance For *</Label>
              <Select
                name="maintenance_for"
                value={maintenanceFor}
                onValueChange={setMaintenanceFor}
                defaultValue="equipment"
              >
                <SelectTrigger id="maintenance_for">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="work_center">Work Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {maintenanceFor === "equipment" && (
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
                        {item.equipment_name} ({item.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {maintenanceFor === "work_center" && (
              <div className="space-y-2">
                <Label htmlFor="work_center_id">Work Center</Label>
                <Select name="work_center_id" defaultValue="none">
                  <SelectTrigger id="work_center_id">
                    <SelectValue placeholder="Select work center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No work center</SelectItem>
                    {workCenters?.map((wc) => (
                      <SelectItem key={wc.id} value={wc.id}>
                        {wc.work_center_name} {wc.code && `(${wc.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                <Label htmlFor="duration_hours">Estimated Hours</Label>
                <Input id="duration_hours" name="duration_hours" type="number" step="0.5" placeholder="e.g., 2.5" />
              </div>
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
