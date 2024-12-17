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
    const { openToRoles } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        openToRoles: {
          push: openToRoles,
        },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error adding roles to openToRoles:", error);
    return NextResponse.json(
      { message: "Error adding roles to openToRoles" },
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
    const { role, yearsOfExperience, openToRoles } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        role: role,
        yearsOfExperience: yearsOfExperience,
        openToRoles: openToRoles,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user" },
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

    const userEmail = params.email;
    const { openToRoles } = await request.json();

    const updatedOpenToRoles = currentUser.openToRoles.filter(
      (role: string) => !openToRoles.includes(role)
    );

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        openToRoles: updatedOpenToRoles,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error deleting roles from openToRoles:", error);
    return NextResponse.json(
      { message: "Error deleting roles from openToRoles" },
      { status: 500 }
    );
  }
}

