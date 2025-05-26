import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email: session.user.email },
    data: { password: hashed },
  });
  return NextResponse.json({ message: "Password changed successfully" });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
} 