import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(); 
  if (!currentUser) {
    return NextResponse.error(); 
  }

  const sentRequests = await prisma.connection.findMany({
    where: {
      requesterId: currentUser.id,
      status: "PENDING",
    },
    include: {
      receiver: true, 
    },
  });

  return NextResponse.json(sentRequests, { status: 200 });
}
