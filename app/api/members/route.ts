import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

function calculateAcademicLevel(admissionYear: string | undefined | null): string | null {
  if (!admissionYear) return null;
  const year = parseInt(admissionYear, 10);
  if (isNaN(year)) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based, August = 7
  let level = (currentYear - year) * 100;
  if (currentMonth >= 7) {
    level += 100; // Passed August, so they advanced to the next level
  }
  
  if (level <= 0) return "100";
  if (level > 400) return null; // Over 400 is atypical for explicit mapping
  return level.toString();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId;

    console.log("Fetching all members...")
    const members = await prisma.member.findMany({
      where: semesterId ? { joinedSemesterId: semesterId } : undefined,
      include: {
        commitments: {
          where: semesterId ? { semesterId } : undefined,
          select: {
            status: true,
            semesterId: true
          }
        },
        cellGroup: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        invitedBy: {
          select: {
            id: true,
            name: true
          }
        },
        invitees: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log(`Found ${members.length} members:`, JSON.stringify(members, null, 2))
    return NextResponse.json(members)
  } catch (error: any) {
    console.log("DB ERROR members GET ->", error?.message || String(error));
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Creating new member with data:", data)

    if (!data.cellGroupId) {
      return NextResponse.json(
        { error: "Cell group is required" },
        { status: 400 }
      )
    }

    // Extract IDs and remove them from the data object
    const {
      cellGroupId,
      invitedById,
      joinedSemesterId,
      admissionYear,
      currentAcademicLevel,
      birthMonth,
      birthDay,
      ...restData
    } = data

    const member = await prisma.member.create({
      data: {
        ...restData,
        birthMonth: birthMonth ? parseInt(birthMonth.toString()) : null,
        birthDay: birthDay ? parseInt(birthDay.toString()) : null,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        joinedSemester: joinedSemesterId ? {
          connect: { id: joinedSemesterId }
        } : undefined,
        admissionYear: admissionYear === "" ? null : admissionYear,
        currentAcademicLevel: calculateAcademicLevel(admissionYear === "" ? null : admissionYear),
        cellGroup: {
          connect: { id: cellGroupId }
        },
        invitedBy: invitedById ? {
          connect: { id: invitedById }
        } : undefined
      },
      include: {
        cellGroup: true,
        invitedBy: true
      }
    })

    console.log("Created new member:", member)
    return NextResponse.json(member)
  } catch (error: any) {
    console.log(">>>>>>>> DB ERROR ENCOUNTERED <<<<<<<<");
    console.log(error?.message || String(error));
    console.log(">>>>>>>> =================== <<<<<<<<");

    // Bypass Next.js console.error overrides which are crashing
    const errorMessage = error?.message || String(error);
    const errorCode = error?.code || 'UNKNOWN';

    if (error?.code === 'P2002') {
      const field = (error?.meta?.target as string[])?.[0] ?? 'field';
      return NextResponse.json(
        { error: `A member with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create member",
        details: errorMessage,
        code: errorCode,
        stack: error?.stack
      },
      { status: 500 }
    );
  }
}
