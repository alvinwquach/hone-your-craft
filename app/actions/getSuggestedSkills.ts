"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

export const getSuggestedSkills = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return redirect("/login");
    }
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { skills: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const jobPostings = await prisma.job.findMany({
      where: { userId: currentUser.id },
      select: { description: true },
    });

    const jobSkills = new Set(
      jobPostings.flatMap((job) =>
        extractSkillsFromDescription(job.description)
      )
    );

    const suggestedSkills = Array.from(jobSkills)
      .filter((skill) => !user.skills.includes(skill))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    return suggestedSkills;
  },
  ["suggested-skills"],
  {
    revalidate: 3600,
    tags: ["skills", "suggestions"],
  }
);
