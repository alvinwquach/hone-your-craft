import prisma from "@/app/lib/db/prisma";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const userInterviews = await prisma.interview.findMany({
      where: {
        userId: currentUser.id,
        interviewDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const numberOfInterviewsThisMonth = userInterviews.length;

    const userGoal = currentUser.monthlyInterviewGoal;

    if (userGoal === null) {
      return NextResponse.json(
        { message: "No monthly interview goal set." },
        { status: 400 }
      );
    }

    const remainingInterviews = userGoal - numberOfInterviewsThisMonth;

    return NextResponse.json({
      message: `You need to schedule ${remainingInterviews} more interview${
        remainingInterviews > 1 ? "s" : ""
      } this month to meet your goal of ${userGoal} interviews.`,
      currentMonthInterviews: numberOfInterviewsThisMonth,
      targetInterviewsPerMonth: userGoal,
    });
  } catch (error) {
    console.error("Error fetching user's interviews and goal:", error);
    return NextResponse.error();
  }
}
