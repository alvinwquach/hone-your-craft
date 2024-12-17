import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        name: true,
        image: true,
        role: true,
        skills: true,
        userRole: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;
    const { role } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        role: role,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { message: "Error updating skills" },
      { status: 500 }
    );
  }
}

