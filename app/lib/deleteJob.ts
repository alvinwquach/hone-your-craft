"use server";

import prisma from "./db/prisma";
import getCurrentUser from "./getCurrentUser";

const deleteJob = async (jobId: string) => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user ID is missing
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch the job to be deleted along with its associated data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobSkills: true,
        interviews: true,
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Delete associated data (job skills, interviews, offers, rejections)
    await Promise.all([
      prisma.jobSkill.deleteMany({ where: { jobId } }),
      prisma.interview.deleteMany({ where: { jobId } }),
      prisma.offer.deleteMany({ where: { jobId } }),
      prisma.rejection.deleteMany({ where: { jobId } }),
    ]);

    // Delete the job itself
    await prisma.job.delete({ where: { id: jobId } });

    console.log("Job and associated data deleted successfully");
  } catch (error) {
    console.error("Error deleting job:", error);
    throw new Error("Failed to delete job");
  } finally {
  }
};

export default deleteJob;
