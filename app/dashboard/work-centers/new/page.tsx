import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewWorkCenterPage() {
  async function createWorkCenter(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const workCenterData = {
      work_center_name: formData.get("work_center_name") as string,
      code: (formData.get("code") as string) || null,
      tag: (formData.get("tag") as string) || null,
      alternative_workcenters: (formData.get("alternative_workcenters") as string) || null,
      cost_per_hour: formData.get("cost_per_hour") ? Number.parseFloat(formData.get("cost_per_hour") as string) : null,
      capacity: formData.get("capacity") ? Number.parseFloat(formData.get("capacity") as string) : null,
      time_efficiency: formData.get("time_efficiency")
        ? Number.parseFloat(formData.get("time_efficiency") as string)
        : null,
      oee_target: formData.get("oee_target") ? Number.parseFloat(formData.get("oee_target") as string) : null,
    }

    const { error } = await supabase.from("work_centers").insert(workCenterData)

    if (!error) {
      redirect("/dashboard/work-centers")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/work-centers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Work Center</h1>
          <p className="text-muted-foreground">Set up a new work center for maintenance operations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Center Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWorkCenter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="work_center_name">Work Center Name *</Label>
              <Input id="work_center_name" name="work_center_name" required placeholder="e.g., Assembly 1" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" placeholder="WC-001" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Input id="tag" name="tag" placeholder="Tag identifier" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternative_workcenters">Alternative Workcenters</Label>
              <Input
                id="alternative_workcenters"
                name="alternative_workcenters"
                placeholder="Comma-separated alternatives"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cost_per_hour">Cost per Hour</Label>
                <Input id="cost_per_hour" name="cost_per_hour" type="number" step="0.01" placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" step="0.01" placeholder="1.00" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="time_efficiency">Time Efficiency (%)</Label>
                <Input id="time_efficiency" name="time_efficiency" type="number" step="0.01" placeholder="100.00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oee_target">OEE Target (%)</Label>
                <Input id="oee_target" name="oee_target" type="number" step="0.01" placeholder="85.00" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Create Work Center
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/work-centers">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
