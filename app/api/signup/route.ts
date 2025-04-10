import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer"; // 👈 Import nodemailer

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { patient_name, patient_id, patient_mail, password } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email: patient_mail },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        name: patient_name,
        patientId: patient_id,
        email: patient_mail,
        passwordHash: hashedPassword,
        verificationToken: verificationToken,
      },
    });

    // ✉️ Send verification email here
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: patient_mail,
      subject: "Verify your email",
      text: `Hi ${patient_name}, please verify your email by clicking this link: ${verificationUrl}`,
      html: `<p>Hi ${patient_name},</p><p>Please verify your email by clicking the button below:</p><a href="${verificationUrl}">Verify Email</a>`,
    });

    return NextResponse.json({ message: "Signup successful. Please verify your email." });
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
