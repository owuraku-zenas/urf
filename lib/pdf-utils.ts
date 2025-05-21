import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CellGroup, Member, Event, Attendance, EventType } from '@prisma/client'

interface ExportOptions {
  title: string
  subtitle?: string
  filename: string
}

interface MemberWithCellGroup {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  university: string
  program: string
  startYear: string
  hostel: string
  roomNumber: string
  createdAt: string
  updatedAt: string
  cellGroupId: string | null
  invitedById: string | null
  cellGroup: {
    id: string
    name: string
    description?: string | null
  } | null
}

interface CellGroupWithMembers extends CellGroup {
  members: Member[]
}

interface AttendanceWithMember extends Attendance {
  member: MemberWithCellGroup
}

interface EventWithAttendance extends Event {
  attendance: AttendanceWithMember[]
}

export const generateMemberListPDF = (
  members: MemberWithCellGroup[],
  options: ExportOptions
) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  if (options.subtitle) {
    doc.setFontSize(12)
    doc.text(options.subtitle, 14, 30)
  }

  // Add table
  autoTable(doc, {
    startY: options.subtitle ? 40 : 30,
    head: [['Name', 'Phone', 'Email', 'Cell Group', 'Join Date']],
    body: members.map(member => [
      member.name,
      member.phone,
      member.email || 'N/A',
      member.cellGroup?.name || 'N/A',
      new Date(member.createdAt).toLocaleDateString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`${options.filename}.pdf`)
}

export const generateCellGroupMembersPDF = (
  cellGroup: CellGroupWithMembers,
  options: ExportOptions
) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  if (options.subtitle) {
    doc.setFontSize(12)
    doc.text(options.subtitle, 14, 30)
  }

  // Add cell group info
  doc.setFontSize(14)
  doc.text(`Cell Group: ${cellGroup.name}`, 14, options.subtitle ? 40 : 30)
  doc.text(`Total Members: ${cellGroup.members.length}`, 14, options.subtitle ? 50 : 40)

  // Add table
  autoTable(doc, {
    startY: options.subtitle ? 60 : 50,
    head: [['Name', 'Phone', 'Email', 'Join Date']],
    body: cellGroup.members.map(member => [
      member.name,
      member.phone,
      member.email || 'N/A',
      new Date(member.createdAt).toLocaleDateString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`${options.filename}.pdf`)
}

export const generateEventAttendancePDF = (
  event: EventWithAttendance,
  options: ExportOptions
) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  if (options.subtitle) {
    doc.setFontSize(12)
    doc.text(options.subtitle, 14, 30)
  }

  // Add event info
  doc.setFontSize(14)
  doc.text(`Event: ${event.name}`, 14, options.subtitle ? 40 : 30)
  doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, options.subtitle ? 50 : 40)
  doc.text(`Type: ${event.type}`, 14, options.subtitle ? 60 : 50)
  doc.text(`Total Attendance: ${event.attendance.length}`, 14, options.subtitle ? 70 : 60)

  // Add table
  autoTable(doc, {
    startY: options.subtitle ? 80 : 70,
    head: [['Name', 'Phone', 'Cell Group', 'Marked At']],
    body: event.attendance.map(attendance => [
      attendance.member.name,
      attendance.member.phone,
      attendance.member.cellGroup?.name || 'N/A',
      new Date(attendance.createdAt).toLocaleString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`${options.filename}.pdf`)
}

export const generateAttendanceTrendsPDF = (
  events: EventWithAttendance[],
  cellGroups: CellGroupWithMembers[],
  options: ExportOptions
) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(options.title, 14, 20)
  if (options.subtitle) {
    doc.setFontSize(12)
    doc.text(options.subtitle, 14, 30)
  }

  let yOffset = options.subtitle ? 40 : 30

  // Add overall attendance trends
  doc.setFontSize(16)
  doc.text('Overall Attendance Trends', 14, yOffset)
  yOffset += 10

  // Add table for overall attendance
  autoTable(doc, {
    startY: yOffset,
    head: [['Event', 'Date', 'Type', 'Attendance Count', 'Percentage']],
    body: events.map(event => [
      event.name,
      new Date(event.date).toLocaleDateString(),
      event.type,
      event.attendance.length.toString(),
      `${Math.round((event.attendance.length / cellGroups.reduce((sum, group) => sum + group.members.length, 0)) * 100)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  })

  yOffset = (doc as any).lastAutoTable.finalY + 20

  // Add cell group specific trends
  doc.setFontSize(16)
  doc.text('Cell Group Attendance Trends', 14, yOffset)
  yOffset += 10

  // Add table for cell group attendance
  autoTable(doc, {
    startY: yOffset,
    head: [['Cell Group', 'Total Members', 'Average Attendance', 'Attendance Rate']],
    body: cellGroups.map(group => {
      const totalAttendance = events.reduce((sum, event) => 
        sum + event.attendance.filter(a => a.member.cellGroupId === group.id).length, 0)
      const avgAttendance = totalAttendance / events.length
      const attendanceRate = (avgAttendance / group.members.length) * 100

      return [
        group.name,
        group.members.length.toString(),
        avgAttendance.toFixed(1),
        `${attendanceRate.toFixed(1)}%`
      ]
    }),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`${options.filename}.pdf`)
} 