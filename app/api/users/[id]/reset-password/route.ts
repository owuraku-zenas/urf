import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    // Await params if necessary (for Next.js 13+ dynamic API routes)
    const id = typeof params.then === "function" ? (await params).id : params.id;
    const userId = id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Generate new invite token and expiry
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
    const tempPassword = crypto.randomBytes(16).toString("hex");

    // Update user: set temp password, invite token, and status
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: tempPassword,
        inviteToken: token,
        inviteTokenExpires: tokenExpires,
        status: "INVITED",
      },
    });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset your password",
      html: `<p>Hello ${user.name || user.email},</p>
        <p>Your password has been reset by an admin. Please <a href="${setPasswordUrl}">click here to set a new password</a>.</p>
        <p>This link will expire in 24 hours.</p>`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
} 