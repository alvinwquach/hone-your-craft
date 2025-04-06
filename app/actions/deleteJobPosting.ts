"use server";
import prisma from "@/app/lib/db/prisma";
import { revalidatePath } from "next/cache";
import getCurrentUser from "./getCurrentUser";

export async function deleteJobPosting(id: string) {
  const currentUser = await getCurrentUser();

  try {
    const existingJobPosting = await prisma.jobPosting.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingJobPosting) {
      return { error: "Job posting not found" };
    }

    if (existingJobPosting.userId !== currentUser?.id) {
      return {
        error: "Unauthorized: You do not own this job posting",
        status: 403,
      };
    }

    await prisma.application.deleteMany({
      where: { jobPostingId: id },
    });
    await prisma.jobPosting.delete({
      where: { id },
    });

    revalidatePath("/jobs", "page");

    return {
      message: "Job posting deleted successfully",
    };
  } catch (error: unknown) {
    console.error("Error deleting job posting:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
