import { getGoalData } from "@/app/actions/getGoalData";
import GoalForm from "@/app/components/profile/goal/GoalForm";

export default async function Goal() {
  const data = await getGoalData();
  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <GoalForm
        currentGoalData={data.currentGoalData as any}
        weeklyApplicationDayTrackerData={
          data.weeklyApplicationDayTrackerData as any
        }
        weeklyApplicationGoalTrackerData={data.weeklyApplicationGoalTrackerData}
        monthlyInterviewGoalTrackerData={data.monthlyInterviewGoalTrackerData}
      />
    </section>
  );
}
