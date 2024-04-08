"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";
import { extractSkillsFromDescription } from "./extractSkillsFromDescription";

const getSourceFromUrl = (postUrl: string) => {
  if (postUrl.includes("otta")) {
    return "Otta";
  } else if (postUrl.includes("linkedin")) {
    return "LinkedIn";
  } else if (postUrl.includes("wellfound")) {
    return "Wellfound";
  } else if (postUrl.includes("glassdoor")) {
    return "Glassdoor";
  } else if (postUrl.includes("monster")) {
    return "Monster";
  } else if (postUrl.includes("ziprecruiter")) {
    return "Zip Recruiter";
  } else if (postUrl.includes("careerbuilder")) {
    return "Career Builder";
  } else if (postUrl.includes("indeed")) {
    return "Indeed";
  } else if (postUrl.includes("simplyhired")) {
    return "SimplyHired";
  } else if (postUrl.includes("stackoverflow")) {
    return "Stack Overflow";
  } else if (postUrl.includes("dice")) {
    return "Dice";
  } else if (postUrl.includes("weworkremotely")) {
    return "We Work Remotely";
  } else if (postUrl.includes("adzuna")) {
    return "Adzuna";
  } else {
    return "Company Website";
  }
};

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

    const jobPostings = userJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      postUrl: job.postUrl,
      source:
        job.referral === true ? "Referral" : getSourceFromUrl(job.postUrl),
      skills: extractSkillsFromDescription(job.description),
    }));

    console.log(jobPostings);

    return jobPostings;
  } catch (error) {
    console.error("Error fetching user jobs or extracting skills:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
};

export default getUserJobPostings;