import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.warn("PUT Request: No authenticated user found.");
      return NextResponse.error();
    }

    const {
      jobsAppliedToDaysPerWeekGoal,
      jobsAppliedToWeeklyGoalMin,
      jobsAppliedToWeeklyGoalMax,
      monthlyInterviewGoal,
      candidateGoal,
      offerReceivedByDateGoal,
      offerReceivedByDateGoalStart,
      offerReceivedByDateGoalEnd,
    } = await request.json();

    let updateData: Record<string, any> = {};

    if (jobsAppliedToDaysPerWeekGoal !== undefined) {
      if (
        !Number.isInteger(jobsAppliedToDaysPerWeekGoal) ||
        jobsAppliedToDaysPerWeekGoal < 0 ||
        jobsAppliedToDaysPerWeekGoal > 7
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid days per week goal target. It must be between 0 and 7 days.",
          },
          { status: 400 }
        );
      }
      updateData.jobsAppliedToDaysPerWeekGoal = jobsAppliedToDaysPerWeekGoal;
    }

    if (
      jobsAppliedToWeeklyGoalMin !== undefined &&
      jobsAppliedToWeeklyGoalMax !== undefined
    ) {
      if (
        !Number.isInteger(jobsAppliedToWeeklyGoalMin) ||
        !Number.isInteger(jobsAppliedToWeeklyGoalMax)
      ) {
        return NextResponse.json(
          { message: "Weekly goals must be integers." },
          { status: 400 }
        );
      }

      if (jobsAppliedToWeeklyGoalMin >= jobsAppliedToWeeklyGoalMax) {
        return NextResponse.json(
          { message: "Weekly goal max must be greater than weekly goal min." },
          { status: 400 }
        );
      }

      updateData.jobsAppliedToWeeklyGoalMin = jobsAppliedToWeeklyGoalMin;
      updateData.jobsAppliedToWeeklyGoalMax = jobsAppliedToWeeklyGoalMax;
    }

    if (monthlyInterviewGoal !== undefined) {
      if (!Number.isInteger(monthlyInterviewGoal) || monthlyInterviewGoal < 0) {
        return NextResponse.json(
          {
            message:
              "Invalid monthly interviews scheduled goal. It must be a positive integer.",
          },
          { status: 400 }
        );
      }
      updateData.monthlyInterviewGoal = monthlyInterviewGoal;
    }

    if (candidateGoal !== undefined) {
      const validGoals = [
        "ChangeMyCareer",
        "GrowInMyExistingRole",
        "ExploreNewOpportunities",
        "ImproveSkillset",
        "LookingForANewJob",
        "ReceiveAnOffer",
        "NotSureYet",
      ];
      if (!validGoals.includes(candidateGoal)) {
        return NextResponse.json(
          { message: "Invalid career goal. Please select from valid options." },
          { status: 400 }
        );
      }
      updateData.candidateGoal = candidateGoal;
    }

    if (
      offerReceivedByDateGoal !== undefined &&
      offerReceivedByDateGoal !== null
    ) {
      const parsedOfferReceivedByDateGoal = new Date(offerReceivedByDateGoal);
      if (isNaN(parsedOfferReceivedByDateGoal.getTime())) {
        return NextResponse.json(
          { message: "Invalid offer received date goal format." },
          { status: 400 }
        );
      }
      updateData.offerReceivedByDateGoal = parsedOfferReceivedByDateGoal;
      updateData.offerReceivedByDateGoalStart = null;
      updateData.offerReceivedByDateGoalEnd = null;
    }

    if (
      offerReceivedByDateGoalStart !== undefined &&
      offerReceivedByDateGoalEnd !== undefined &&
      (offerReceivedByDateGoalStart !== null ||
        offerReceivedByDateGoalEnd !== null)
    ) {
      const parsedStart = new Date(offerReceivedByDateGoalStart);
      const parsedEnd = new Date(offerReceivedByDateGoalEnd);

      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return NextResponse.json(
          { message: "Invalid date range format." },
          { status: 400 }
        );
      }

      if (parsedStart > parsedEnd) {
        return NextResponse.json(
          { message: "Start date must be earlier than end date." },
          { status: 400 }
        );
      }

      updateData.offerReceivedByDateGoalStart = parsedStart;
      updateData.offerReceivedByDateGoalEnd = parsedEnd;
      updateData.offerReceivedByDateGoal = null;
    }

    if (
      offerReceivedByDateGoal === null &&
      offerReceivedByDateGoalStart === null &&
      offerReceivedByDateGoalEnd === null
    ) {
      updateData.offerReceivedByDateGoal = null;
      updateData.offerReceivedByDateGoalStart = null;
      updateData.offerReceivedByDateGoalEnd = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating job application goals:", error);
    return NextResponse.json(
      { message: "Error updating job application goals" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      console.warn("GET Request: No authenticated user found.");
      return NextResponse.error();
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        jobsAppliedToDaysPerWeekGoal: true,
        jobsAppliedToWeeklyGoalMin: true,
        jobsAppliedToWeeklyGoalMax: true,
        monthlyInterviewGoal: true,
        candidateGoal: true,
        offerReceivedByDateGoal: true,
        offerReceivedByDateGoalStart: true,
        offerReceivedByDateGoalEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching weekly application goals:", error);
    return NextResponse.json(
      { message: "Error fetching weekly application goals" },
      { status: 500 }
    );
  }
}