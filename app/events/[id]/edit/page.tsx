"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { use } from "react"
import { EventType } from "@prisma/client"

// Validation schema
const EventFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.nativeEnum(EventType),
  date: z.string().min(1, "Date is required"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
})

type EventFormData = z.infer<typeof EventFormSchema>

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    type: EventType.SUNDAY,
    date: "",
    description: "",
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch event data")
        }
        const eventData = await response.json()
        
        // Format date for input field
        const formattedData = {
          ...eventData,
          date: new Date(eventData.date).toISOString().split('T')[0],
        }
        
        setFormData(formattedData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const validateField = (name: keyof EventFormData, value: string) => {
    try {
      EventFormSchema.shape[name].parse(value)
      setErrors((prev) => ({ ...prev, [name]: undefined }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: error.errors[0].message }))
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name as keyof EventFormData, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate all fields
      const validationResult = EventFormSchema.safeParse(formData)
      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof EventFormData, string>> = {}
        validationResult.error.errors.forEach((error) => {
          const field = error.path[0] as keyof EventFormData
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
        throw new Error("Please fix the form errors")
      }

      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update event")
      }

      toast({
        title: "Success",
        description: "Event has been updated successfully",
      })

      router.push(`/events/${id}`)
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link
          href={`/events/${id}`}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Event
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-1">Edit Event</h2>
          <p className="text-sm text-gray-500 mb-6">Update the event's information</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Event Name *
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium">
                  Event Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.type ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  {Object.values(EventType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium">
                  Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.date ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description ?? ""}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Link
                href={`/events/${id}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 