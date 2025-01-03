import prisma from "@/app/lib/db/prisma"; 
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(); 
    if (!currentUser) {
      return NextResponse.error(); 
    }

    const { receiverId } = await request.json();

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { message: "Receiver not found" },
        { status: 404 }
      );
    }

    const connection = await prisma.connection.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: currentUser.id,
          receiverId,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { message: "No connection found between users" },
        { status: 404 }
      );
    }

    await prisma.connection.update({
      where: { id: currentUser.id },
      data: {
        status: "NONE",
      },
    });

    return NextResponse.json(
      { message: "Connection rejected and reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting connection:", error);
    return NextResponse.json(
      { message: "Error rejecting connection" },
      { status: 500 }
    );
  }
}
