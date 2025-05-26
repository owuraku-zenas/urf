import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        inviteToken: null,
        inviteTokenExpires: null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ message: "Password set successfully" });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 });
  }
} 