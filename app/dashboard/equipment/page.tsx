import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import Link from "next/link"

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; category?: string }
}) {
  const supabase = await createClient()

  // Build query
  let query = supabase.from("equipment").select("*, created_by:profiles!equipment_created_by_fkey(full_name)")

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query = query.eq("status", searchParams.status)
  }

  if (searchParams.category) {
    query = query.eq("category", searchParams.category)
  }

  const { data: equipment } = await query.order("created_at", { ascending: false })

  // Get unique categories
  const { data: allEquipment } = await supabase.from("equipment").select("category")
  const categories = [...new Set(allEquipment?.map((e) => e.category))]

  const statusColors = {
    operational: "bg-green-100 text-green-800",
    maintenance: "bg-yellow-100 text-yellow-800",
    faulty: "bg-red-100 text-red-800",
    retired: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="text-muted-foreground">Manage and track all your equipment</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/equipment/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search equipment..."
                defaultValue={searchParams.search}
                className="pl-9"
              />
            </div>
            <Select name="status" defaultValue={searchParams.status || "all"}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="faulty">Faulty</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select name="category" defaultValue={searchParams.category || "all"}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {equipment && equipment.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <Link key={item.id} href={`/dashboard/equipment/${item.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold leading-none">{item.name}</h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="outline" className={statusColors[item.status as keyof typeof statusColors]}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-muted-foreground">No equipment found. Add your first equipment to get started.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/equipment/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
