import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mutate } from "swr";
import { MdAdd, MdRemove } from "react-icons/md";
import { FaMinus } from "react-icons/fa";

const schema = z.object({
  weeklyGoal: z
    .number()
    .min(1, "Please select a goal for your weekly applications"),

  weeklyGoalMin: z.number().min(1, "Minimum goal must be at least 1"),
  weeklyGoalMax: z.number().min(1, "Maximum goal must be at least 1"),
});

type FormData = z.infer<typeof schema>;

interface WeeklyGoalFormProps {
  currentGoalData: {
    jobsAppliedToDaysPerWeekGoal: number;
    jobsAppliedToWeeklyGoalMin: number;
    jobsAppliedToWeeklyGoalMax: number;
  };
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
      weeklyGoal: 1,
      weeklyGoalMin: 1,
      weeklyGoalMax: 2,
    },
  });

  const [selectedGoal, setSelectedGoal] = useState<number | null>(1);
  const [goalMin, setGoalMin] = useState<number>(1);
  const [goalMax, setGoalMax] = useState<number>(2);

  useEffect(() => {
    if (currentGoalData && currentGoalData.jobsAppliedToDaysPerWeekGoal) {
      const currentGoal = Number(currentGoalData.jobsAppliedToDaysPerWeekGoal);
      setSelectedGoal(currentGoal);
      setValue("weeklyGoal", currentGoal);
    }
    if (currentGoalData.jobsAppliedToWeeklyGoalMin) {
      setGoalMin(Number(currentGoalData.jobsAppliedToWeeklyGoalMin));
      setValue("weeklyGoalMin", currentGoalData.jobsAppliedToWeeklyGoalMin);
    }
    if (currentGoalData.jobsAppliedToWeeklyGoalMax) {
      setGoalMax(Number(currentGoalData.jobsAppliedToWeeklyGoalMax));
      setValue("weeklyGoalMax", currentGoalData.jobsAppliedToWeeklyGoalMax);
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
          jobsAppliedToDaysPerWeekGoal: data.weeklyGoal,
          jobsAppliedToWeeklyGoalMin: data.weeklyGoalMin,
          jobsAppliedToWeeklyGoalMax: data.weeklyGoalMax,
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
        `Your goal is to apply to ${result.jobsAppliedToWeeklyGoalMin} - ${
          result.jobsAppliedToWeeklyGoalMax
        } jobs per week.
        Your goal is to apply for ${result.jobsAppliedToDaysPerWeekGoal} ${
          isPlural ? "days" : "day"
        } per week.`
      );
      mutate("/api/weekly-application-goal");
      reset();
    } catch (error) {
      toast.error("An error occurred while saving your application target.");
    }
  };

  const handleHexagonClick = (day: number) => {
    setSelectedGoal(day);
    setValue("weeklyGoal", day);
  };

  const handleMinIncrement = () => {
    if (goalMin < goalMax) {
      const newGoalMin = goalMin + 1;
      setGoalMin(newGoalMin);
      setValue("weeklyGoalMin", newGoalMin);
    }
  };

  const handleMinDecrement = () => {
    if (goalMin > 1) {
      const newGoalMin = goalMin - 1;
      setGoalMin(newGoalMin);
      setValue("weeklyGoalMin", newGoalMin);
    }
  };

  const handleMaxIncrement = () => {
    if (goalMax > 1) {
      const newGoalMax = goalMax + 1;
      setGoalMax(newGoalMax);
      setValue("weeklyGoalMax", newGoalMax);
    }
  };

  const handleMaxDecrement = () => {
    if (goalMax > goalMin) {
      const newGoalMax = goalMax - 1;
      setGoalMax(newGoalMax);
      setValue("weeklyGoalMax", newGoalMax);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoalMin = Number(e.target.value);
    setGoalMin(newGoalMin);
    setValue("weeklyGoalMin", newGoalMin);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoalMax = Number(e.target.value);
    setGoalMax(newGoalMax);
    setValue("weeklyGoalMax", newGoalMax);
  };
  return (
    <div>
      <div className="rounded-lg p-6 shadow-lg relative">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
          How many days a week do you plan on applying? (optional)
        </h2>
        <div className="flex gap-6 justify-start">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              onClick={() => handleHexagonClick(day)}
              className={`w-6 h-6 sm:w-12 sm:h-12 text-white flex items-center justify-center relative transform rotate-30 ${
                (selectedGoal ?? 0) >= day ? "bg-blue-600" : "bg-blue-200"
              }`}
              style={{
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            ></div>
          ))}
        </div>
        <form onSubmit={handleSubmit(handleSave)} className="mt-8">
          <div className="mt-6 text-white">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">
              How many jobs do you plan on applying to each week? (optional)
            </h3>
            <div className="flex max-w-sm justify-between">
              <div className="flex flex-col">
                <label htmlFor="weeklyGoalMin" className="mb-2 sr-only">
                  Jobs Applied to Weekly Goal (Min)
                </label>
                <div className="relative flex items-center max-w-[8rem]">
                  <button
                    type="button"
                    onClick={handleMinDecrement}
                    className="bg-zinc-700 hover:bg-zinc-600 rounded-s-lg p-3 h-11 border border-zinc-500 focus:ring-gray-700 focus:ring-2 focus:outline-none"
                  >
                    <MdRemove className="w-3 h-3  text-white" />
                  </button>
                  <input
                    type="number"
                    id="weeklyGoalMin"
                    value={goalMin}
                    onChange={handleMinChange}
                    className="bg-zinc-700 border-x-0 h-11 text-center text-sm block w-full py-2.5 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleMinIncrement}
                    className="bg-zinc-700 hover:bg-zinc-600 rounded-e-lg p-3 h-11 border border-zinc-500 focus:ring-gray-700 focus:ring-2 focus:outline-none"
                  >
                    <MdAdd className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
              <span className="flex items-center">
                <FaMinus className="h-6 w-6" />
              </span>
              <div className="flex flex-col">
                <label htmlFor="weeklyGoalMax" className="mb-2 sr-only">
                  Jobs Applied to Weekly Goal (Max)
                </label>
                <div className="relative flex items-center max-w-[8rem]">
                  <button
                    type="button"
                    onClick={handleMaxDecrement}
                    className="bg-zinc-700 hover:bg-zinc-600 rounded-s-lg p-3 h-11 border border-zinc-500 focus:ring-gray-700 focus:ring-2 focus:outline-none"
                  >
                    <MdRemove className="w-3 h-3 text-gray-900 dark:text-white" />
                  </button>
                  <input
                    type="number"
                    id="weeklyGoalMax"
                    value={goalMax}
                    onChange={handleMaxChange}
                    className="bg-zinc-700 border-x-0 h-11 text-center text-sm block w-full py-2.5 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleMaxIncrement}
                    className="bg-zinc-700 hover:bg-zinc-600 rounded-e-lg p-3 h-11 border border-zinc-500 focus:ring-gray-700 focus:ring-2 focus:outline-none"
                  >
                    <MdAdd className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-start mt-6">
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full shadow-md transition-all duration-200 ease-in-out"
            >
              Save goal settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyGoalForm;
