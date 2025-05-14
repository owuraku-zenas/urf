// This file defines the database schema for the application
// In a real application, you would use this with a database ORM like Prisma

export type User = {
  id: string
  name: string
  email: string
  password: string // In a real app, this would be hashed
  role: "admin" | "user"
  createdAt: Date
  updatedAt: Date
}

export type Member = {
  id: string
  name: string
  email: string | null
  phone: string
  dateOfBirth: Date | null
  university: string | null
  program: string | null
  startYear: string | null
  hostel: string | null
  roomNumber: string | null
  cellGroupId: string | null
  invitedById: string | null
  createdAt: Date
  updatedAt: Date
}

export type Department = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export type CellGroup = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export type MemberDepartment = {
  memberId: string
  departmentId: string
  createdAt: Date
}

export type Event = {
  id: string
  name: string
  type: "midweek" | "sunday" | "prayer" | "special"
  date: Date
  description: string | null
  createdById: string // References User
  createdAt: Date
  updatedAt: Date
}

export type Attendance = {
  id: string
  eventId: string
  memberId: string
  status: "present" | "absent"
  createdAt: Date
  updatedAt: Date
}
