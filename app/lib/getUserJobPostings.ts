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

    const jobPostings = userJobs.map((job) => {
      let source = "";

      if (job.referral === true) {
        source = "Referral";
      } else {
        switch (true) {
          case job.postUrl.includes("otta"):
            source = "Otta";
            break;
          case job.postUrl.includes("linkedin"):
            source = "LinkedIn";
            break;
          case job.postUrl.includes("wellfound"):
            source = "Wellfound";
            break;
          case job.postUrl.includes("glassdoor"):
            source = "Glassdoor";
            break;
          case job.postUrl.includes("monster"):
            source = "Monster";
            break;
          case job.postUrl.includes("ziprecruiter"):
            source = "Zip Recruiter";
            break;
          case job.postUrl.includes("careerbuilder"):
            source = "Career Builder";
          case job.postUrl.includes("indeed"):
            source = "Indeed";
            break;
          case job.postUrl.includes("simplyhired"):
            source = "SimplyHired";
            break;
          case job.postUrl.includes("stackoverflow"):
            source = "Stack Overflow";
            break;
          case job.postUrl.includes("dice"):
            source = "Dice";
            break;
          case job.postUrl.includes("weworkremotely"):
            source = "We Work Remotely";
            break;
          case job.postUrl.includes("adzuna"):
            source = "Adzuna";
            break;
          default:
            source = "Company Website";
        }
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        postUrl: job.postUrl,
        source: source,
        skills: extractSkillsFromDescription(job.description),
      };
    });

    console.log(jobPostings);

    return jobPostings;
  } catch (error) {
    console.error("Error fetching user jobs or extracting skills:", error);
    throw new Error("Failed to fetch user jobs or extract skills");
  }
};

export default getUserJobPostings;
