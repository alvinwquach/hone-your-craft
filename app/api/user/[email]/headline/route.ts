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

    const { headline } = await request.json();

    const userEmail = params.email;

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        headline,
      },
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating bio:", error);
    return NextResponse.json(
      { message: "Error updating bio" },
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

    const { headline } = await request.json();

    const userEmail = params.email;

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        headline,
      },
    });

    revalidatePath("/profile", "page");

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating bio:", error);
    return NextResponse.json(
      { message: "Error updating bio" },
      { status: 500 }
    );
  }
}
