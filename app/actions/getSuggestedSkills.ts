"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "./getCurrentUser";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

export const getSuggestedSkills = unstable_cache(
  async () => {
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        return redirect("/login");
      }

      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { skills: true },
      });

      if (!user) {
        throw new Error("User data not found");
      }

      const jobPostings = await prisma.job.findMany({
        where: { userId: currentUser.id },
        select: { description: true },
      });

      const jobSkills = new Set(
        (
          await Promise.all(
            jobPostings.map((job) =>
              extractSkillsFromDescription(job.description)
            )
          )
        ).flat()
      );

      const suggestedSkills = Array.from(jobSkills)
        .filter((skill) => !user.skills.includes(skill))
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      console.log("Cache populated:", suggestedSkills.length, "skills");

      return suggestedSkills;
    } catch (error) {
      console.error("Error fetching suggested skills:", error);
      return [];
    }
  },
  ["suggested-skills"],
  {
    revalidate: 3600,
    tags: ["skills", "suggestions"],
  }
);