import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: null,
        verified: true,
      },
    });

    return NextResponse.json({ message: "Email verified successfully.", patientId: user.patientId, name: user.name, });
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
