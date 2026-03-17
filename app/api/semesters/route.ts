import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * GET /api/semesters
 * Fetches all semesters.
 */
export async function GET() {
  try {
    const semesters = await db.semester.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
    return NextResponse.json(semesters);
  } catch (error) {
    console.error("[SEMESTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * POST /api/semesters
 * Creates a new semester. Admin only.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, academicYear, startDate, endDate, status } = body;

    if (!name || !academicYear || !startDate || !endDate || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj >= endDateObj) {
      return new NextResponse("End date must be after start date", { status: 400 });
    }

    // Enforce only one active semester
    if (status === "ACTIVE") {
      const activeSemester = await db.semester.findFirst({
        where: { status: "ACTIVE" },
      });
      if (activeSemester) {
        return new NextResponse("An active semester already exists. Please close it before activating a new one.", { status: 409 });
      }
    }

    // Prevent overlapping dates
    const overlappingSemester = await db.semester.findFirst({
      where: {
        OR: [
          // New semester starts during an existing one
          { startDate: { lte: startDateObj }, endDate: { gt: startDateObj } },
          // New semester ends during an existing one
          { startDate: { lt: endDateObj }, endDate: { gte: endDateObj } },
          // New semester engulfs an existing one
          { startDate: { gte: startDateObj }, endDate: { lte: endDateObj } },
        ],
      },
    });

    if (overlappingSemester) {
      return new NextResponse(`Date range overlaps with existing semester: "${overlappingSemester.name}"`, { status: 409 });
    }

    const semester = await db.semester.create({
      data: {
        name,
        academicYear,
        startDate: startDateObj,
        endDate: endDateObj,
        status,
      },
    });

    return NextResponse.json(semester);

  } catch (error) {
    console.error("[SEMESTERS_POST]", error);
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
        return new NextResponse("A semester with this name already exists.", { status: 409 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}