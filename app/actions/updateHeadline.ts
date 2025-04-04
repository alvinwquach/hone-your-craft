"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function updateHeadline(headline: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const updatedUser = await prisma.user.update({
      where: { email: currentUser.email ?? "" },
      data: { headline },
    });

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating headline:", error);
    return { success: false, error: "Failed to update headline" };
  }
}
