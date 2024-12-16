import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;
    const { skills } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: {
          push: skills,
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error adding skills:", error);
    return NextResponse.json(
      { message: "Error adding skills" },
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
    const { skills } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: skills,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string; skill: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const userEmail = params.email;
    const skillName = params.skill;

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        skills: {
          set: currentUser.skills.filter((s: string) => s !== skillName),
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error deleting skill from user:", error);
    return NextResponse.json(
      { message: "Error deleting skill from user" },
      { status: 500 }
    );
  }
}
