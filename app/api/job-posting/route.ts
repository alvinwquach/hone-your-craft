import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

interface Skill {
  skill: string;
  isRequired?: boolean;
  yearsOfExperience?: number;
}

export async function POST(request: NextRequest) {
  const jobPostingData = await request.json();

  try {
    // Retrieve the current user from the session
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Add the current user's ID to the job data
    jobPostingData.userId = currentUser.id;

    if (jobPostingData.salary) {
      const { salaryType, amount, rangeMin, rangeMax, frequency } =
        jobPostingData.salary;
      let salaryData = {};

      if (
        salaryType === "EXACT" ||
        salaryType === "STARTING_AT" ||
        salaryType === "UP_TO"
      ) {
        salaryData = {
          amount,
          rangeMin: null,
          rangeMax: null,
          salaryType,
          frequency: salaryType === "EXACT" ? null : frequency,
        };
      } else if (salaryType === "RANGE") {
        salaryData = {
          amount: null,
          rangeMin,
          rangeMax,
          salaryType,
          frequency,
        };
      }

      if (jobPostingData.paymentType === "ONE_TIME_PAYMENT") {
        salaryData = {
          amount,
          rangeMin: null,
          rangeMax: null,
          salaryType,
          frequency: null,
        };
      }

      jobPostingData.salary = {
        create: salaryData,
      };
    }

    const requiredSkills = jobPostingData.requiredSkills || [];
    const bonusSkills = jobPostingData.bonusSkills || [];

    const requiredSkillsData = await Promise.all(
      requiredSkills.map(async (skill: Skill) => {
        let skillRecord = await prisma.skill.findUnique({
          where: { name: skill.skill },
        });

        if (!skillRecord) {
          skillRecord = await prisma.skill.create({
            data: { name: skill.skill },
          });
        }

        return {
          skillId: skillRecord.id,
          isRequired: true,
          yearsOfExperience: skill.yearsOfExperience ?? 0,
        };
      })
    );

    const bonusSkillsData = await Promise.all(
      bonusSkills.map(async (skill: Skill) => {
        let skillRecord = await prisma.skill.findUnique({
          where: { name: skill.skill },
        });

        if (!skillRecord) {
          skillRecord = await prisma.skill.create({
            data: { name: skill.skill },
          });
        }

        return {
          skillId: skillRecord.id,
          isRequired: false,
          yearsOfExperience: skill.yearsOfExperience ?? null,
        };
      })
    );

    if (jobPostingData.requiredDegree?.degree) {
      const existingDegree = await prisma.degree.findFirst({
        where: {
          degreeType: jobPostingData.requiredDegree.degree,
        },
      });

      if (existingDegree) {
        jobPostingData.requiredDegree = {
          connect: { id: existingDegree.id },
        };
      } else {
        jobPostingData.requiredDegree = {
          create: {
            degreeType: jobPostingData.requiredDegree.degree,
            isRequired: jobPostingData.requiredDegree.isRequired ?? false,
          },
        };
      }
    } else {
      delete jobPostingData.requiredDegree;
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        ...jobPostingData,
        requiredSkills: {
          create: requiredSkillsData,
        },
        bonusSkills: {
          create: bonusSkillsData,
        },
      },
      include: {
        salary: true,
        requiredSkills: {
          include: {
            skill: true,
          },
        },
        bonusSkills: {
          include: {
            skill: true,
          },
        },
        requiredDegree: true,
      },
    });

    revalidatePath("/jobs", "page");

    return NextResponse.json({ jobPosting }, { status: 201 });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { message: "Error creating job posting" },
      { status: 500 }
    );
  }
}