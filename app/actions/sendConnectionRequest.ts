"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendConnectionRequest(receiverId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new Error("Receiver not found");
  }

  const existingConnection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: currentUser.id, receiverId },
        { requesterId: receiverId, receiverId: currentUser.id },
      ],
    },
  });

  if (existingConnection && existingConnection.status === "NONE") {
    await prisma.connection.update({
      where: { id: existingConnection.id },
      data: { status: "PENDING" },
    });
    revalidatePath("/connections");
    return true;
  }

  if (existingConnection && existingConnection.status !== "NONE") {
    throw new Error("Connection request already sent or already connected");
  }

  await prisma.connection.create({
    data: {
      requesterId: currentUser.id,
      receiverId,
      status: "PENDING",
    },
  });

  revalidatePath("/profile/connections");
  return true;
}
