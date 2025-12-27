import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Clock, AlertCircle, Wrench } from "lucide-react"

export default async function ReportingPage() {
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select(`
      *,
      equipment:equipment_id(equipment_name, category),
      assigned_technician:profiles!maintenance_requests_assigned_technician_id_fkey(full_name),
      requested_by_user:profiles!maintenance_requests_created_by_id_fkey(full_name),
      assigned_team_data:maintenance_teams(name)
    `)
    .order("created_at", { ascending: false })

  const stats = {
    total: requests?.length || 0,
    open: requests?.filter((r) => r.stage === "open").length || 0,
    inProgress: requests?.filter((r) => r.stage === "in_progress").length || 0,
    completed: requests?.filter((r) => r.stage === "completed").length || 0,
    cancelled: requests?.filter((r) => r.stage === "cancelled").length || 0,
  }

  const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0

  const completedRequests = requests?.filter((r) => r.stage === "completed" && r.duration_hours) || []
  const avgHours =
    completedRequests.length > 0
      ? (
          completedRequests.reduce((sum, r) => sum + (Number(r.duration_hours) || 0), 0) / completedRequests.length
        ).toFixed(1)
      : 0

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Reports</h1>
        <p className="text-muted-foreground">Track progress and performance of maintenance requests</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.completed} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hours</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHours}h</div>
            <p className="text-xs text-muted-foreground">Per completed task</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Request Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Open</Badge>
                <span className="text-sm text-muted-foreground">New requests</span>
              </div>
              <span className="font-semibold">{stats.open}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600">In Progress</Badge>
                <span className="text-sm text-muted-foreground">Being worked on</span>
              </div>
              <span className="font-semibold">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">Completed</Badge>
                <span className="text-sm text-muted-foreground">Finished tasks</span>
              </div>
              <span className="font-semibold">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Cancelled</Badge>
                <span className="text-sm text-muted-foreground">Cancelled requests</span>
              </div>
              <span className="font-semibold">{stats.cancelled}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Request Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Maintenance Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Duration (hrs)</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.subject}</TableCell>
                    <TableCell>{request.equipment?.equipment_name || "N/A"}</TableCell>
                    <TableCell>{request.requested_by_user?.full_name || "Unknown"}</TableCell>
                    <TableCell>
                      {request.assigned_technician?.full_name || request.assigned_team_data?.name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.priority === "critical"
                            ? "destructive"
                            : request.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          request.stage === "completed"
                            ? "bg-green-600"
                            : request.stage === "in_progress"
                              ? "bg-blue-600"
                              : ""
                        }
                        variant={request.stage === "open" ? "secondary" : "default"}
                      >
                        {request.stage.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.duration_hours ? `${request.duration_hours}h` : "N/A"}</TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No maintenance requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
