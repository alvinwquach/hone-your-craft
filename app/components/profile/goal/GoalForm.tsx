import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mutate } from "swr";
import { MdAdd, MdRemove } from "react-icons/md";
import { FaMinus } from "react-icons/fa";
import { Calendar, DateObject } from "react-multi-date-picker";
import { isSameDay, isToday } from "date-fns";

const schema = z.object({
  jobsAppliedToDaysPerWeekGoal: z
    .number()
    .min(
      1,
      "Please select a goal for how many days a week you plan on applying"
    )
    .optional(),
  jobsAppliedToWeeklyGoalMin: z
    .number()
    .min(1, "Minimum goal must be at least 1")
    .optional(),
  jobsAppliedToWeeklyGoalMax: z
    .number()
    .min(1, "Maximum goal must be at least 1")
    .optional(),
  monthlyInterviewGoal: z
    .number()
    .min(0, "Monthly interviews scheduled goal must be a positive number")
    .int("Please enter a valid integer value.")
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

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

interface WeeklyApplicationTargetData {
  applicationPresence: [DayOfWeek, boolean][];
}

interface GoalFormProps {
  currentGoalData: {
    jobsAppliedToDaysPerWeekGoal: number;
    jobsAppliedToWeeklyGoalMin: number;
    jobsAppliedToWeeklyGoalMax: number;
    monthlyInterviewGoal: number;
    candidateGoal: string;
    offerReceivedByDateGoal: Date;
    offerReceivedByDateGoalStart: Date;
    offerReceivedByDateGoalEnd: Date;
  };
  weeklyApplicationTargetData: WeeklyApplicationTargetData | undefined;
}

const GoalForm = ({
  currentGoalData,
  weeklyApplicationTargetData,
}: GoalFormProps) => {
  const {
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobsAppliedToDaysPerWeekGoal:
        currentGoalData?.jobsAppliedToDaysPerWeekGoal || 1,
      jobsAppliedToWeeklyGoalMin:
        currentGoalData?.jobsAppliedToWeeklyGoalMin || 1,
      jobsAppliedToWeeklyGoalMax:
        currentGoalData?.jobsAppliedToWeeklyGoalMax || 1,
      monthlyInterviewGoal: currentGoalData?.monthlyInterviewGoal || 0,
      candidateGoal: "NotSureYet",
      offerReceivedByDateGoal: currentGoalData?.offerReceivedByDateGoal || null,
      offerReceivedByDateGoalStart:
        currentGoalData?.offerReceivedByDateGoalStart || null,
      offerReceivedByDateGoalEnd:
        currentGoalData?.offerReceivedByDateGoalEnd || null,
    },
  });

  const [selectedGoal, setSelectedGoal] = useState<number | null>(1);
  const [goalMin, setGoalMin] = useState<number>(1);
  const [goalMax, setGoalMax] = useState<number>(2);
  const [monthlyInterviewsGoal, setMonthlyInterviewsGoal] = useState<number>(0);
  const [candidateGoal, setCandidateGoal] = useState<string>("NotSureYet");
  const [selectedDates, setSelectedDates] = useState<DateObject[]>([]);

  useEffect(() => {
    if (currentGoalData) {
      if (currentGoalData.jobsAppliedToDaysPerWeekGoal) {
        const currentGoal = Number(
          currentGoalData.jobsAppliedToDaysPerWeekGoal
        );
        setSelectedGoal(currentGoal);
        setValue("jobsAppliedToDaysPerWeekGoal", currentGoal);
      }

      if (currentGoalData.jobsAppliedToWeeklyGoalMin) {
        setGoalMin(Number(currentGoalData.jobsAppliedToWeeklyGoalMin));
        setValue(
          "jobsAppliedToWeeklyGoalMin",
          currentGoalData.jobsAppliedToWeeklyGoalMin
        );
      }

      if (currentGoalData.jobsAppliedToWeeklyGoalMax) {
        setGoalMax(Number(currentGoalData.jobsAppliedToWeeklyGoalMax));
        setValue(
          "jobsAppliedToWeeklyGoalMax",
          currentGoalData.jobsAppliedToWeeklyGoalMax
        );
      }

      if (currentGoalData.monthlyInterviewGoal !== undefined) {
        setMonthlyInterviewsGoal(currentGoalData.monthlyInterviewGoal);
        setValue("monthlyInterviewGoal", currentGoalData.monthlyInterviewGoal);
      }

      if (currentGoalData.candidateGoal) {
        setCandidateGoal(
          currentGoalData.candidateGoal as
            | "NotSureYet"
            | "ChangeMyCareer"
            | "GrowInMyExistingRole"
            | "ExploreNewOpportunities"
            | "ImproveSkillset"
            | "LookingForANewJob"
            | "ReceiveAnOffer"
            | "BuildAPortfolio"
        );
        setValue(
          "candidateGoal",
          currentGoalData.candidateGoal as
            | "NotSureYet"
            | "ChangeMyCareer"
            | "GrowInMyExistingRole"
            | "ExploreNewOpportunities"
            | "ImproveSkillset"
            | "LookingForANewJob"
            | "ReceiveAnOffer"
            | "BuildAPortfolio"
        );
      }
      if (currentGoalData.offerReceivedByDateGoal) {
        const offerReceivedByDateGoal = new Date(
          currentGoalData.offerReceivedByDateGoal
        );
        setValue("offerReceivedByDateGoal", offerReceivedByDateGoal);
        setSelectedDates([new DateObject(offerReceivedByDateGoal)]);
      }

      if (
        currentGoalData.offerReceivedByDateGoalStart &&
        currentGoalData.offerReceivedByDateGoalEnd
      ) {
        const offerReceivedByDateGoalStart = new Date(
          currentGoalData.offerReceivedByDateGoalStart
        );
        const offerReceivedByDateGoalEnd = new Date(
          currentGoalData.offerReceivedByDateGoalEnd
        );

        setValue("offerReceivedByDateGoalStart", offerReceivedByDateGoalStart);
        setValue("offerReceivedByDateGoalEnd", offerReceivedByDateGoalEnd);

        setSelectedDates([
          new DateObject(offerReceivedByDateGoalStart),
          new DateObject(offerReceivedByDateGoalEnd),
        ]);
      } else if (
        currentGoalData.offerReceivedByDateGoalStart === null &&
        currentGoalData.offerReceivedByDateGoalEnd === null
      ) {
        if (currentGoalData.offerReceivedByDateGoal) {
          const offerReceivedByDateGoal = new Date(
            currentGoalData.offerReceivedByDateGoal
          );
          setSelectedDates([new DateObject(offerReceivedByDateGoal)]);
        } else {
          setSelectedDates([]);
        }
      }
    }
  }, [currentGoalData, setValue]);

  const handleSave: SubmitHandler<FormData> = async (data) => {
    try {
      let offerReceivedByDateGoal: Date | null = null;
      let offerReceivedByDateGoalStart: Date | null = null;
      let offerReceivedByDateGoalEnd: Date | null = null;

      if (selectedDates.length === 1) {
        offerReceivedByDateGoal = selectedDates[0]?.toDate();
      }

      if (selectedDates.length === 2) {
        offerReceivedByDateGoalStart = selectedDates[0]?.toDate();
        offerReceivedByDateGoalEnd =
          selectedDates[selectedDates.length - 1]?.toDate();
      }

      function formatCamelCase(str: string) {
        return str
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .toLowerCase()
          .replace(/^./, (match) => match.toUpperCase());
      }

      let offerGoalMessage = "";
      if (offerReceivedByDateGoal) {
        offerGoalMessage = `Your goal is to get an offer by ${offerReceivedByDateGoal.toLocaleDateString()}`;
      } else if (offerReceivedByDateGoalStart && offerReceivedByDateGoalEnd) {
        offerGoalMessage = `Your goal is to get an offer between ${offerReceivedByDateGoalStart.toLocaleDateString()} and ${offerReceivedByDateGoalEnd.toLocaleDateString()}`;
      }

      const response = await fetch("/api/weekly-application-goal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobsAppliedToDaysPerWeekGoal: data.jobsAppliedToDaysPerWeekGoal,
          jobsAppliedToWeeklyGoalMin: data.jobsAppliedToWeeklyGoalMin,
          jobsAppliedToWeeklyGoalMax: data.jobsAppliedToWeeklyGoalMax,
          monthlyInterviewGoal: data.monthlyInterviewGoal,
          candidateGoal: data.candidateGoal,
          offerReceivedByDateGoal: offerReceivedByDateGoal || undefined,
          offerReceivedByDateGoalStart:
            offerReceivedByDateGoalStart || undefined,
          offerReceivedByDateGoalEnd: offerReceivedByDateGoalEnd || undefined,
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
        `Your weekly goal is to apply to ${
          result.jobsAppliedToWeeklyGoalMin
        } - ${result.jobsAppliedToWeeklyGoalMax} jobs and apply ${
          result.jobsAppliedToDaysPerWeekGoal
        } ${isPlural ? "days" : "day"} per week. Your monthly goal is to have ${
          result.monthlyInterviewGoal
        } interviews. Your goal: ${formatCamelCase(
          result.candidateGoal
        )}. ${offerGoalMessage}`
      );

      mutate("/api/weekly-application-goal");
      reset();
    } catch (error) {
      toast.error("An error occurred while saving your application target.");
    }
  };

  const handleDateChange = (dateObjects: DateObject[]) => {
    setSelectedDates(dateObjects);
    if (dateObjects.length === 1) {
      const selectedDate = dateObjects[0].toDate();
      setValue("offerReceivedByDateGoal", selectedDate);
      setValue("offerReceivedByDateGoalStart", null);
      setValue("offerReceivedByDateGoalEnd", null);
    } else if (dateObjects.length === 2) {
      const sortedDates = dateObjects.sort(
        (a, b) => a.toDate().getTime() - b.toDate().getTime()
      );
      const startDate = sortedDates[0].toDate();
      const endDate = sortedDates[1].toDate();
      setValue("offerReceivedByDateGoalStart", startDate);
      setValue("offerReceivedByDateGoalEnd", endDate);
      setValue("offerReceivedByDateGoal", null);
    } else {
      setValue("offerReceivedByDateGoal", null);
      setValue("offerReceivedByDateGoalStart", null);
      setValue("offerReceivedByDateGoalEnd", null);
    }
  };

  const handleHexagonClick = (day: number) => {
    setSelectedGoal(day);
    setValue("jobsAppliedToDaysPerWeekGoal", day);
  };

  const handleMinIncrement = () => {
    if (goalMin < goalMax) {
      const newGoalMin = goalMin + 1;
      setGoalMin(newGoalMin);
      setValue("jobsAppliedToWeeklyGoalMin", newGoalMin);
    }
  };

  const handleMinDecrement = () => {
    if (goalMin > 1) {
      const newGoalMin = goalMin - 1;
      setGoalMin(newGoalMin);
      setValue("jobsAppliedToWeeklyGoalMin", newGoalMin);
    }
  };

  const handleMaxIncrement = () => {
    if (goalMax > 1) {
      const newGoalMax = goalMax + 1;
      setGoalMax(newGoalMax);
      setValue("jobsAppliedToWeeklyGoalMax", newGoalMax);
    }
  };

  const handleMaxDecrement = () => {
    if (goalMax > goalMin) {
      const newGoalMax = goalMax - 1;
      setGoalMax(newGoalMax);
      setValue("jobsAppliedToWeeklyGoalMax", newGoalMax);
    }
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoalMin = Number(e.target.value);
    setGoalMin(newGoalMin);
    setValue("jobsAppliedToWeeklyGoalMin", newGoalMin);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoalMax = Number(e.target.value);
    setGoalMax(newGoalMax);
    setValue("jobsAppliedToWeeklyGoalMax", newGoalMax);
  };

  const handleMonthlyInterviewsGoalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newInterviewsGoal = Number(e.target.value);
    setMonthlyInterviewsGoal(newInterviewsGoal);
    setValue("monthlyInterviewGoal", newInterviewsGoal);
  };

  const handleCandidateGoalChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value as
      | "ChangeMyCareer"
      | "GrowInMyExistingRole"
      | "ExploreNewOpportunities"
      | "ImproveSkillset"
      | "LookingForANewJob"
      | "ReceiveAnOffer"
      | "NotSureYet";
    setCandidateGoal(value);
    setValue("candidateGoal", value);
  };

  const today = new Date();

  const weeklyDayTargetMap = new Map([
    ["Sunday", "S"],
    ["Monday", "M"],
    ["Tuesday", "T"],
    ["Wednesday", "W"],
    ["Thursday", "T"],
    ["Friday", "F"],
    ["Saturday", "S"],
  ]);

  const appliedDaysCount: number =
    weeklyApplicationTargetData?.applicationPresence?.filter(
      ([_, applied]) => applied
    ).length || 0;

  return (
    <div>
      <div className="rounded-lg p-6 shadow-lg relative">
        <div className="mt-6 text-white">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">
            What is your goal? (optional)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="ReceiveAnOffer"
                checked={candidateGoal === "ReceiveAnOffer"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Receive an Offer
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="ChangeMyCareer"
                checked={candidateGoal === "ChangeMyCareer"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Change My Career
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="LookingForANewJob"
                checked={candidateGoal === "LookingForANewJob"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Looking for a New Job
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="ExploreNewOpportunities"
                checked={candidateGoal === "ExploreNewOpportunities"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Explore New Opportunities
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="ImproveSkillset"
                checked={candidateGoal === "ImproveSkillset"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Improve Skillset
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="GrowInMyExistingRole"
                checked={candidateGoal === "GrowInMyExistingRole"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Grow In My Existing Role
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="BuildAPortfolio"
                checked={candidateGoal === "BuildAPortfolio"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Build A Portfolio
            </label>
            <label className="text-sm text-white flex items-center">
              <input
                type="radio"
                value="NotSureYet"
                checked={candidateGoal === "NotSureYet"}
                onChange={handleCandidateGoalChange}
                className="mr-2"
              />
              Not Sure Yet
            </label>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold my-4 text-white">
          How many days a week do you plan on applying? (optional)
        </h3>
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
          <div>
            <p className="text-white mb-4">
              {appliedDaysCount >= currentGoalData.jobsAppliedToDaysPerWeekGoal
                ? "Great job! You've met your weekly target!"
                : `${
                    currentGoalData.jobsAppliedToDaysPerWeekGoal -
                    appliedDaysCount
                  } days left to meet your weekly target. Keep up the good work!`}
            </p>
            <div className="flex gap-6 justify-start">
              {[...weeklyDayTargetMap.keys()].map((day, index) => {
                const dayAbbreviation = weeklyDayTargetMap.get(day);

                const wasApplied =
                  weeklyApplicationTargetData?.applicationPresence.find(
                    ([dayKey]: [DayOfWeek, boolean]) => dayKey === day
                  )?.[1] || false;

                return (
                  <div
                    key={index}
                    className={`w-6 h-6 sm:w-12 sm:h-12 flex items-center justify-center relative transform rotate-30 
            ${wasApplied ? "bg-blue-600" : "bg-gray-400"}`}
                    style={{
                      clipPath:
                        "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }}
                  >
                    <span className="text-sm">{dayAbbreviation}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-lg sm:text-xl font-semibold my-4 text-white">
              <span className="text-2xl font-bold">{appliedDaysCount}</span> /{" "}
              <span>{currentGoalData.jobsAppliedToDaysPerWeekGoal}</span> days
            </div>
          </div>

          <div className="mt-6 text-white">
            <h4 className="text-lg sm:text-xl font-semibold mb-4 text-white">
              How many jobs do you plan on applying to each week? (optional)
            </h4>
            <div className="flex max-w-sm justify-between">
              <div className="flex flex-col">
                <label
                  htmlFor="jobsAppliedToWeeklyGoalMin"
                  className="mb-2 sr-only"
                >
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
                    id="jobsAppliedToWeeklyGoalMin"
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
                <label
                  htmlFor="jobsAppliedToWeeklyGoalMax"
                  className="mb-2 sr-only"
                >
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
                    id="jobsAppliedToWeeklyGoalMax"
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

          <div className="mt-6 text-white">
            <h4 className="text-lg sm:text-xl font-semibold mb-4 text-white">
              How many interviews are you aiming to have each month? (optional)
            </h4>
            <div className="flex flex-col">
              <input
                type="number"
                id="monthlyInterviewGoal"
                value={monthlyInterviewsGoal}
                onChange={handleMonthlyInterviewsGoalChange}
                className="bg-zinc-700 border-x-0 h-11 text-center text-sm block w-1/2 rounded-lg py-2.5 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                min={0}
              />
            </div>
          </div>
          {candidateGoal === "ReceiveAnOffer" && (
            <div className="mt-6 text-white z-10">
              <h5 className="text-lg sm:text-xl font-semibold mb-4 text-white">
                When would you like to receive an offer by? (optional)
              </h5>
              <div className="flex flex-col relative z-10">
                <Calendar
                  multiple
                  minDate={today}
                  value={selectedDates}
                  onChange={handleDateChange}
                  headerOrder={["MONTH_YEAR", "LEFT_BUTTON", "RIGHT_BUTTON"]}
                  monthYearSeparator={" "}
                  showOtherDays={true}
                  mapDays={({ date }) => {
                    const isTodayDate = isToday(date.toDate());
                    const isSelected = selectedDates.some((d) =>
                      isSameDay(d.toDate(), date.toDate())
                    );
                    const isBeforeToday = date.toDate() < today;
                    const isInRange =
                      selectedDates.length > 1 &&
                      selectedDates[0].toDate() <= date.toDate() &&
                      selectedDates[selectedDates.length - 1].toDate() >=
                        date.toDate();

                    let dayClasses = "cursor-pointer";

                    if (isBeforeToday) {
                      dayClasses = "text-gray-400";
                    } else if (isSelected) {
                      dayClasses = "bg-blue-700 text-white";
                    } else if (isTodayDate) {
                      dayClasses = "bg-transparent text-blue-700";
                    } else if (isInRange) {
                      dayClasses = "bg-blue-300 text-white";
                    } else {
                      dayClasses = "bg-blue-100 text-blue-700 font-bold";
                    }

                    return {
                      className: dayClasses,
                      children: isTodayDate ? (
                        <div>
                          <div>{date.day}</div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: 2,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 4,
                              height: 4,
                              backgroundColor: "white",
                              borderRadius: "50%",
                            }}
                          ></div>
                        </div>
                      ) : (
                        date.day
                      ),
                    };
                  }}
                />
              </div>
            </div>
          )}
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

export default GoalForm;
