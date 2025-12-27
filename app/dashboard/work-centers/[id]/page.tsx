import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"

export default async function WorkCenterDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: workCenter } = await supabase.from("work_centers").select("*").eq("id", id).single()

  if (!workCenter) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/work-centers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workCenter.work_center_name}</h1>
            <p className="text-muted-foreground">Work Center Details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/work-centers/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Work Center Name</p>
              <p className="font-medium">{workCenter.work_center_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Code</p>
              <p className="font-medium">{workCenter.code || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tag</p>
              <p className="font-medium">{workCenter.tag || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alternative Workcenters</p>
              <p className="font-medium">{workCenter.alternative_workcenters || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Cost per Hour</p>
              <p className="font-medium">
                {workCenter.cost_per_hour ? `$${Number(workCenter.cost_per_hour).toFixed(2)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capacity</p>
              <p className="font-medium">{workCenter.capacity ? Number(workCenter.capacity).toFixed(2) : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Efficiency</p>
              <p className="font-medium">
                {workCenter.time_efficiency ? `${Number(workCenter.time_efficiency).toFixed(2)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">OEE Target</p>
              <p className="font-medium">
                {workCenter.oee_target ? `${Number(workCenter.oee_target).toFixed(2)}%` : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
