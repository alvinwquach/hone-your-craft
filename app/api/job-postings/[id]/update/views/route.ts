import prisma from "@/app/lib/db/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const jobPosting = await prisma.jobPosting.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ views: jobPosting.views }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update views" },
      { status: 500 }
    );
  }
}
