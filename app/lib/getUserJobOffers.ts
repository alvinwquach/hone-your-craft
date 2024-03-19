"use server";
import getCurrentUser from "./getCurrentUser";
import prisma from "./db/prisma";

const getUserJobOffers = async () => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Throw an error if the user is not authenticated or user ID is not found
    if (!currentUser?.id) {
      throw new Error("User not authenticated or user ID not found");
    }

    // Fetch user offers from the database
    const userOffers = await prisma.offer.findMany({
      where: {
        userId: currentUser.id,
      },
      // Include related job details along with offers
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            company: true,
            title: true,
            description: true,
            industry: true,
            location: true,
            workLocation: true,
            updatedAt: true,
            postUrl: true,
            offer: true,
            salary: true,
          },
        },
      },
    });

    return userOffers;
  } catch (error) {
    console.error("Error fetching user offers:", error);
    throw new Error("Failed to fetch user offers");
  }
};

export default getUserJobOffers;
