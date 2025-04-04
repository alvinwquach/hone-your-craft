"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { redirect } from "next/navigation";

export async function getUserByEmail(email: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      image: true,
      headline: true,
      bio: true,
      role: true,
      primaryRole: true,
      yearsOfExperience: true,
      openToRoles: true,
      skills: true,
      userRole: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return { user };
}
