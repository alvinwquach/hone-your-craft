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

    const { jobsAppliedToDaysPerWeekGoal } = await request.json();

    if (
      typeof jobsAppliedToDaysPerWeekGoal !== "number" ||
      jobsAppliedToDaysPerWeekGoal < 1 ||
      jobsAppliedToDaysPerWeekGoal > 7
    ) {
      console.warn(
        `Invalid weekly goal: ${jobsAppliedToDaysPerWeekGoal}. It must be between 1 and 7.`
      );
      return NextResponse.json(
        {
          message:
            "Invalid days per week goal target. It must be between 1 and 7 days.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { jobsAppliedToDaysPerWeekGoal },
    });

    console.log(
      `Successfully updated weekly application goal to ${jobsAppliedToDaysPerWeekGoal}.`
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating weekly application goal:", error);
    return NextResponse.json(
      { message: "Error updating jobs applied to days per week goal target" },
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
      select: { jobsAppliedToDaysPerWeekGoal: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log(
      `Successfully retrieved weekly application goal of ${user.jobsAppliedToDaysPerWeekGoal} for user ${currentUser.id}.`
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching weekly application goal:", error);
    return NextResponse.json(
      { message: "Error fetching jobs applied to days per week goal" },
      { status: 500 }
    );
  }
}
