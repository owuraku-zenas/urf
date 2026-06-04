import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper random pickers
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Kwame", "Kofi", "Yaw", "Kojo", "Amma", "Abena", "Akua", "Yaa", "Efua"]
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Mensah", "Osei", "Owusu", "Boateng", "Appiah", "Frimpong", "Annan", "Asante", "Agyemang", "Boakye", "Ofori"]
const universities = ["University of Ghana", "KNUST", "UCC", "Ashesi University", "UPSA"]
const programs = ["BSc Computer Science", "BSc Engineering", "BA Business", "BSc Economics", "BA Political Science", "BSc Nursing"]
const hostels = ["Evandy Hostel", "TF Hostel", "Pentagon", "Bani", "James Topp", "Nelson Mandela"]
const academicLevels = ["100", "200", "300", "400", "500", "Masters", "PhD"]

async function main() {
  console.log("Starting bulk database seed (50 targets)...")

  // 0. Wipe DB
  await prisma.smsLog.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.semesterCommitment.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.member.deleteMany({})
  await prisma.cellGroup.deleteMany({})

  // 1. Create Semesters
  const semestersData = [
    { name: "Fall 2024", academicYear: "2024/2025", startDate: new Date("2024-08-01"), endDate: new Date("2024-12-15"), status: "CLOSED" as const },
    { name: "Spring 2025", academicYear: "2024/2025", startDate: new Date("2025-01-10"), endDate: new Date("2025-05-30"), status: "CLOSED" as const },
    { name: "Fall 2025", academicYear: "2025/2026", startDate: new Date("2025-08-01"), endDate: new Date("2025-12-15"), status: "ACTIVE" as const }
  ]
  const semesters = []
  for (const s of semestersData) {
    const sem = await prisma.semester.upsert({
      where: { name: s.name },
      update: {},
      create: s
    })
    semesters.push(sem)
  }

  // 2. Create Cell Groups
  const cellGroupsData = ["Diaspora", "Pent", "Volta Hall", "Main Campus"]
  const cellGroups = []
  for (const c of cellGroupsData) {
    const cg = await prisma.cellGroup.upsert({
      where: { name: c },
      update: {},
      create: { name: c, description: `The incredible ${c} family.` }
    })
    cellGroups.push(cg)
  }

  // 3. Create Users
  const password = await bcrypt.hash('password123', 10)
  const mainAdmin = await prisma.user.upsert({
    where: { email: 'admin@urf.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@urf.com',
      password,
      role: 'ADMIN'
    }
  })

  // 4. Create 50 Members
  console.log("Seeding 50 Members...")
  const members = []
  for (let i = 0; i < 50; i++) {
    const fName = randomElement(firstNames)
    const lName = randomElement(lastNames)
    const joinedSem = randomElement(semesters)
    
    // Simulate some recent dates, some old dates
    const isBirthdayNear = Math.random() > 0.8;
    const today = new Date();
    let birthMonth = randomInt(1, 12);
    let birthDay = randomInt(1, 28);
    
    if (isBirthdayNear) {
       birthMonth = today.getMonth() + 1;
       birthDay = today.getDate() + randomInt(1, 10);
       if (birthDay > 28) birthDay = 28;
    }

    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`

    // Check if exists
    let member = await prisma.member.findUnique({ where: { email } })
    if (!member) {
      member = await prisma.member.create({
        data: {
          name: `${fName} ${lName}`,
          email,
          phone: `024${randomInt(1000000, 9999999)}`,
          university: randomElement(universities),
          program: randomElement(programs),
          admissionYear: (randomInt(2020, 2025)).toString(),
          currentAcademicLevel: randomElement(academicLevels),
          hostel: randomElement(hostels),
          roomNumber: `Rm ${randomInt(10, 999)}`,
          birthMonth,
          birthDay,
          cellGroupId: randomElement(cellGroups).id,
          joinDate: new Date((joinedSem.startDate ?? new Date()).getTime() + randomInt(1000, 10000000)),
        }
      })
    }
    members.push(member)
  }

  // 5. Create Events
  console.log("Seeding Extensive Events...")
  const eventTypes = ["SUNDAY", "MIDWEEK", "PRAYER", "SPECIAL"] as const;
  const events = [];
  for (const sem of semesters) {
    for (let i = 1; i <= 15; i++) { // 15 events per semester
      const eventDate = new Date((sem.startDate ?? new Date()).getTime() + (i * 4 * 24 * 60 * 60 * 1000))
      events.push(await prisma.event.create({
        data: {
          name: `Week ${i} Service`,
          type: randomElement(eventTypes as any),
          date: eventDate,
          semesterId: sem.id,
          description: `Gathering for week ${i}`
        }
      }))
    }
  }

  // 6. Create Attendance & Commitments
  console.log("Seeding Attendance and Commitments in batches... (Super fast!)")
  
  const attendancePayload = []
  const commitmentPayload = []
  
  for (const sem of semesters) {
    const semEvents = events.filter(e => e.semesterId === sem.id);
    if (semEvents.length === 0) continue;

    for (const member of members) {
      const semStart = sem.startDate ?? new Date(0);
      const randStart = randomElement(semesters).startDate ?? new Date(0);
      if (semStart < randStart && Math.random() > 0.5) continue;

      let attendances = 0;
      for (const ev of semEvents) {
        const present = Math.random() > 0.3; // Bias towards present
        if (present) {
           attendances++;
        }
        attendancePayload.push({
           eventId: ev.id,
           memberId: member.id,
           status: present ? "PRESENT" : "ABSENT",
        })
      }

      const attendanceRatio = attendances / semEvents.length;
      let status: 'COMMITTED' | 'UNCOMMITTED' | 'AT_RISK' = 'UNCOMMITTED';
      if (attendanceRatio >= 0.75) status = 'COMMITTED';
      else if (attendanceRatio >= 0.4) status = 'AT_RISK';
      
      commitmentPayload.push({
         memberId: member.id,
         semesterId: sem.id,
         status
      })
    }
  }

  await prisma.attendance.createMany({ data: attendancePayload as any })
  await prisma.semesterCommitment.createMany({ data: commitmentPayload as any })

  // 7. Generate SMS Logs
  console.log("Seeding SMS History...")
  const smsPayload = []
  for (const member of members) {
    if (Math.random() > 0.4) {
      smsPayload.push({
        recipientId: member.id,
        phoneNumber: member.phone,
        message: `Hello ${member.name.split(" ")[0]}, don't forget our meeting this Friday!`,
        status: Math.random() > 0.1 ? "DELIVERED" : "FAILED",
      })
    }
    if (Math.random() > 0.7) {
      smsPayload.push({
        recipientId: member.id,
        phoneNumber: member.phone,
        message: `Happy Birthday ${member.name.split(" ")[0]}! We celebrate you today!`,
        status: "DELIVERED",
      })
    }
  }
  await prisma.smsLog.createMany({ data: smsPayload as any })

  console.log("✅ Successfully seeded 50 members, semesters, events, cell groups, deep attendance logs, and SMS history!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
