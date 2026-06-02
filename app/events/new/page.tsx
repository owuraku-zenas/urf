"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useSemester } from "@/context/semester-context"

interface Semester {
  id: string
  name: string
  status: "ACTIVE" | "CLOSED"
}

export default function NewEventPage() {
  const router = useRouter()
  const { selectedSemester } = useSemester()
  const [isLoading, setIsLoading] = useState(false)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [formData, setFormData] = useState({
    name: "",
    type: "MIDWEEK",
    date: "",
    description: "",
    semesterId: "",
  })

  useEffect(() => {
    async function fetchSemesters() {
      const res = await fetch("/api/semesters")
      if (res.ok) {
        const data: Semester[] = await res.json()
        setSemesters(data)
        // Pre-select the globally selected semester if it's a real ID, else fall back to ACTIVE
        const isRealId = selectedSemester && selectedSemester !== "all"
        const defaultId = isRealId
          ? selectedSemester
          : (data.find((s) => s.status === "ACTIVE")?.id ?? data[0]?.id ?? "")
        setFormData((prev) => ({ ...prev, semesterId: defaultId }))
      }
    }
    fetchSemesters()
  }, [selectedSemester])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.semesterId) {
      toast({ title: "Error", description: "Please select a semester.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create event")
      }

      toast({ title: "Success", description: "Event created successfully" })
      router.push("/events")
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              id="semesterId"
              name="semesterId"
              value={formData.semesterId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select a semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === "ACTIVE" ? "(Active)" : "(Closed)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="MIDWEEK">Midweek Service</option>
              <option value="SUNDAY">Sunday Service</option>
              <option value="PRAYER">Prayer Service</option>
              <option value="SPECIAL">Special Program</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date and Time
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
