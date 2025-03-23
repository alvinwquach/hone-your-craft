import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { unstable_cache } from "next/cache";

const getCachedConnectionRequests = unstable_cache(
  async (userId: string) => {
    return await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        requester: true,
      },
    });
  },
  ["connection_requests_pending"],
  { tags: ["connections"] }
);

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  try {
    const receivedRequests = await getCachedConnectionRequests(currentUser.id);

    return NextResponse.json(receivedRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection requests" },
      { status: 500 }
    );
  }
}