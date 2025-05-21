"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { z } from "zod"
import { use } from "react"

// Validation schema
const MemberFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").nullable().optional(),
  phone: z.string().min(1, "Phone number is required").regex(/^[0-9+\-\s()]*$/, "Invalid phone number format"),
  dateOfBirth: z.string().nullable().optional().transform(val => val === "" ? null : val),
  joinDate: z.string().min(1, "Join date is required"),
  university: z.string().max(100, "University name is too long").nullable().optional(),
  program: z.string().max(100, "Program name is too long").nullable().optional(),
  startYear: z.string().regex(/^\d{4}$/, "Start year must be a 4-digit number").nullable().optional(),
  hostel: z.string().max(50, "Hostel name is too long").nullable().optional(),
  roomNumber: z.string().max(20, "Room number is too long").nullable().optional(),
  cellGroupId: z.string().min(1, "Cell group is required"),
  invitedById: z.string().nullable().optional(),
})

type MemberFormData = z.infer<typeof MemberFormSchema>

interface CellGroup {
  id: string
  name: string
}

interface Member {
  id: string
  name: string
}

export default function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [errors, setErrors] = useState<Partial<Record<keyof MemberFormData, string>>>({})

  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    joinDate: "",
    university: "",
    program: "",
    startYear: "",
    hostel: "",
    roomNumber: "",
    cellGroupId: "",
    invitedById: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member data
        const memberResponse = await fetch(`/api/members/${id}`)
        if (!memberResponse.ok) {
          throw new Error("Failed to fetch member data")
        }
        const memberData = await memberResponse.json()
        
        // Format dates for input fields
        const formattedData = {
          ...memberData,
          dateOfBirth: memberData.dateOfBirth ? new Date(memberData.dateOfBirth).toISOString().split('T')[0] : "",
          joinDate: memberData.joinDate ? new Date(memberData.joinDate).toISOString().split('T')[0] : "",
        }
        
        setFormData(formattedData)

        // Fetch cell groups
        const cellGroupsResponse = await fetch("/api/cell-groups")
        if (!cellGroupsResponse.ok) {
          throw new Error("Failed to fetch cell groups")
        }
        const cellGroupsData = await cellGroupsResponse.json()
        setCellGroups(cellGroupsData)

        // Fetch members for inviter selection
        const membersResponse = await fetch("/api/members")
        if (!membersResponse.ok) {
          throw new Error("Failed to fetch members")
        }
        const membersData = await membersResponse.json()
        setMembers(membersData)
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

    fetchData()
  }, [id])

  const validateField = (name: keyof MemberFormData, value: string) => {
    try {
      MemberFormSchema.shape[name].parse(value)
      setErrors((prev) => ({ ...prev, [name]: undefined }))
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: error.errors[0].message }))
      }
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name as keyof MemberFormData, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate all fields
      const validationResult = MemberFormSchema.safeParse(formData)
      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof MemberFormData, string>> = {}
        validationResult.error.errors.forEach((error) => {
          const field = error.path[0] as keyof MemberFormData
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
        throw new Error("Please fix the form errors")
      }

      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update member")
      }

      toast({
        title: "Success",
        description: "Member has been updated successfully",
      })

      router.push(`/members/${id}`)
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update member. Please try again.",
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
          href={`/members/${id}`}
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
          Back to Member
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-1">Edit Member</h2>
          <p className="text-sm text-gray-500 mb-6">Update the member's information</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Full Name *
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
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="joinDate" className="block text-sm font-medium">
                  Join Date *
                </label>
                <input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.joinDate ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.joinDate && (
                  <p className="text-sm text-red-500">{errors.joinDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="university" className="block text-sm font-medium">
                  University
                </label>
                <input
                  id="university"
                  name="university"
                  value={formData.university ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.university ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.university && (
                  <p className="text-sm text-red-500">{errors.university}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="program" className="block text-sm font-medium">
                  Program Studied
                </label>
                <input
                  id="program"
                  name="program"
                  value={formData.program ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.program ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.program && (
                  <p className="text-sm text-red-500">{errors.program}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="startYear" className="block text-sm font-medium">
                  Start Year
                </label>
                <input
                  id="startYear"
                  name="startYear"
                  value={formData.startYear ?? ""}
                  onChange={handleChange}
                  placeholder="YYYY"
                  className={`w-full rounded-md border ${errors.startYear ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.startYear && (
                  <p className="text-sm text-red-500">{errors.startYear}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="hostel" className="block text-sm font-medium">
                  Hostel
                </label>
                <input
                  id="hostel"
                  name="hostel"
                  value={formData.hostel ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.hostel ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.hostel && (
                  <p className="text-sm text-red-500">{errors.hostel}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="roomNumber" className="block text-sm font-medium">
                  Room Number
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.roomNumber ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {errors.roomNumber && (
                  <p className="text-sm text-red-500">{errors.roomNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="cellGroupId" className="block text-sm font-medium">
                  Cell Group *
                </label>
                <select
                  id="cellGroupId"
                  name="cellGroupId"
                  value={formData.cellGroupId}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-md border ${errors.cellGroupId ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Select a cell group</option>
                  {cellGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.cellGroupId && (
                  <p className="text-sm text-red-500">{errors.cellGroupId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="invitedById" className="block text-sm font-medium">
                  Invited By
                </label>
                <select
                  id="invitedById"
                  name="invitedById"
                  value={formData.invitedById ?? ""}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${errors.invitedById ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.invitedById && (
                  <p className="text-sm text-red-500">{errors.invitedById}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Link
                href={`/members/${id}`}
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