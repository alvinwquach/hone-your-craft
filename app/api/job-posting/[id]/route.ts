import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/lib/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

interface RequiredJobPostingData {
  company: string;
  title: string;
  description: string;
  responsibilities: string[];
  workLocation?: string;
  requiredSkills?: string[];
  bonusSkills?: string[];
}

function validateRequiredJobData(jobData: RequiredJobPostingData) {
  if (
    !jobData.company ||
    !jobData.title ||
    !jobData.description ||
    !jobData.responsibilities ||
    jobData.responsibilities.length === 0
  ) {
    return "Company, job title, job description, and responsibilities are required fields.";
  }
  return null;
}

// Get job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  try {
    // Retrieve the current authenticated user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Return an error response if the user is not authenticated
      return NextResponse.error();
    }
    // Find the job posting using the jobId
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        requiredSkills: {
          // Include the related required skills
          include: { skill: true },
        },
        bonusSkills: {
          // Include the related bonus skills
          include: { skill: true },
        },
      },
    });
    //  If the job posting does not exist, return a 404 error
    if (!job) {
      return NextResponse.json(
        { message: "Job posting not found" },
        { status: 404 }
      );
    }
    // Return the job posting data as JSON in the response
    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching job:", error);
    // Return a 500 error if something goes wrong while fetching the job
    return NextResponse.json(
      { message: "Error fetching job" },
      { status: 500 }
    );
  }
}


// export async function POST(request: NextRequest) {
//   try {
//     const jobData = await request.json();
//     const currentUser = await getCurrentUser();

//     if (!currentUser) {
//       return NextResponse.json(
//         { message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     // Add the current user's ID to the job data
//     jobData.userId = currentUser.id;

//     // Create a new job posting in the database
//     const jobPosting = await prisma.jobPosting.create({
//       data: {
//         ...jobData,
//         bonusSkills: {
//           create: jobData.bonusSkills.map((skill: string) => ({
//             skill: {
//               connectOrCreate: {
//                 where: { name: skill },
//                 create: { name: skill },
//               },
//             },
//             yearsOfExperience: null,
//             isRequired: false,
//           })),
//         },
//       },
//     });

//     return NextResponse.json({ jobPosting }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating job:", error);
//     return NextResponse.json(
//       { message: "Error creating job" },
//       { status: 500 }
//     );
//   }
// }

// Create a new job posting
// export async function POST(request: NextRequest) {
//   const jobData = await request.json();
//   const validationError = validateRequiredJobData(jobData);
//   if (validationError) {
//     return NextResponse.json({ message: validationError }, { status: 400 });
//   }

//   try {
//     // Retrieve the current authenticated user
//     const currentUser = await getCurrentUser();
//     if (!currentUser) {
//       // Return an error response if the user is not authenticated
//       return NextResponse.json(
//         { message: "User not authenticated" },
//         { status: 401 }
//       );
//     }
//     jobData.userId = currentUser.id;
//     // Default to empty arrays if there are no required or bonus skills
//     const requiredSkills = jobData.requiredSkills || [];
//     const bonusSkills = jobData.bonusSkills || [];
//     // Create the new job posting in the database, associating skills with it
//     const job = await prisma.jobPosting.create({
//       data: {
//         // Spread the job data to include all fields
//         ...jobData,
//         requiredSkills: {
//           create: requiredSkills.map((skillName: string) => ({
//             skill: {
//               connectOrCreate: {
//                 // Try to find the skill by its name
//                 where: { name: skillName },
//                 // If not found, create a new skill
//                 create: { name: skillName },
//               },
//             },
//             // Mark these skills as required
//             isRequired: true,
//           })),
//         },
//         bonusSkills: {
//           create: bonusSkills.map((skillName: string) => ({
//             skill: {
//               connectOrCreate: {
//                 where: { name: skillName },
//                 create: { name: skillName },
//               },
//             },
//           })),
//         },
//       },
//     });
//     // Return the newly created job posting in the response
//     return NextResponse.json({ job }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating job:", error);
//     // Return a 500 error if something goes wrong while creating the job
//     return NextResponse.json(
//       { message: "Error creating job" },
//       { status: 500 }
//     );
//   }
// }

// Update an existing job posting
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;
  const jobData = await request.json();
  // Retrieve the current authenticated user
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    // Return an error response if the user is not authenticated
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }
  const validationError = validateRequiredJobData(jobData);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  try {
    const dataToUpdate = {
      // Spread the incoming job data
      ...jobData,
      // Only update workLocation if provided
      workLocation: jobData.workLocation || undefined,
      requiredSkills: jobData.requiredSkills
        ? {
            // Delete any existing skills that are not in the updated list
            deleteMany: {
              NOT: {
                skill: { name: { in: jobData.requiredSkills } },
              },
            },
            create: jobData.requiredSkills.map((skillName: string) => ({
              skill: {
                connectOrCreate: {
                  where: { name: skillName },
                  create: { name: skillName },
                },
              },
              isRequired: true,
            })),
          }
        : // If no required skills are provided, leave it unchanged
          undefined,
      // Handle bonus skills similarly
      bonusSkills: jobData.bonusSkills || undefined,
    };

    // Update the job posting in the database with the modified data
    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobId },
      data: dataToUpdate,
    });

    // Return the updated job posting as a JSON response
    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    // Return a 500 error if something goes wrong while updating the job
    return NextResponse.json(
      { message: "Error updating job" },
      { status: 500 }
    );
  }
}

// // Delete a job posting
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const jobId = params.id;
//   try {
//     // Retrieve the current authenticated user
//     const currentUser = await getCurrentUser();
//     if (!currentUser?.id) {
//       // Return an error if the user is not authenticated
//       return NextResponse.json(
//         { message: "User not authenticated" },
//         { status: 401 }
//       );
//     }

//     // Find the job by its ID
//     const job = await prisma.jobPosting.findUnique({
//       where: { id: jobId },
//       include: {
//         requiredSkills: true,
//         bonusSkills: true,
//         applications: true,
//       },
//     });

//     if (!job) {
//       // Return a 404 error if the job posting doesn't exist
//       return NextResponse.json({ message: "Job not found" }, { status: 404 });
//     }

//     // Delete associated data
//     await Promise.all([
//       // Delete related skills
//       prisma.jobSkill.deleteMany({ where: { jobPostingId: jobId } }),
//       // Delete related applications
//       prisma.application.deleteMany({ where: { jobPostingId: jobId } }),
//       // Delete related tags
//       prisma.jobTag.deleteMany({ where: { jobPostingId: jobId } }),
//       // Delete related recommendations
//       prisma.jobRecommendation.deleteMany({ where: { jobPostingId: jobId } }),
//     ]);
//     // Delete the job posting
//     await prisma.jobPosting.delete({ where: { id: jobId } });
//     // Return a success message once everything is deleted
//     return NextResponse.json({
//       message: "Job and associated data deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting job:", error);
//     // Return a 500 error if there's an issue deleting the job
//     return NextResponse.json(
//       { message: "Error deleting job" },
//       { status: 500 }
//     );
//   }
// }
