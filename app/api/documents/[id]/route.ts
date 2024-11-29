import { NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const document = await prisma.document.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        url: true,
        updatedAt: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "No document found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error: unknown) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
