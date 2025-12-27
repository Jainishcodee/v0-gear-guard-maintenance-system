import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, ClipboardList, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch statistics
  const [equipmentCount, requestsCount, pendingCount, completedCount, teamsCount] = await Promise.all([
    supabase.from("equipment").select("*", { count: "exact", head: true }),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("maintenance_requests").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("teams").select("*", { count: "exact", head: true }),
  ])

  // Fetch recent requests
  const { data: recentRequests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment:equipment_id(name),
      requested_by:profiles!maintenance_requests_requested_by_fkey(full_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch equipment by status
  const { data: equipmentByStatus } = await supabase.from("equipment").select("status")

  const equipmentStats = equipmentByStatus?.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const stats = [
    {
      name: "Total Equipment",
      value: equipmentCount.count || 0,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Active Requests",
      value: requestsCount.count || 0,
      icon: ClipboardList,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Pending",
      value: pendingCount.count || 0,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "Completed",
      value: completedCount.count || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ]

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your maintenance operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests && recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{request.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.equipment?.name || "No equipment"} • {request.requested_by?.full_name || "Unknown"}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <Badge
                          variant="outline"
                          className={priorityColors[request.priority as keyof typeof priorityColors]}
                        >
                          {request.priority}
                        </Badge>
                        <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No maintenance requests yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Operational</span>
                </div>
                <span className="text-2xl font-bold">{equipmentStats?.operational || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium">Under Maintenance</span>
                </div>
                <span className="text-2xl font-bold">{equipmentStats?.maintenance || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">Faulty</span>
                </div>
                <span className="text-2xl font-bold">{equipmentStats?.faulty || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span className="text-sm font-medium">Retired</span>
                </div>
                <span className="text-2xl font-bold">{equipmentStats?.retired || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
