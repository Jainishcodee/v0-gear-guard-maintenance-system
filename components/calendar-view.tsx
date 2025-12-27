"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"

interface Request {
  id: string
  title: string
  priority: string
  status: string
  scheduled_date: string
  equipment?: { name: string }
  assigned_to?: { full_name: string }
}

interface CalendarViewProps {
  requests: Request[]
}

export function CalendarView({ requests }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getRequestsForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split("T")[0]
    return requests.filter((req) => {
      const reqDate = new Date(req.scheduled_date).toISOString().split("T")[0]
      return reqDate === dateStr
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  }

  // Calculate empty cells before first day
  const emptyCells = Array.from({ length: startingDayOfWeek }, (_, i) => i)

  // Calculate all days in month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const today = new Date()
  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="hidden sm:inline-flex">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {emptyCells.map((i) => (
              <div key={`empty-${i}`} className="min-h-24 rounded-lg border bg-muted/30" />
            ))}

            {/* Days */}
            {days.map((day) => {
              const dayRequests = getRequestsForDate(day)
              return (
                <div
                  key={day}
                  className={`min-h-24 rounded-lg border p-2 ${
                    isToday(day) ? "border-primary bg-primary/5" : "bg-card"
                  }`}
                >
                  <div className={`mb-1 text-sm font-medium ${isToday(day) ? "text-primary" : ""}`}>{day}</div>
                  <div className="space-y-1">
                    {dayRequests.slice(0, 3).map((request) => (
                      <Link key={request.id} href={`/dashboard/requests/${request.id}`}>
                        <div className="group cursor-pointer rounded px-1.5 py-1 text-xs hover:bg-muted">
                          <div className="flex items-center gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                priorityColors[request.priority as keyof typeof priorityColors]
                              }`}
                            />
                            <span className="line-clamp-1 flex-1 group-hover:underline">{request.title}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {dayRequests.length > 3 && (
                      <div className="px-1.5 text-xs text-muted-foreground">+{dayRequests.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Scheduled Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests
                .filter((req) => new Date(req.scheduled_date) >= new Date())
                .slice(0, 10)
                .map((request) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            priorityColors[request.priority as keyof typeof priorityColors]
                          }`}
                        />
                        <span className="font-medium">{request.title}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {request.equipment && <span>{request.equipment.name}</span>}
                        {request.assigned_to && (
                          <>
                            <span>•</span>
                            <span>{request.assigned_to.full_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="font-medium">{new Date(request.scheduled_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(request.scheduled_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[request.status as keyof typeof statusColors]}>
                        {request.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">No scheduled maintenance requests</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
