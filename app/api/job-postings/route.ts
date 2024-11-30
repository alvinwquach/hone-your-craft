import prisma from "@/app/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const allJobPostings = await prisma.jobPosting.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ jobPostings: allJobPostings }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving job postings:", error);
    return NextResponse.json(
      { message: "Error retrieving job postings" },
      { status: 500 }
    );
  }
}
