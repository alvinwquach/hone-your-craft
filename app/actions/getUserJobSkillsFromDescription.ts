"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { unstable_cache } from "next/cache";

const getCachedUserJobSkillsFromDescription = unstable_cache(
  async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    const jobs = await prisma.job.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        title: true,
        company: true,
        postUrl: true,
        description: true,
      },
    });

    return jobs.map((job) => ({
      ...job,
      skills: extractSkillsFromDescription(job.description),
    }));
  },
  ["user-job-skills"],
  {
    revalidate: 30,
    tags: ["jobs", "skills"],
  }
);

export default async function getUserJobSkillsFromDescription() {
  try {
    return await getCachedUserJobSkillsFromDescription();
  } catch (error) {
    console.error("Error fetching cached user job skills:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
}
