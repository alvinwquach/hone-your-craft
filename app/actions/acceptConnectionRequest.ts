"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function acceptConnectionRequest(connectionId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error("Connection not found");
  }

  if (connection.receiverId !== currentUser.id) {
    throw new Error("You are not the receiver of this connection request");
  }

  if (connection.status !== "PENDING") {
    throw new Error("Connection request is no longer pending");
  }

  await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/profile/connections");
  return true;
}
