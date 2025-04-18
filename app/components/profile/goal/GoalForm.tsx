"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { mutate } from "swr";
import { MdAdd, MdRemove } from "react-icons/md";
import { FaMinus } from "react-icons/fa";
import { Calendar, DateObject } from "react-multi-date-picker";
import { isSameDay, isToday } from "date-fns";
import updateGoalData from "../../../actions/updateGoalData";

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

interface WeeklyApplicationDayTrackerData {
  applicationPresence: [DayOfWeek, boolean][];
}

interface WeeklyApplicationGoalTrackerData {
  applicationPresence: [DayOfWeek, { presence: boolean; count: number }][];
  totalApplications: number;
}

interface MonthlyInterviewGoalTrackerData {
  currentMonthInterviews: number;
  targetInterviewsPerMonth: number;
  remainingInterviews: number;
  message: string;
}

interface GoalFormProps {
  currentGoalData: {
    jobsAppliedToDaysPerWeekGoal?: number | undefined;
    jobsAppliedToWeeklyGoalMin?: number | undefined;
    jobsAppliedToWeeklyGoalMax: number;
    monthlyInterviewGoal: number;
    candidateGoal: string;
    offerReceivedByDateGoal: Date | null;
    offerReceivedByDateGoalStart: Date | null;
    offerReceivedByDateGoalEnd: Date | null;
  };
  weeklyApplicationDayTrackerData: WeeklyApplicationDayTrackerData;
  weeklyApplicationGoalTrackerData: WeeklyApplicationGoalTrackerData;
  monthlyInterviewGoalTrackerData: MonthlyInterviewGoalTrackerData;
}

const Hexagon = ({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`w-6 h-6 sm:w-12 sm:h-12 flex items-center justify-center relative transform rotate-30 ${className}`}
    style={{
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    }}
  >
    {children}
  </div>
);

const WeeklyGoalHexagons = ({
  selectedGoal,
  onHexagonClick,
}: {
  selectedGoal: number | null;
  onHexagonClick: (day: number) => void;
}) => {
  const numberOfDaysInAWeek = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex gap-6 justify-start">
      {numberOfDaysInAWeek.map((day) => (
        <Hexagon
          key={day}
          onClick={() => onHexagonClick(day)}
          className={`text-white ${
            (selectedGoal ?? 0) >= day ? "bg-blue-600" : "bg-blue-200"
          }`}
        />
      ))}
    </div>
  );
};

const WeeklyApplicationDayTracker = ({
  weeklyApplicationDayTrackerData,
  weeklyDayTargetMap,
}: {
  weeklyApplicationDayTrackerData: WeeklyApplicationDayTrackerData | undefined;
  weeklyDayTargetMap: Map<string, string>;
}) => (
  <div className="flex gap-6 justify-start">
    {[...weeklyDayTargetMap.keys()].map((day, index) => {
      const dayAbbreviation = weeklyDayTargetMap.get(day);
      const wasApplied =
        weeklyApplicationDayTrackerData?.applicationPresence.find(
          ([dayKey]: [DayOfWeek, boolean]) => dayKey === day
        )?.[1] || false;

      return (
        <Hexagon
          key={index}
          className={`${wasApplied ? "bg-blue-600" : "bg-gray-400"}`}
        >
          <span className="text-sm">{dayAbbreviation}</span>
        </Hexagon>
      );
    })}
  </div>
);

const WeeklyApplicationGoalTracker = ({
  weeklyApplicationGoalTrackerData,
  weeklyDayTargetMap,
}: {
  weeklyApplicationGoalTrackerData:
    | WeeklyApplicationGoalTrackerData
    | undefined;
  weeklyDayTargetMap: Map<string, string>;
}) => (
  <div className="mt-4 flex gap-6 justify-start">
    {[...weeklyDayTargetMap.keys()].map((day, index) => {
      const dayAbbreviation = weeklyDayTargetMap.get(day);
      const dayData =
        weeklyApplicationGoalTrackerData?.applicationPresence.find(
          ([dayKey]) => dayKey === day
        )?.[1] || { presence: false, count: 0 };
      const wasApplied = dayData.presence;
      const applicationCount = dayData.count;

      return (
        <div key={index} className="flex flex-col items-center">
          <Hexagon className={`${wasApplied ? "bg-blue-600" : "bg-gray-400"}`}>
            <span className="text-lg text-white">{dayAbbreviation}</span>
          </Hexagon>
          <div className="text-xs mt-2 text-white">{applicationCount}</div>
        </div>
      );
    })}
  </div>
);

