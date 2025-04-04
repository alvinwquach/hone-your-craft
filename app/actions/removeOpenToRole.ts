"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function removeOpenToRole(role: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const updatedOpenToRoles = currentUser.openToRoles.filter(
      (r: string) => r !== role
    );
    const updatedUser = await prisma.user.update({
      where: { email: currentUser.email ?? "" },
      data: {
        openToRoles: updatedOpenToRoles,
      },
    });

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error removing role:", error);
    return { success: false, error: "Failed to remove role" };
  }
}
