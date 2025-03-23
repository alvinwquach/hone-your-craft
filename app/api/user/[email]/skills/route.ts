import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
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

    revalidatePath("/profile", "page");

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

    revalidatePath("/profile", "page");

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
  { params }: { params: { email: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const { email } = params;
    const { skills } = await request.json();

    const updatedSkills = currentUser.skills.filter(
      (skill: string) => !skills.includes(skill)
    );

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        skills: updatedSkills,
      },
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error deleting skill from user:", error);
    return NextResponse.json(
      { message: "Error deleting skill from user" },
      { status: 500 }
    );
  }
}

