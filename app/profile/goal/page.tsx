import { getGoalData } from "@/app/actions/getGoalData";
import GoalForm from "@/app/components/profile/goal/GoalForm";

export default async function Goal() {
  const data = await getGoalData();
  return (
    <GoalForm
      currentGoalData={data.currentGoalData}
      weeklyApplicationDayTrackerData={data.weeklyApplicationDayTrackerData}
      weeklyApplicationGoalTrackerData={data.weeklyApplicationGoalTrackerData}
      monthlyInterviewGoalTrackerData={data.monthlyInterviewGoalTrackerData}
    />
  );
}
