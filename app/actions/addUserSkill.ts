"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { revalidatePath, revalidateTag } from "next/cache";

export async function addUserSkill(skill: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id || !currentUser.email) {
    throw new Error("User not authenticated");
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        skills: {
          push: skill,
        },
      },
      select: {
        skills: true,
      },
    });

    revalidateTag("suggested-skills");
    revalidateTag("user-profile");
    revalidatePath("/profile");

    return {
      success: true,
      skills: updatedUser.skills,
    };
  } catch (error) {
    console.error("Error adding skill:", error);
    return {
      success: false,
      error: "Failed to add skill",
    };
  }
}
