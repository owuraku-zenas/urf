import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const semester = await db.semester.findUnique({ where: { id } });

    if (!semester) {
      return new NextResponse("Semester not found", { status: 404 });
    }

    return NextResponse.json(semester);
  } catch (error) {
    console.error("[SEMESTER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, academicYear, startMonth, startYear, endMonth, endYear, status, isArchive } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (academicYear) updateData.academicYear = academicYear;
    if (status) updateData.status = status;
    if (isArchive !== undefined) updateData.isArchive = isArchive;

    if (startMonth && startYear && endMonth && endYear) {
      updateData.startDate = new Date(Number(startYear), Number(startMonth) - 1, 1, 0, 0, 0, 0);
      updateData.endDate = new Date(Number(endYear), Number(endMonth), 0, 23, 59, 59, 999);
    }

    if (status === "ACTIVE") {
      await db.semester.updateMany({
        where: { status: "ACTIVE", id: { not: id } },
        data: { status: "CLOSED" },
      });
    }

    const semester = await db.semester.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(semester);
  } catch (error) {
    console.error("[SEMESTER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (session.user.email !== "urfzone4@gmail.com") {
      return new NextResponse("Forbidden: Only the Super Admin can randomly delete Semesters. Please mark it as CLOSED instead.", { status: 403 });
    }

    const { id } = await params;
    const semester = await db.semester.delete({ where: { id } });

    return NextResponse.json(semester);
  } catch (error) {
    console.error("[SEMESTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
