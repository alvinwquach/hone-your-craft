import prisma from "@/app/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ExperienceLevel } from "@prisma/client"; 

interface Skill {
  skill: string;
  isRequired?: boolean;
  yearsOfExperience?: number;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id },
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
        applications: true,
      },
    });

    if (!jobPosting) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ jobPosting }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving job posting:", error);
    return NextResponse.json(
      { message: "Error retrieving job posting" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobPostingData = await request.json();
  const { id } = params;

  try {
    const existingJobPosting = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        salary: true,
        requiredSkills: true,
        bonusSkills: true,
        requiredDegree: true,
      },
    });

    if (!existingJobPosting) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }

    if (jobPostingData.experienceLevels) {
      jobPostingData.experienceLevels = jobPostingData.experienceLevels.map(
        (level: { value: ExperienceLevel }) => level.value
      );
    }

    if (jobPostingData.industry) {
      jobPostingData.industry = jobPostingData.industry.map(
        (item: any) => item.value
      );
    }

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
        update: salaryData,
      };
    }

    const existingSkillIds = new Set(
      existingJobPosting.requiredSkills.map((skill) => skill.skillId)
    );

    const skillsToCreate = async (skills: Skill[], isRequired: boolean) => {
      const skillsToCreateArray = await Promise.all(
        skills.map(async (skill: Skill) => {
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
            isRequired: isRequired,
            yearsOfExperience:
              skill.yearsOfExperience ?? (isRequired ? 0 : null),
          };
        })
      );

      // Filter out existing skills
      const filteredSkills = skillsToCreateArray.filter(
        (skill) => !existingSkillIds.has(skill.skillId)
      );

      return Promise.all(filteredSkills);
    };

    if (
      jobPostingData.requiredSkills &&
      jobPostingData.requiredSkills.length > 0
    ) {
      jobPostingData.requiredSkills = {
        update: await skillsToCreate(jobPostingData.requiredSkills, true),
      };
    } else {
      jobPostingData.requiredSkills = { deleteMany: {} };
    }

    if (jobPostingData.bonusSkills && jobPostingData.bonusSkills.length > 0) {
      jobPostingData.bonusSkills = {
        update: await skillsToCreate(jobPostingData.bonusSkills, false),
      };
    } else {
      jobPostingData.bonusSkills = { deleteMany: {} };
    }

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
      jobPostingData.requiredDegree = {
        disconnect: true,
      };
    }

    const updatedJobPosting = await prisma.jobPosting.update({
      where: { id },
      data: jobPostingData,
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

    return NextResponse.json(
      { jobPosting: updatedJobPosting },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job posting:", error);
    return NextResponse.json(
      { message: "Error updating job posting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const existingJobPosting = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!existingJobPosting) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }

    await prisma.application.deleteMany({
      where: { jobPostingId: id },
    });

    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Job posting deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting job posting:", error);
    return NextResponse.json(
      { message: "Error deleting job posting" },
      { status: 500 }
    );
  }
}