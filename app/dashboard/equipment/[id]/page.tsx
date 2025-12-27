import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Wrench, History } from "lucide-react"
import Link from "next/link"

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, created_by:profiles!equipment_created_by_fkey(full_name)")
    .eq("id", params.id)
    .single()

  if (!equipment) {
    notFound()
  }

  // Fetch maintenance history
  const { data: maintenanceHistory } = await supabase
    .from("maintenance_history")
    .select("*, performed_by:profiles!maintenance_history_performed_by_fkey(full_name)")
    .eq("equipment_id", params.id)
    .order("performed_at", { ascending: false })

  // Fetch related maintenance requests
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("*, requested_by:profiles!maintenance_requests_requested_by_fkey(full_name)")
    .eq("equipment_id", params.id)
    .order("created_at", { ascending: false })

  const statusColors = {
    operational: "bg-green-100 text-green-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    faulty: "bg-red-100 text-red-800",
    retired: "bg-gray-100 text-gray-800",
  }

  const requestStatusColors = {
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
            <Link href="/dashboard/equipment">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-muted-foreground">{equipment.category}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/equipment/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Equipment Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusColors[equipment.status as keyof typeof statusColors]}>
                  {equipment.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Location</span>
                <span className="text-sm font-medium">{equipment.location}</span>
              </div>
              {equipment.serial_number && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
                  <span className="text-sm font-medium">{equipment.serial_number}</span>
                </div>
              )}
              {equipment.purchase_date && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Purchase Date</span>
                  <span className="text-sm font-medium">{new Date(equipment.purchase_date).toLocaleDateString()}</span>
                </div>
              )}
              {equipment.warranty_expiry && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Warranty Expiry</span>
                  <span className="text-sm font-medium">
                    {new Date(equipment.warranty_expiry).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Created By</span>
                <span className="text-sm font-medium">{equipment.created_by?.full_name || "Unknown"}</span>
              </div>
            </div>
            {equipment.description && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{equipment.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Recent Maintenance Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="block border-b pb-3 last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{request.title}</p>
                        <p className="text-xs text-muted-foreground">{request.requested_by?.full_name}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={requestStatusColors[request.status as keyof typeof requestStatusColors]}
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No maintenance requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Maintenance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceHistory && maintenanceHistory.length > 0 ? (
            <div className="space-y-4">
              {maintenanceHistory.map((history) => (
                <div key={history.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{history.action_type}</span>
                      {history.cost && (
                        <Badge variant="outline" className="ml-auto">
                          ${history.cost}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{history.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{history.performed_by?.full_name}</span>
                      <span>•</span>
                      <span>{new Date(history.performed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No maintenance history recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
