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
      equipment:equipment_id(name),
      assigned_technician:profiles!maintenance_requests_assigned_to_fkey(full_name),
      requested_by_profile:profiles!maintenance_requests_requested_by_fkey(full_name),
      assigned_team_info:teams!maintenance_requests_assigned_team_fkey(name)
    `)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("profiles").select("*"),
  ])

  // Critical Equipment (status = 'critical' or needs_maintenance)
  const criticalEquipment =
    equipment?.filter((e) => e.status === "needs_maintenance" || e.status === "critical").length || 0

  // Technician Load (assuming 8 hour workday per technician)
  const totalTechnicians = profiles?.length || 1
  const totalHoursScheduled = requests?.reduce((sum, r) => sum + (r.estimated_hours || 0), 0) || 0
  const technicianUtilization = Math.min(Math.round((totalHoursScheduled / (totalTechnicians * 8)) * 100), 100)

  // Open Requests (pending + in progress) and overdue
  const openRequests = requests?.filter((r) => r.status === "pending" || r.status === "in_progress").length || 0
  const overdueRequests =
    requests?.filter((r) => {
      if (!r.scheduled_date) return false
      return new Date(r.scheduled_date) < new Date() && r.status !== "completed"
    }).length || 0

  const statusColors = {
    pending: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/requests/new">
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
            <p className="mt-1 text-xs text-red-600">Needs Maintenance</p>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Equipment</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests && requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/dashboard/requests/${request.id}`} className="hover:underline">
                      {request.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.requested_by_profile?.full_name || "—"}</td>
                  <td className="px-4 py-3 text-sm">{request.assigned_technician?.full_name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        request.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : request.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {request.priority || "low"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                      {statusLabels[request.status as keyof typeof statusLabels] || request.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{request.equipment?.name || "—"}</td>
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
