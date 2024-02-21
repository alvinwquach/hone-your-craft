import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Return a success response
    return NextResponse.json({ success: true, user });
  } catch (error) {
    // Handle errors
    console.error("Error occurred:", error);
    // Return an error response
    return NextResponse.json(
      { success: false, message: "Error creating a user" },
      { status: 500 }
    );
  }
}
