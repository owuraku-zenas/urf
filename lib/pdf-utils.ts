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
  joinDate: string
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
      new Date(member.joinDate).toLocaleDateString()
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

  let yOffset = options.subtitle ? 40 : 30

  // Add event details section
  doc.setFontSize(16)
  doc.text('Event Details', 14, yOffset)
  yOffset += 10

  doc.setFontSize(12)
  doc.text(`Event Name: ${event.name}`, 14, yOffset)
  yOffset += 7
  doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, yOffset)
  yOffset += 7
  doc.text(`Type: ${event.type.replace(/_/g, ' ')}`, 14, yOffset)
  yOffset += 7
  doc.text(`Total Attendance: ${event.attendance.length}`, 14, yOffset)
  yOffset += 15

  // Add description if exists
  if (event.description) {
    doc.setFontSize(14)
    doc.text('Description', 14, yOffset)
    yOffset += 7
    
    doc.setFontSize(12)
    const descriptionLines = doc.splitTextToSize(event.description, 180)
    doc.text(descriptionLines, 14, yOffset)
    yOffset += (descriptionLines.length * 7) + 10
  }

  // Add preparations if exists
  if (event.preparations) {
    doc.setFontSize(14)
    doc.text('Preparations/Plans', 14, yOffset)
    yOffset += 7
    
    doc.setFontSize(12)
    const preparationsLines = doc.splitTextToSize(event.preparations, 180)
    doc.text(preparationsLines, 14, yOffset)
    yOffset += (preparationsLines.length * 7) + 10
  }

  // Add feedback if exists
  if (event.feedback) {
    doc.setFontSize(14)
    doc.text('Feedback/Remarks', 14, yOffset)
    yOffset += 7
    
    doc.setFontSize(12)
    const feedbackLines = doc.splitTextToSize(event.feedback, 180)
    doc.text(feedbackLines, 14, yOffset)
    yOffset += (feedbackLines.length * 7) + 15
  }

  // Add attendance list
  doc.setFontSize(14)
  doc.text('Attendance List', 14, yOffset)
  yOffset += 10

  // Add table
  autoTable(doc, {
    startY: yOffset,
    head: [['Name', 'Phone', 'Cell Group']],
    body: event.attendance.map(attendance => [
      attendance.member.name,
      attendance.member.phone,
      attendance.member.cellGroup?.name || 'N/A'
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

export const generateReportWithChartsPDF = async (
  title: string,
  charts: { title: string; data: any[]; type: 'line' | 'bar' | 'pie' }[],
  options: ExportOptions
) => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(24)
    doc.text(options.title, 14, 20)
    if (options.subtitle) {
      doc.setFontSize(12)
      doc.text(options.subtitle, 14, 30)
    }

    let yOffset = options.subtitle ? 40 : 30

    // Add each chart
    for (const chart of charts) {
      try {
        // Add chart title
        doc.setFontSize(18)
        doc.text(chart.title, 14, yOffset)
        yOffset += 10

        // Create a canvas element to render the chart
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 400
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Failed to create canvas context')
        }

        // Set background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const width = 700
        const height = 300
        const padding = 60
        const chartWidth = width - padding * 2
        const chartHeight = height - padding * 2

        // Calculate data ranges
        const values = chart.data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Add some padding to the range, handle case with single value
        const range = max === min ? min * 0.1 : max - min;
        const paddedMin = Math.max(0, min === max ? min * 0.9 : min - range * 0.1);
        let paddedMax = max === min ? max * 1.1 : max + range * 0.1;
        
        // Ensure paddedMin and paddedMax are different for single data point
        if (paddedMin === paddedMax) {
            paddedMax = paddedMin + 1; // Add a small range
        }

        // Render chart based on type
        if (chart.type === 'line') {
          // Draw chart area
          ctx.fillStyle = '#f8fafc'
          ctx.fillRect(padding, padding, chartWidth, chartHeight)

          // Draw grid lines
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth = 1
          const gridLines = 5
          for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight * i) / gridLines
            ctx.beginPath()
            ctx.moveTo(padding, y)
            ctx.lineTo(width - padding, y)
            ctx.stroke()
          }

          // Draw axes
          ctx.strokeStyle = '#64748b'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(padding, padding)
          ctx.lineTo(padding, height - padding)
          ctx.lineTo(width - padding, height - padding)
          ctx.stroke()

          // Draw axis labels
          ctx.fillStyle = '#64748b'
          ctx.font = '12px Arial'
          ctx.textAlign = 'right'
          for (let i = 0; i <= gridLines; i++) {
            const value = paddedMin + ((paddedMax - paddedMin) * i) / gridLines
            const y = padding + (chartHeight * i) / gridLines
            ctx.fillText(value.toFixed(0), padding - 10, y + 4)
          }

          // Draw data points and lines
          const xStep = chart.data.length > 1 ? chartWidth / (chart.data.length - 1) : 0;
          const yStep = chartHeight / (paddedMax - paddedMin)

          // Draw line
          ctx.beginPath()
          ctx.strokeStyle = '#2563eb'
          ctx.lineWidth = 3
          chart.data.forEach((point, i) => {
            const x = padding + i * xStep
            const y = height - padding - (point.value - paddedMin) * yStep
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })
          ctx.stroke()

          // Draw data points
          ctx.fillStyle = '#2563eb'
          chart.data.forEach((point, i) => {
            const x = padding + i * xStep
            const y = height - padding - (point.value - paddedMin) * yStep
            ctx.beginPath()
            ctx.arc(x, y, 4, 0, Math.PI * 2)
            ctx.fill()
          })

          // Draw x-axis labels
          ctx.fillStyle = '#64748b'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          chart.data.forEach((point, i) => {
            const x = padding + i * xStep
            const y = height - padding + 20
            ctx.fillText(point.label, x, y)
          })
        } else if (chart.type === 'bar') {
           // Draw chart area
           ctx.fillStyle = '#f8fafc'
           ctx.fillRect(padding, padding, chartWidth, chartHeight)

           // Draw grid lines
           ctx.strokeStyle = '#e2e8f0'
           ctx.lineWidth = 1
           const gridLines = 5
           for (let i = 0; i <= gridLines; i++) {
             const y = padding + (chartHeight * i) / gridLines
             ctx.beginPath()
             ctx.moveTo(padding, y)
             ctx.lineTo(width - padding, y)
             ctx.stroke()
           }

           // Draw axes
           ctx.strokeStyle = '#64748b'
           ctx.lineWidth = 2
           ctx.beginPath()
           ctx.moveTo(padding, padding)
           ctx.lineTo(padding, height - padding)
           ctx.lineTo(width - padding, height - padding)
           ctx.stroke()

           // Draw axis labels
           ctx.fillStyle = '#64748b'
           ctx.font = '12px Arial'
           ctx.textAlign = 'right'
           for (let i = 0; i <= gridLines; i++) {
             const value = paddedMin + ((paddedMax - paddedMin) * i) / gridLines
             const y = padding + (chartHeight * i) / gridLines
             ctx.fillText(value.toFixed(0), padding - 10, y + 4)
           }

           // Draw bars
           const barWidth = chart.data.length > 0 ? chartWidth / chart.data.length * 0.6 : 0;
           const xStep = chart.data.length > 0 ? chartWidth / chart.data.length : 0;
           const yStep = chartHeight / (paddedMax - paddedMin);
           
           chart.data.forEach((point, i) => {
             const x = padding + i * xStep + (xStep - barWidth) / 2;
             const barHeight = (point.value - paddedMin) * yStep;
             const y = height - padding - barHeight;

             ctx.fillStyle = '#2563eb'; // Use a consistent color
             ctx.fillRect(x, y, barWidth, barHeight);

             // Draw value label above the bar
             ctx.fillStyle = '#000';
             ctx.font = '10px Arial';
             ctx.textAlign = 'center';
             ctx.fillText(point.value.toString(), x + barWidth / 2, y - 5);
             
             // Draw x-axis label below the bar
             ctx.fillStyle = '#64748b';
             ctx.font = '12px Arial';
             ctx.textAlign = 'center';
             ctx.fillText(point.label, x + barWidth / 2, height - padding + 15);
           });
        } else if (chart.type === 'pie') {
            const centerX = padding + chartWidth / 2;
            const centerY = padding + chartHeight / 2;
            const radius = Math.min(chartWidth, chartHeight) / 2 * 0.8; // Use 80% of the available space
            let startAngle = 0;
            const total = chart.data.reduce((sum, point) => sum + point.value, 0);

            // Define some colors
            const colors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4', '#8BC34A', '#FFEB3B', '#FF9800', '#E91E63'];

            chart.data.forEach((point, i) => {
                const sliceAngle = (point.value / total) * 2 * Math.PI;
                const endAngle = startAngle + sliceAngle;

                ctx.fillStyle = colors[i % colors.length];
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fill();

                // Draw slice label (percentage and value)
                const labelAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 1.2; // Position labels outside the circle
                const labelX = centerX + labelRadius * Math.cos(labelAngle);
                const labelY = centerY + labelRadius * Math.sin(labelAngle);

                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const percentage = total === 0 ? 0 : ((point.value / total) * 100).toFixed(1);
                ctx.fillText(`${point.label}: ${point.value} (${percentage}%)`, labelX, labelY);

                startAngle = endAngle;
            });

        }
        else {
          throw new Error(`Unsupported chart type: ${chart.type}`)
        }

        // Add chart image to PDF
        const imgData = canvas.toDataURL('image/png')
        doc.addImage(imgData, 'PNG', 14, yOffset, 180, 100)
        yOffset += 120

        // Add new page if we're running out of space
        if (yOffset > 250) {
          doc.addPage()
          yOffset = 20
        }
      } catch (error) {
        console.error(`Error rendering chart "${chart.title}":`, error)
        // Add error message to PDF
        doc.setFontSize(12)
        doc.setTextColor(255, 0, 0)
        doc.text(`Error rendering chart: ${chart.title}`, 14, yOffset)
        doc.setTextColor(0, 0, 0)
        yOffset += 20
      }
    }

    doc.save(`${options.filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 