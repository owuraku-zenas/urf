import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { calculateAcademicLevel } from "@/lib/progression"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId;
    // commitmentSemesterId controls which commitment record is included per member —
    // it does not affect which members appear.
    const rawCommitmentSemesterId = searchParams.get("commitmentSemesterId")
    const commitmentSemesterId = rawCommitmentSemesterId && rawCommitmentSemesterId !== 'all'
      ? rawCommitmentSemesterId
      : null;

    let memberWhere: Prisma.MemberWhereInput | undefined = undefined;
    if (semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        select: { startDate: true, endDate: true },
      });
      if (semester?.startDate && semester?.endDate) {
        memberWhere = { joinDate: { gte: semester.startDate, lte: semester.endDate } };
      }
    }

    const members = await prisma.member.findMany({
      where: memberWhere,
      include: {
        commitments: {
          select: { status: true, semesterId: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        cellGroup: {
          select: { id: true, name: true, description: true },
        },
        invitedBy: {
          select: { id: true, name: true },
        },
        invitees: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(members)
  } catch (error: any) {
    console.log("DB ERROR members GET ->", error?.message || String(error));
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (!data.cellGroupId) {
      return NextResponse.json({ error: "Cell group is required" }, { status: 400 })
    }

    const {
      cellGroupId,
      invitedById,
      joinedSemesterId: _ignored,
      admissionYear,
      admissionMonth,
      programDuration,
      currentAcademicLevel,
      birthMonth,
      birthDay,
      ...restData
    } = data

    const raw = data.joinDate ? new Date(data.joinDate) : new Date();
    const joinDateObj = new Date(raw.getFullYear(), raw.getMonth(), 1, 0, 0, 0, 0);

    // Find the semester whose date range covers joinDate — used only to create
    // an initial commitment record, not stored as a FK.
    let commitmentSemesterId: string | null = null;
    let initialCommitmentStatus: 'NEW_MEMBER' | 'COMMITTED' = 'NEW_MEMBER';

    const matchingSemester = await prisma.semester.findFirst({
      where: {
        startDate: { lte: joinDateObj },
        endDate: { gte: joinDateObj },
      },
    });

    if (matchingSemester) {
      commitmentSemesterId = matchingSemester.id;
      if (matchingSemester.isArchive) {
        initialCommitmentStatus = 'COMMITTED';
      }
    }

    const member = await prisma.member.create({
      data: {
        ...restData,
        birthMonth: birthMonth ? parseInt(birthMonth.toString()) : null,
        birthDay: birthDay ? parseInt(birthDay.toString()) : null,
        joinDate: joinDateObj,
        admissionYear: admissionYear === "" ? null : admissionYear,
        admissionMonth: admissionMonth ? parseInt(admissionMonth.toString()) : 8,
        programDuration: programDuration ? parseInt(programDuration.toString()) : 4,
        currentAcademicLevel: calculateAcademicLevel(
          admissionYear === "" ? null : admissionYear,
          admissionMonth ? parseInt(admissionMonth.toString()) : 8,
          programDuration ? parseInt(programDuration.toString()) : 4
        ),
        cellGroup: { connect: { id: cellGroupId } },
        invitedBy: invitedById ? { connect: { id: invitedById } } : undefined,
        commitments: commitmentSemesterId ? {
          create: { semesterId: commitmentSemesterId, status: initialCommitmentStatus },
        } : undefined,
      },
      include: {
        cellGroup: true,
        invitedBy: true,
        commitments: true,
      },
    })

    return NextResponse.json(member)
  } catch (error: any) {
    console.log(">>>>>>>> DB ERROR ENCOUNTERED <<<<<<<<");
    console.log(error?.message || String(error));
    console.log(">>>>>>>> =================== <<<<<<<<");

    if (error?.code === 'P2002') {
      const field = (error?.meta?.target as string[])?.[0] ?? 'field';
      return NextResponse.json(
        { error: `A member with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create member", details: error?.message, code: error?.code },
      { status: 500 }
    );
  }
}
