import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: equipment } = await supabase.from("equipment").select("*").eq("id", params.id).single()

  if (!equipment) {
    notFound()
  }

  async function updateEquipment(formData: FormData) {
    "use server"

    const supabase = await createClient()

    const equipmentData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      serial_number: formData.get("serial_number") as string,
      purchase_date: formData.get("purchase_date") as string,
      warranty_expiry: formData.get("warranty_expiry") as string,
      status: formData.get("status") as string,
    }

    const { error } = await supabase.from("equipment").update(equipmentData).eq("id", params.id)

    if (!error) {
      redirect(`/dashboard/equipment/${params.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/equipment/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Equipment</h1>
          <p className="text-muted-foreground">Update equipment information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateEquipment} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required defaultValue={equipment.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" required defaultValue={equipment.category} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={equipment.description || ""} rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" required defaultValue={equipment.location} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input id="serial_number" name="serial_number" defaultValue={equipment.serial_number || ""} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  defaultValue={equipment.purchase_date || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  name="warranty_expiry"
                  type="date"
                  defaultValue={equipment.warranty_expiry || ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={equipment.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="faulty">Faulty</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Update Equipment
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/equipment/${params.id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
