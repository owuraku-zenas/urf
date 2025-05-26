import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json();
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });
    }

    // Generate invite token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Create user with invite token and a random password
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: tempPassword,
        inviteToken: token,
        inviteTokenExpires: tokenExpires,
        status: "INVITED", // or similar field
      },
    });

    // Use environment variables for SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for others
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const setPasswordUrl = `${baseUrl}/set-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "You're invited! Set your password",
      html: `<p>Hello ${name},</p>
        <p>You have been invited to join. Click the link below to set your password:</p>
        <p><a href="${setPasswordUrl}">${setPasswordUrl}</a></p>
        <p>This link will expire in 24 hours.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to invite user." }, { status: 500 });
  }
} 