const GoalForm = ({
  currentGoalData,
  weeklyApplicationDayTrackerData,
  weeklyApplicationGoalTrackerData,
  monthlyInterviewGoalTrackerData,
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
    if (!currentGoalData) return;

    const goalMappings: {
      [key: string]: {
        stateSetter: (value: any) => void;
        formField: keyof FormData;
        transform?: (value: any) => any;
      };
    } = {
      jobsAppliedToDaysPerWeekGoal: {
        stateSetter: setSelectedGoal,
        formField: "jobsAppliedToDaysPerWeekGoal",
        transform: Number,
      },
      jobsAppliedToWeeklyGoalMin: {
        stateSetter: setGoalMin,
        formField: "jobsAppliedToWeeklyGoalMin",
        transform: Number,
      },
      jobsAppliedToWeeklyGoalMax: {
        stateSetter: setGoalMax,
        formField: "jobsAppliedToWeeklyGoalMax",
        transform: Number,
      },
      monthlyInterviewGoal: {
        stateSetter: setMonthlyInterviewsGoal,
        formField: "monthlyInterviewGoal",
      },
      candidateGoal: {
        stateSetter: setCandidateGoal,
        formField: "candidateGoal",
      },
    };

    Object.entries(goalMappings).forEach(
      ([key, { stateSetter, formField, transform }]) => {
        const value = currentGoalData[key as keyof typeof currentGoalData];
        if (value !== undefined && value !== null) {
          const transformedValue = transform ? transform(value) : value;
          stateSetter(transformedValue);
          setValue(formField, transformedValue);
        }
      }
    );

    const handleDates = () => {
      if (
        currentGoalData.offerReceivedByDateGoalStart &&
        currentGoalData.offerReceivedByDateGoalEnd
      ) {
        const start = new Date(currentGoalData.offerReceivedByDateGoalStart);
        const end = new Date(currentGoalData.offerReceivedByDateGoalEnd);
        setValue("offerReceivedByDateGoalStart", start);
        setValue("offerReceivedByDateGoalEnd", end);
        setSelectedDates([new DateObject(start), new DateObject(end)]);
      } else if (
        currentGoalData.offerReceivedByDateGoalStart === null &&
        currentGoalData.offerReceivedByDateGoalEnd === null
      ) {
        const date = currentGoalData.offerReceivedByDateGoal;
        setSelectedDates(date ? [new DateObject(new Date(date))] : []);
      } else if (currentGoalData.offerReceivedByDateGoal) {
        const date = new Date(currentGoalData.offerReceivedByDateGoal);
        setValue("offerReceivedByDateGoal", date);
        setSelectedDates([new DateObject(date)]);
      }
    };

    handleDates();
  }, [currentGoalData, setValue]);

  const handleSave = async (data: FormData) => {
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

      const formatCamelCase = (str: string): string => {
        return str
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .toLowerCase()
          .replace(/^./, (match) => match.toUpperCase());
      };

      let offerGoalMessage = "";
      if (offerReceivedByDateGoal) {
        offerGoalMessage = `Your goal is to get an offer by ${offerReceivedByDateGoal.toLocaleDateString()}`;
      } else if (offerReceivedByDateGoalStart && offerReceivedByDateGoalEnd) {
        offerGoalMessage = `Your goal is to get an offer between ${offerReceivedByDateGoalStart.toLocaleDateString()} and ${offerReceivedByDateGoalEnd.toLocaleDateString()}`;
      }

      const response = await updateGoalData(data);

      if (response.errors) {
        Object.entries(response.errors).forEach(([field, error]) => {
          toast.error(error[0]);
        });
        return;
      }

      const isPlural = data.jobsAppliedToDaysPerWeekGoal ?? 1 > 1;
      const successMessage = `
        Your weekly goal is to apply to ${data.jobsAppliedToWeeklyGoalMin} - ${
        data.jobsAppliedToWeeklyGoalMax
      } jobs
        and apply ${data.jobsAppliedToDaysPerWeekGoal ?? 0} ${
        isPlural ? "days" : "day"
      } per week.
        Your monthly goal is to have ${
          data.monthlyInterviewGoal ?? 0
        } interviews.
        Your goal: ${formatCamelCase(data.candidateGoal ?? "NotSureYet")}.
        ${offerGoalMessage}
      `;

      toast.success(successMessage, {
        toastId: "goalUpdateSuccess",
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      reset();
      mutate("/api/weekly-application-goal");
    } catch (error) {
      toast.error("An error occurred while saving your application target.", {
        toastId: "goalUpdateError",
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    weeklyApplicationDayTrackerData?.applicationPresence?.filter(
      ([_, applied]) => applied
    ).length || 0;

  const totalApplications =
    weeklyApplicationGoalTrackerData?.totalApplications || 0;

  const getWeeklyGoalMessage = (
    total: number,
    min: number | undefined,
    max: number | undefined
  ): string => {
    if (!min || !max) return "";

    const isSingular = (count: number): boolean => count === 1;

    const messages = {
      belowMin: (remaining: number) =>
        `You're almost there! You need to apply to ${
          remaining === 1 ? "1 more job" : `${remaining} more jobs`
        } to meet your minimum goal.`,

      atMin: () =>
        `Great job! You've met your minimum goal of ${min} ${
          isSingular(min) ? "application" : "applications"
        }. Keep going!`,

      inRange: () =>
        `You're on track! You've applied within your weekly goal range.`,

      atMax: () =>
        `Awesome! You've exactly met your maximum goal of ${max} ${
          isSingular(max) ? "application" : "applications"
        }. Well done!`,

      aboveMax: (excess: number) =>
        `Great job! You've surpassed your goal by ${
          excess === 1 ? "1 application" : `${excess} applications`
        }. Keep it up!`,
    };

    if (total < min) return messages.belowMin(min - total);
    if (total === min) return messages.atMin();
    if (total > min && total < max) return messages.inRange();
    if (total === max) return messages.atMax();
    return messages.aboveMax(total - max);
  };

  const jobsAppliedToWeeklyGoalMessage = getWeeklyGoalMessage(
    totalApplications,
    currentGoalData?.jobsAppliedToWeeklyGoalMin,
    currentGoalData?.jobsAppliedToWeeklyGoalMax
  );

  const getDistanceToMaxMessage = (
    remaining: number | undefined,
    max: number | undefined
  ): string => {
    if (!remaining || !max) return "";

    const messages = {
      below: (count: number) =>
        `You're ${count} applications away from hitting your maximum goal of ${max} applications. Keep pushing!`,
      at: () =>
        `You've exactly hit your maximum goal of ${max} applications. Awesome!`,
      above: (count: number) =>
        `You've surpassed your maximum goal by ${count} applications. Fantastic!`,
    };

    if (remaining > 0) return messages.below(remaining);
    if (remaining === 0) return messages.at();
    return messages.above(Math.abs(remaining));
  };

  const remainingApplicationsToMaxGoal =
    currentGoalData?.jobsAppliedToWeeklyGoalMax - totalApplications;
  const distanceToMaxGoalMessage = getDistanceToMaxMessage(
    remainingApplicationsToMaxGoal,
    currentGoalData?.jobsAppliedToWeeklyGoalMax
  );

  return (
    <div>
      <div className="rounded-lg p-6 shadow-lg relative bg-zinc-900">
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
        <WeeklyGoalHexagons
          selectedGoal={selectedGoal}
          onHexagonClick={handleHexagonClick}
        />
        <form onSubmit={handleSubmit(handleSave)} className="mt-8">
          <div>
            <p className="text-white mb-4">{jobsAppliedToWeeklyGoalMessage}</p>
            <WeeklyApplicationDayTracker
              weeklyApplicationDayTrackerData={weeklyApplicationDayTrackerData}
              weeklyDayTargetMap={weeklyDayTargetMap}
            />
            <div className="text-lg sm:text-xl font-semibold my-4 text-white">
              <span className="text-2xl font-bold">{appliedDaysCount}</span> /{" "}
              <span>{currentGoalData?.jobsAppliedToDaysPerWeekGoal}</span> days
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
          <div className="">
            <div className="text-white mt-4">
              <p>{jobsAppliedToWeeklyGoalMessage}</p>
            </div>
            <div className="mt-4">
              <span>{distanceToMaxGoalMessage}</span>
            </div>
            <WeeklyApplicationGoalTracker
              weeklyApplicationGoalTrackerData={
                weeklyApplicationGoalTrackerData
              }
              weeklyDayTargetMap={weeklyDayTargetMap}
            />
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
          <div className="mt-5">{monthlyInterviewGoalTrackerData?.message}</div>
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