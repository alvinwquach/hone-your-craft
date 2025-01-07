import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mutate } from "swr";

const schema = z.object({
  weeklyGoal: z
    .string()
    .min(1, "Please select a goal for your weekly applications"),
});

type FormData = z.infer<typeof schema>;

interface WeeklyGoalFormProps {
  currentGoalData: { jobsAppliedToDaysPerWeekGoal: number };
}

const WeeklyGoalForm = ({ currentGoalData }: WeeklyGoalFormProps) => {
  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      weeklyGoal: "1",
    },
  });

  const [selectedGoal, setSelectedGoal] = useState<string>("1");

  useEffect(() => {
    if (currentGoalData && currentGoalData.jobsAppliedToDaysPerWeekGoal) {
      const currentGoal =
        currentGoalData.jobsAppliedToDaysPerWeekGoal.toString();
      setSelectedGoal(currentGoal);
      setValue("weeklyGoal", currentGoal);
    }
  }, [currentGoalData, setValue]);

  const handleSave: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch("/api/weekly-application-goal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobsAppliedToDaysPerWeekGoal: parseInt(data.weeklyGoal),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "An error occurred.");
        return;
      }

      const result = await response.json();
      const isPlural = result.jobsAppliedToDaysPerWeekGoal > 1;
      toast.success(
        `Weekly application target set to ${
          result.jobsAppliedToDaysPerWeekGoal
        } ${isPlural ? "days" : "day"}!`
      );
      mutate("/api/weekly-application-goal");
      reset();
    } catch (error) {
      toast.error("An error occurred while saving your application target.");
    }
  };

  const handleHexagonClick = (day: string) => {
    setSelectedGoal(day);
    setValue("weeklyGoal", day);
  };

  return (
    <div>
      <div className="rounded-lg p-6 shadow-lg relative">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
          What is your weekly application target? (optional)
        </h2>
        <div className="flex gap-6 justify-start">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className="flex flex-col items-center gap-2 cursor-pointer relative"
              onClick={() => handleHexagonClick(day.toString())}
            >
              <div
                className={`w-6 h-6 sm:w-12 sm:h-12 text-white flex items-center justify-center relative transform rotate-30 ${
                  selectedGoal >= day.toString() ? "bg-blue-600" : "bg-blue-200"
                }`}
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              ></div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit(handleSave)} className="mt-8">
          <div className="flex justify-start mt-6">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
            >
              Save Goal Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyGoalForm;
