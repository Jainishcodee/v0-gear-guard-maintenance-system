import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: equipment }, { data: requests }, { data: profiles }] = await Promise.all([
    supabase.from("equipment").select("*"),
    supabase
      .from("maintenance_requests")
      .select(`
      *,
      equipment:equipment_id(equipment_name),
      assigned_technician:assigned_technician_id(full_name),
      created_by:created_by_id(full_name),
      maintenance_team:maintenance_team_id(name)
    `)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("profiles").select("*"),
  ])

  // Critical Equipment (Health < 30%)
  const criticalEquipment = equipment?.filter((e) => e.health_percentage < 30).length || 0

  // Technician Load (assuming 8 hour workday per technician)
  const totalTechnicians = profiles?.length || 1
  const totalHoursScheduled = requests?.reduce((sum, r) => sum + (r.duration_hours || 0), 0) || 0
  const technicianUtilization = Math.min(Math.round((totalHoursScheduled / (totalTechnicians * 8)) * 100), 100)

  // Open Requests (pending + in progress) and overdue
  const openRequests = requests?.filter((r) => r.stage === "new" || r.stage === "in_progress").length || 0
  const overdueRequests = requests?.filter((r) => r.is_overdue).length || 0

  const stageColors = {
    new: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    repaired: "bg-green-100 text-green-800 border-green-200",
    scrap: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const stageLabels = {
    new: "New Request",
    in_progress: "In Progress",
    repaired: "Repaired",
    scrap: "Scrap",
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/maintenance/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-6">
          {/* Critical Equipment (Red) */}
          <div className="w-64 rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center">
            <p className="text-2xl font-bold text-red-900">{criticalEquipment} Units</p>
            <p className="mt-1 text-sm font-medium text-red-700">Critical Equipment</p>
            <p className="mt-1 text-xs text-red-600">Health &lt; 30%</p>
          </div>

          {/* Technician Load (Blue) */}
          <div className="w-64 rounded-lg border-2 border-blue-200 bg-blue-50 p-6 text-center">
            <p className="text-2xl font-bold text-blue-900">{technicianUtilization}% Utilized</p>
            <p className="mt-1 text-sm font-medium text-blue-700">Technician Load</p>
            <p className="mt-1 text-xs text-blue-600">Assign Carefully</p>
          </div>

          {/* Open Requests (Green) */}
          <div className="w-64 rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center">
            <p className="text-2xl font-bold text-green-900">{openRequests} Pending</p>
            <p className="mt-1 text-sm font-medium text-green-700">Open Requests</p>
            <p className="mt-1 text-xs text-green-600">{overdueRequests} Overdue</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Subject</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Technician</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stage</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Company</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests && requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/dashboard/maintenance/${request.id}`} className="hover:underline">
                      {request.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.created_by?.full_name || "—"}</td>
                  <td className="px-4 py-3 text-sm">{request.assigned_technician?.full_name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-sm">{request.category || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={stageColors[request.stage as keyof typeof stageColors]}>
                      {stageLabels[request.stage as keyof typeof stageLabels]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.company}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No maintenance requests found. Click "New" to create your first request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
