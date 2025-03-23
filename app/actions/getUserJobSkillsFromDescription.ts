"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";
import { unstable_cache } from "next/cache";

const getCachedUserJobSkillsFromDescription = unstable_cache(
  async () => {
    // Retrieve the current user

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    // Initialize an array to store job skills
    const jobSkills = userJobs.map((job) => ({
      title: job.title,
      company: job.company,
      postUrl: job.postUrl,
      skills: extractSkillsFromDescription(job.description),
    }));

    return jobSkills;
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
