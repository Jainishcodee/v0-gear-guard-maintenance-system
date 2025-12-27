"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type WorkCenter = {
  id: string
  work_center_name: string
  code: string | null
  tag: string | null
  alternative_workcenters: string | null
  cost_per_hour: number | null
  capacity: number | null
  time_efficiency: number | null
  oee_target: number | null
}

export function WorkCentersTable({
  workCenters,
  initialSearch,
}: {
  workCenters: WorkCenter[]
  initialSearch: string
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [localFiltered, setLocalFiltered] = useState(workCenters)
  const router = useRouter()

  // Client-side filtering for instant feedback
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const filtered = workCenters.filter(
      (wc) =>
        wc.work_center_name?.toLowerCase().includes(value.toLowerCase()) ||
        wc.code?.toLowerCase().includes(value.toLowerCase()) ||
        wc.tag?.toLowerCase().includes(value.toLowerCase()),
    )
    setLocalFiltered(filtered)
  }

  return (
    <>
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search work centers by name, code, or tag..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setLocalFiltered(workCenters)
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b text-left text-sm font-medium text-gray-700">
                <th className="px-4 py-3">Work Center</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Alternative Workcenters</th>
                <th className="px-4 py-3 text-right">Cost per hour</th>
                <th className="px-4 py-3 text-right">Capacity</th>
                <th className="px-4 py-3 text-right">Time Efficiency</th>
                <th className="px-4 py-3 text-right">OEE Target</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {localFiltered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? "No work centers found matching your search." : "No work centers yet."}
                  </td>
                </tr>
              ) : (
                localFiltered.map((wc) => (
                  <tr key={wc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{wc.work_center_name}</td>
                    <td className="px-4 py-3 text-gray-600">{wc.code || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{wc.tag || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{wc.alternative_workcenters || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {wc.cost_per_hour ? `$${Number(wc.cost_per_hour).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {wc.capacity ? Number(wc.capacity).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {wc.time_efficiency ? Number(wc.time_efficiency).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {wc.oee_target ? Number(wc.oee_target).toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/work-centers/${wc.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
