import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { WorkCentersTable } from "@/components/work-centers-table"

export default async function WorkCentersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const supabase = await createClient()
  const search = searchParams.search || ""

  const { data: workCenters } = await supabase.from("work_centers").select("*").order("work_center_name")

  // Filter on the server based on search param
  const filteredWorkCenters = search
    ? workCenters?.filter(
        (wc) =>
          wc.work_center_name?.toLowerCase().includes(search.toLowerCase()) ||
          wc.code?.toLowerCase().includes(search.toLowerCase()) ||
          wc.tag?.toLowerCase().includes(search.toLowerCase()),
      )
    : workCenters

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Work Center – List View</h1>
          <p className="mt-1 text-sm text-red-600">
            Note: Must create a work center proper for view with respective fields that are needed in work center for
            maintenance request.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/work-centers/new">
              <Plus className="mr-2 h-4 w-4" />
              New Work Center
            </Link>
          </Button>
        </div>
      </div>

      <WorkCentersTable workCenters={filteredWorkCenters || []} initialSearch={search} />
    </div>
  )
}
