import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, email, role } = session.user;
  return NextResponse.json({ user: { name, email, role } });
}

export function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
} 