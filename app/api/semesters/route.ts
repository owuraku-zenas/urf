import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  try {
    const semesters = await db.semester.findMany({
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(semesters);
  } catch (error) {
    console.error("[SEMESTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, academicYear, startMonth, startYear, endMonth, endYear, status, isArchive } = body;

    if (!name || !academicYear || !status || !startMonth || !startYear || !endMonth || !endYear) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const startDateObj = new Date(Number(startYear), Number(startMonth) - 1, 1, 0, 0, 0, 0);
    const endDateObj = new Date(Number(endYear), Number(endMonth), 0, 23, 59, 59, 999);

    if (startDateObj >= endDateObj) {
      return new NextResponse("End month must be after start month", { status: 400 });
    }

    if (status === "ACTIVE") {
      await db.semester.updateMany({ where: { status: "ACTIVE" }, data: { status: "CLOSED" } });
    }

    const overlapping = await db.semester.findFirst({
      where: {
        OR: [
          { startDate: { lte: startDateObj }, endDate: { gt: startDateObj } },
          { startDate: { lt: endDateObj }, endDate: { gte: endDateObj } },
          { startDate: { gte: startDateObj }, endDate: { lte: endDateObj } },
        ],
      },
    });
    if (overlapping) {
      return new NextResponse(`Date range overlaps with existing semester: "${overlapping.name}"`, { status: 409 });
    }

    const semester = await db.semester.create({
      data: {
        name,
        academicYear,
        startDate: startDateObj,
        endDate: endDateObj,
        status,
        isArchive: isArchive === true,
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
