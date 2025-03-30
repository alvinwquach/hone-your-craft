"use server";

import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { z } from "zod";
import { redirect } from "next/navigation";

const schema = z.object({
  jobsAppliedToDaysPerWeekGoal: z
    .number()
    .min(0, "Days per week must be between 0 and 7")
    .max(7, "Days per week must be between 0 and 7")
    .optional(),
  jobsAppliedToWeeklyGoalMin: z
    .number()
    .min(1, "Minimum weekly goal must be at least 1")
    .optional(),
  jobsAppliedToWeeklyGoalMax: z
    .number()
    .min(1, "Maximum weekly goal must be at least 1")
    .optional(),
  monthlyInterviewGoal: z
    .number()
    .min(0, "Monthly interviews must be a positive number")
    .optional(),
  candidateGoal: z
    .enum([
      "ChangeMyCareer",
      "GrowInMyExistingRole",
      "BuildAPortfolio",
      "ExploreNewOpportunities",
      "ImproveSkillset",
      "LookingForANewJob",
      "ReceiveAnOffer",
      "NotSureYet",
    ])
    .optional(),
  offerReceivedByDateGoal: z.date().nullable().optional(),
  offerReceivedByDateGoalStart: z.date().nullable().optional(),
  offerReceivedByDateGoalEnd: z.date().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default async function updateGoalData(formData: FormData): Promise<{
  success: boolean;
  data?: any;
  errors?: Record<string, string[]>;
}> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return redirect("/login");
  }

  const validatedData = schema.safeParse(formData);
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  const updateData: Record<string, any> = {};

  if (formData.jobsAppliedToDaysPerWeekGoal !== undefined) {
    updateData.jobsAppliedToDaysPerWeekGoal =
      formData.jobsAppliedToDaysPerWeekGoal;
  }

  if (
    formData.jobsAppliedToWeeklyGoalMin !== undefined &&
    formData.jobsAppliedToWeeklyGoalMax !== undefined
  ) {
    if (
      formData.jobsAppliedToWeeklyGoalMin >= formData.jobsAppliedToWeeklyGoalMax
    ) {
      return {
        success: false,
        errors: {
          jobsAppliedToWeeklyGoalMax: [
            "Weekly goal max must be greater than weekly goal min",
          ],
        },
      };
    }
    updateData.jobsAppliedToWeeklyGoalMin = formData.jobsAppliedToWeeklyGoalMin;
    updateData.jobsAppliedToWeeklyGoalMax = formData.jobsAppliedToWeeklyGoalMax;
  }

  if (formData.monthlyInterviewGoal !== undefined) {
    updateData.monthlyInterviewGoal = formData.monthlyInterviewGoal;
  }

  if (formData.candidateGoal !== undefined) {
    updateData.candidateGoal = formData.candidateGoal;
  }

  if (
    formData.offerReceivedByDateGoal !== undefined &&
    formData.offerReceivedByDateGoal !== null
  ) {
    updateData.offerReceivedByDateGoal = formData.offerReceivedByDateGoal;
    updateData.offerReceivedByDateGoalStart = null;
    updateData.offerReceivedByDateGoalEnd = null;
  } else if (
    formData.offerReceivedByDateGoalStart !== undefined &&
    formData.offerReceivedByDateGoalEnd !== undefined
  ) {
    const start = formData.offerReceivedByDateGoalStart!;
    const end = formData.offerReceivedByDateGoalEnd!;

    if (start > end) {
      return {
        success: false,
        errors: {
          offerReceivedByDateGoalStart: [
            "Start date must be earlier than end date",
          ],
        },
      };
    }
    updateData.offerReceivedByDateGoalStart = start;
    updateData.offerReceivedByDateGoalEnd = end;
    updateData.offerReceivedByDateGoal = null;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}
