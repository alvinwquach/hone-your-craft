import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.error();
  }

  const receivedRequests = await prisma.connection.findMany({
    where: {
      receiverId: currentUser.id,
      status: "PENDING",
    },
    include: {
      requester: true,
    },
  });

  return NextResponse.json(receivedRequests, { status: 200 });
}
