"use server";

import getCurrentUser from "./getCurrentUser";
import prisma from "../lib/db/prisma";
import { extractSkillsFromDescription } from "../lib/extractSkillsFromDescription";

const SOURCE_MAPPINGS: Record<string, string> = {
  otta: "Otta",
  linkedin: "LinkedIn",
  wellfound: "Wellfound",
  glassdoor: "Glassdoor",
  monster: "Monster",
  ziprecruiter: "Zip Recruiter",
  careerbuilder: "Career Builder",
  indeed: "Indeed",
  simplyhired: "SimplyHired",
  stackoverflow: "Stack Overflow",
  dice: "Dice",
  weworkremotely: "We Work Remotely",
  adzuna: "Adzuna",
};

const ITEMS_PER_PAGE = 9;

const getSourceFromUrl = (postUrl: string): string => {
  const lowercaseUrl = postUrl.toLowerCase();
  return (
    Object.entries(SOURCE_MAPPINGS).find(([key]) =>
      lowercaseUrl.includes(key)
    )?.[1] ?? "Company Website"
  );
};

export interface JobWithSkills {
  id: string;
  title: string;
  company: string;
  postUrl: string;
  source: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

export interface JobPostingsResponse {
  jobs: JobWithSkills[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
}

export const getUserJobPostingsWithSkillMatch = async (
  page: number = 1,
  take: number = ITEMS_PER_PAGE
): Promise<JobPostingsResponse> => {
  console.time("getUserJobPostingsWithSkillMatch");
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    const userSkills = new Set(currentUser.skills || []);

    const skip = (page - 1) * take;
    const [userJobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where: { userId: currentUser.id },
        select: {
          id: true,
          title: true,
          company: true,
          postUrl: true,
          description: true,
          referral: true,
          matchPercentage: true,
          jobSkills: {
            select: {
              skill: { select: { name: true } },
              isRequired: true,
            },
          },
        },
        orderBy: { matchPercentage: "desc" },
        skip,
        take,
      }),
      prisma.job.count({ where: { userId: currentUser.id } }),
    ]);
    console.timeLog("getUserJobPostingsWithSkillMatch", "Fetched jobs");

    const jobsToUpdate: {
      id: string;
      jobSkills: string[];
      matchPercentage: number;
    }[] = [];

    const processedJobs = await Promise.all(
      userJobs.map(async (job) => {
        let jobSkills: string[] = [];

        if (job.jobSkills.length > 0) {
          jobSkills = job.jobSkills.map((js) => js.skill.name);
        } else if (job.description) {
          jobSkills = [
            ...new Set(extractSkillsFromDescription(job.description)),
          ];
        } else {
          jobSkills = [];
        }

        const matchingSkills = jobSkills.filter((skill) =>
          userSkills.has(skill)
        );
        const missingSkills = jobSkills.filter(
          (skill) => !userSkills.has(skill)
        );

        const totalSkills = jobSkills.length;
        const matchPercentage =
          totalSkills > 0
            ? Math.round((matchingSkills.length / totalSkills) * 100)
            : 0;

        // If jobSkills were extracted or matchPercentage differs, mark for update
        if (
          job.jobSkills.length === 0 ||
          (job.matchPercentage !== null &&
            Math.abs(job.matchPercentage - matchPercentage) > 1) // Use a larger threshold to avoid floating-point issues
        ) {
          jobsToUpdate.push({ id: job.id, jobSkills, matchPercentage });
        }

        return {
          id: job.id.toString(),
          title: job.title,
          company: job.company,
          postUrl: job.postUrl,
          source:
            job.referral === true ? getSourceFromUrl(job.postUrl) : "Referral",
          matchingSkills,
          missingSkills,
          matchPercentage,
        };
      })
    );
    console.timeLog("getUserJobPostingsWithSkillMatch", "Processed jobs");

    if (jobsToUpdate.length > 0) {
      await prisma.$transaction(
        jobsToUpdate.map(({ id, jobSkills, matchPercentage }) =>
          prisma.job.update({
            where: { id },
            data: {
              matchPercentage,
              jobSkills:
                jobSkills.length > 0
                  ? {
                      deleteMany: {},
                      create: jobSkills.map((skill) => ({
                        skill: {
                          connectOrCreate: {
                            where: { name: skill },
                            create: { name: skill },
                          },
                        },
                        isRequired: true,
                      })),
                    }
                  : undefined,
            },
          })
        )
      );
    }
    console.timeLog("getUserJobPostingsWithSkillMatch", "Updated database");

    const totalPages = Math.ceil(totalJobs / take);
    const result: JobPostingsResponse = {
      jobs: processedJobs,
      totalPages,
      currentPage: page,
      totalJobs,
    };

    console.timeEnd("getUserJobPostingsWithSkillMatch");
    return result;
  } catch (error) {
    console.error("Error fetching user job postings with skill match:", error);
    throw new Error("Failed to fetch user jobs or process skills");
  }
};