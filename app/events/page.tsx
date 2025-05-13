"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus } from "lucide-react"

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock event data
      setEvents([
        {
          id: "1",
          name: "Sunday Service",
          type: "SUNDAY",
          date: new Date("2024-04-21T09:00:00Z"),
          createdBy: { name: "Admin User" },
          _count: { attendances: 30 },
        },
        {
          id: "2",
          name: "Midweek Service",
          type: "MIDWEEK",
          date: new Date("2024-04-17T18:00:00Z"),
          createdBy: { name: "Admin User" },
          _count: { attendances: 20 },
        },
        {
          id: "3",
          name: "Prayer Meeting",
          type: "PRAYER",
          date: new Date("2024-04-12T19:00:00Z"),
          createdBy: { name: "Admin User" },
          _count: { attendances: 15 },
        },
        {
          id: "4",
          name: "Sunday Service",
          type: "SUNDAY",
          date: new Date("2024-04-14T09:00:00Z"),
          createdBy: { name: "Admin User" },
          _count: { attendances: 28 },
        },
        {
          id: "5",
          name: "Midweek Service",
          type: "MIDWEEK",
          date: new Date("2024-04-10T18:00:00Z"),
          createdBy: { name: "Admin User" },
          _count: { attendances: 18 },
        },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatEventType(event.type).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Church Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Event
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Search</CardTitle>
          <CardDescription>Search for events by name, type, or date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Showing {filteredEvents.length} church events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading events...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell className="font-medium">No events found</TableCell>
                  <TableCell colSpan={5}></TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{formatEventType(event.type)}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.createdBy.name}</TableCell>
                    <TableCell>{event._count.attendances}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/attendance/${event.id}`}>Mark Attendance</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function formatEventType(type: string) {
  const types = {
    MIDWEEK: "Midweek Service",
    SUNDAY: "Sunday Service",
    PRAYER: "Prayer Service",
    SPECIAL: "Special Program",
  }
  return types[type as keyof typeof types] || type
}
