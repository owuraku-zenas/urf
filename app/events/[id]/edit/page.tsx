"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { use } from "react"
import { EventType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

// Validation schema
const EventFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.nativeEnum(EventType),
  date: z.string().min(1, "Date is required"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  preparations: z.string().max(2000, "Preparations text is too long").nullable().optional(),
  feedback: z.string().max(2000, "Feedback text is too long").nullable().optional(),
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
    preparations: "",
    feedback: "",
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
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>Update event details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Event name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  name="type"
                  value={formData.type}
                  onValueChange={(value) => handleChange({ target: { name: 'type', value } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EventType.SUNDAY}>Sunday Service</SelectItem>
                    <SelectItem value={EventType.MIDWEEK}>Midweek Service</SelectItem>
                    <SelectItem value={EventType.PRAYER}>Prayer Meeting</SelectItem>
                    <SelectItem value={EventType.SPECIAL}>Special Event</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Brief description of the event"
                  className="h-20"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preparations">Preparations/Plans</Label>
                <Textarea
                  id="preparations"
                  name="preparations"
                  value={formData.preparations || ""}
                  onChange={handleChange}
                  placeholder="What needs to be prepared for this event? What are the plans?"
                  className="h-32"
                />
                {errors.preparations && (
                  <p className="text-sm text-red-500">{errors.preparations}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="feedback">Feedback/Remarks</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback || ""}
                  onChange={handleChange}
                  placeholder="Any feedback or remarks about the event"
                  className="h-32"
                />
                {errors.feedback && (
                  <p className="text-sm text-red-500">{errors.feedback}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/events")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 