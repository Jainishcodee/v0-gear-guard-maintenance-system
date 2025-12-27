"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ClipboardList } from "lucide-react"

interface Request {
  id: string
  title: string
  description: string
  priority: string
  status: string
  equipment?: { name: string }
  requested_by?: { full_name: string }
  assigned_to?: { full_name: string }
  created_at: string
}

interface RequestsKanbanProps {
  requests: Request[]
}

export function RequestsKanban({ requests }: RequestsKanbanProps) {
  const columns = [
    { id: "pending", title: "Pending", color: "bg-yellow-100 border-yellow-200" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-100 border-blue-200" },
    { id: "completed", title: "Completed", color: "bg-green-100 border-green-200" },
    { id: "cancelled", title: "Cancelled", color: "bg-gray-100 border-gray-200" },
  ]

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }

  const getRequestsByStatus = (status: string) => {
    return requests.filter((req) => req.status === status)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        const columnRequests = getRequestsByStatus(column.id)
        return (
          <div key={column.id} className="space-y-4">
            <div className={`rounded-lg border-2 p-3 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{columnRequests.length}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              {columnRequests.length > 0 ? (
                columnRequests.map((request) => (
                  <Link key={request.id} href={`/dashboard/requests/${request.id}`}>
                    <Card className="transition-shadow hover:shadow-md cursor-pointer">
                      <CardHeader className="p-4 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium leading-none line-clamp-2">{request.title}</h4>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
                        {request.equipment && (
                          <div className="text-xs text-muted-foreground">
                            <ClipboardList className="inline h-3 w-3 mr-1" />
                            {request.equipment.name}
                          </div>
                        )}
                        <div className="flex gap-2 pt-1">
                          <Badge
                            variant="outline"
                            className={priorityColors[request.priority as keyof typeof priorityColors]}
                          >
                            {request.priority}
                          </Badge>
                        </div>
                        {request.assigned_to && (
                          <div className="text-xs text-muted-foreground">Assigned: {request.assigned_to.full_name}</div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">No requests</CardContent>
                </Card>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
