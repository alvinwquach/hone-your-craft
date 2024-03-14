"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";
import { extractSkillsFromDescription } from "./extractSkillsFromDescription";

const getUserJobPostings = async () => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user ID is missing
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user jobs from the database
    const userJobs = await prisma.job.findMany({
      where: {
        userId: currentUser.id,
      },
    });

    // Initialize an array to store job postings
    const jobPostings = userJobs.map((job) => ({
      title: job.title,
      company: job.company,
      postUrl: job.postUrl,
      skills: extractSkillsFromDescription(job.description),
    }));

    return jobPostings;
  } catch (error) {
    console.error("Error fetching user jobs or extracting skills:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
};

export default getUserJobPostings;
