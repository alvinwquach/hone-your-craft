import prisma from "@/app/lib/db/prisma";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const getCachedJobPostings = unstable_cache(
  async () => {
    return await prisma.jobPosting.findMany({
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
  },
  ["job-postings"],
  { revalidate: 300 }
);

export async function GET() {
  try {
    const cachedJobPostings = await getCachedJobPostings();
    return NextResponse.json(
      { jobPostings: cachedJobPostings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving job postings:", error);
    return NextResponse.json(
      { message: "Error retrieving job postings" },
      { status: 500 }
    );
  }
}