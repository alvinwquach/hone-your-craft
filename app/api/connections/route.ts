import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath, unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        {
          requesterId: currentUser.id,
          receiverId,
        },
        {
          requesterId: receiverId,
          receiverId: currentUser.id,
        },
      ],
    },
  });

  if (existingConnection && existingConnection.status === "NONE") {
    await prisma.connection.update({
      where: {
        id: existingConnection.id,
      },
      data: {
        status: "PENDING",
      },
    });
    return NextResponse.json(
      { message: "Connection request resent." },
      { status: 200 }
    );
  }

  if (existingConnection && existingConnection.status !== "NONE") {
    return NextResponse.json(
      { message: "Connection request already sent or already connected" },
      { status: 400 }
    );
  }

  try {
    const newConnection = await prisma.connection.create({
      data: {
        requesterId: currentUser.id,
        receiverId,
        status: "PENDING",
      },
    });

    revalidatePath("/messages", "page");

    return NextResponse.json(newConnection, { status: 200 });
  } catch (error) {
    console.error("Error sending connection request:", error);
    return NextResponse.json(
      { message: "Error sending connection request" },
      { status: 500 }
    );
  }
}

const getCachedConnections = unstable_cache(
  async (userId: string) => {
    return await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        status: { in: ["ACCEPTED"] },
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            userRole: true,
            headline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            userRole: true,
            headline: true,
          },
        },
      },
    });
  },
  ["connections_accepted"],
  { tags: ["connections"] }
);

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const connections = await getCachedConnections(currentUser.id);

    const userConnections = connections.map((connection) => {
      const connectedUser =
        connection.requesterId === currentUser.id
          ? connection.receiver
          : connection.requester;
      return {
        id: connectedUser.id,
        name: connectedUser.name,
        image: connectedUser.image,
        email: connectedUser.email,
        status: connection.status,
        userRole: connectedUser.userRole,
        headline: connectedUser.headline,
      };
    });

    return NextResponse.json(userConnections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { message: "Error fetching connections" },
      { status: 500 }
    );
  }
}

