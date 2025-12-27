import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const supabase = await createClient()

  // Fetch all scheduled requests
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select(
      `
      *,
      equipment:equipment_id(equipment_name),
      created_by:profiles!maintenance_requests_created_by_id_fkey(full_name),
      assigned_technician:profiles!maintenance_requests_assigned_technician_id_fkey(full_name)
    `,
    )
    .not("scheduled_date", "is", null)
    .order("scheduled_date", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Calendar</h1>
        <p className="text-muted-foreground">View and manage scheduled maintenance work</p>
      </div>

      <CalendarView requests={requests || []} />
    </div>
  )
}
