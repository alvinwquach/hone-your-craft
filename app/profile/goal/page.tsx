import { getGoalData } from "@/app/actions/getGoalData";
import GoalForm from "@/app/components/profile/goal/GoalForm";

export default async function Goal() {
  const data = await getGoalData();
  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <GoalForm
        currentGoalData={data.currentGoalData}
        weeklyApplicationDayTrackerData={data.weeklyApplicationDayTrackerData}
        weeklyApplicationGoalTrackerData={data.weeklyApplicationGoalTrackerData}
        monthlyInterviewGoalTrackerData={data.monthlyInterviewGoalTrackerData}
      />
    </section>
  );
}
