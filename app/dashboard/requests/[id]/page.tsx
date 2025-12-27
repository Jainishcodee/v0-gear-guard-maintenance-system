import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageSquare, User, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: request } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment:equipment_id(id, equipment_name, category),
      created_by:profiles!maintenance_requests_created_by_id_fkey(full_name, email),
      assigned_technician:profiles!maintenance_requests_assigned_technician_id_fkey(id, full_name, email),
      maintenance_team:maintenance_teams!maintenance_requests_maintenance_team_id_fkey(name)
    `,
    )
    .eq("id", params.id)
    .single()

  if (!request) {
    notFound()
  }

  const { data: comments } = await supabase
    .from("maintenance_comments")
    .select("*, user:profiles!maintenance_comments_user_id_fkey(full_name)")
    .eq("request_id", params.id)
    .order("created_at", { ascending: true })

  async function addComment(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const comment = formData.get("content") as string

    await supabase.from("maintenance_comments").insert({
      request_id: params.id,
      user_id: user.id,
      comment,
    })

    redirect(`/dashboard/requests/${params.id}`)
  }

  async function updateStatus(formData: FormData) {
    "use server"

    const supabase = await createClient()
    const stage = formData.get("stage") as string

    const updateData: any = { stage }

    if (stage === "completed") {
      updateData.completed_date = new Date().toISOString()
    }

    await supabase.from("maintenance_requests").update(updateData).eq("id", params.id)

    redirect(`/dashboard/requests/${params.id}`)
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  }

  const stageColors = {
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
            <Link href="/dashboard/requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{request.subject}</h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={priorityColors[request.priority as keyof typeof priorityColors]}>
                {request.priority} priority
              </Badge>
              <Badge variant="outline" className={stageColors[request.stage as keyof typeof stageColors]}>
                {request.stage}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
              {request.notes && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Additional Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment list */}
              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{comment.user?.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>

              {/* Add comment form */}
              <form action={addComment} className="space-y-3 pt-4 border-t">
                <Textarea name="content" placeholder="Add a comment..." required rows={3} />
                <Button type="submit">Add Comment</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateStatus} className="space-y-3">
                <Select name="stage" defaultValue={request.stage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full">
                  Update Status
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.equipment && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Equipment</div>
                  <Link
                    href={`/dashboard/equipment/${request.equipment.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {request.equipment.equipment_name}
                  </Link>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-medium">Requested By</div>
                <div className="text-sm text-muted-foreground">{request.created_by?.full_name}</div>
              </div>

              {request.assigned_technician && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Assigned To</div>
                  <div className="text-sm text-muted-foreground">{request.assigned_technician.full_name}</div>
                </div>
              )}

              {request.maintenance_team && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Assigned Team</div>
                  <div className="text-sm text-muted-foreground">{request.maintenance_team.name}</div>
                </div>
              )}

              {request.scheduled_date && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Scheduled Date
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.scheduled_date).toLocaleString()}
                  </div>
                </div>
              )}

              {request.duration_hours && (
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </div>
                  <div className="text-sm text-muted-foreground">{request.duration_hours} hours</div>
                </div>
              )}

              {request.completed_date && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Completed Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.completed_date).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="space-y-1 pt-3 border-t">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">{new Date(request.created_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
