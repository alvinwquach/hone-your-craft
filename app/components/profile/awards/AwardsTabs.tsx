"use client";

import { useState } from "react";
import { BsBriefcase, BsLock } from "react-icons/bs";
import { FaFlagUsa, FaUserTie, FaCheck, FaBriefcase } from "react-icons/fa";
import { GiEasterEgg, GiPartyPopper, GiPumpkinMask } from "react-icons/gi";
import { MdStairs } from "react-icons/md";
import { TbChristmasTree } from "react-icons/tb";
import { IoMedal, IoCalendarNumberSharp } from "react-icons/io5";

interface Achievement {
  id: string;
  description: string;
  name: string;
  unlocked: boolean;
}

interface AwardsTabsProps {
  initialData: {
    jobAchievements: Achievement[];
    interviewAchievements: Achievement[];
    holidayAchievements: Achievement[];
  };
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { description, unlocked, name } = achievement;

  const jobsApplied = description.match(/applying to (\d+) jobs/);
  const numberJobs = jobsApplied ? parseInt(jobsApplied[1], 10) : null;
  const interviewsAttended = description.match(/attending (\d+) interviews/);
  const numberInterviews = interviewsAttended
    ? parseInt(interviewsAttended[1], 10)
    : null;
  const dateParts = description.split(/ on | by /);
  const dateStr = dateParts.length > 1 ? dateParts[1] : null;
  const year = dateStr ? dateStr.split("/")[2] : "";

  const isJobAchievement = numberJobs !== null;
  const isInterviewAchievement = numberInterviews !== null;
  const isStreakAchievement = description.includes("week in a row");
  const isHolidayAchievement = name.includes("Applied on");

  const holidayIconMap: Record<string, JSX.Element> = {
    "Memorial Day": <FaFlagUsa className="w-8 h-8 text-white" />,
    "New Year's Day": <GiPartyPopper className="w-8 h-8 text-white" />,
    Halloween: <GiPumpkinMask className="w-8 h-8 text-white" />,
    "Christmas Day": <TbChristmasTree className="w-8 h-8 text-white" />,
    Easter: <GiEasterEgg className="w-8 h-8 text-white" />,
  };

  const createAchievement = (
    condition: boolean,
    icon: JSX.Element,
    borderColor: string
  ) => ({ condition, icon, borderColor });

  const achievementsMapping = {
    job: createAchievement(
      isJobAchievement,
      <BsBriefcase className="w-8 h-8 text-white" />,
      "border-emerald-500"
    ),
    interview: createAchievement(
      isInterviewAchievement,
      <FaUserTie className="w-8 h-8 text-white" />,
      "border-violet-500"
    ),
    streak: createAchievement(
      isStreakAchievement,
      <MdStairs className="w-8 h-8 text-white" />,
      "border-amber-500"
    ),
    holiday: createAchievement(
      isHolidayAchievement,
      holidayIconMap[name.split("Applied on ")[1]?.split(" ")[0]] || (
        <FaFlagUsa className="w-8 h-8 text-white" />
      ),
      "border-rose-500"
    ),
  };

  let selectedIcon: JSX.Element | null = null;
  let selectedBorderColor = "border-zinc-500";
  for (const key in achievementsMapping) {
    const achievement =
      achievementsMapping[key as keyof typeof achievementsMapping];
    if (achievement.condition) {
      selectedIcon = achievement.icon;
      selectedBorderColor = achievement.borderColor;
      break;
    }
  }

  const lockIcon = unlocked ? (
    <FaCheck className="bg-zinc-900 p-2 rounded-full w-8 h-8 text-green-500 absolute top-1 right-1" />
  ) : (
    <BsLock className="bg-zinc-900 p-2 rounded-full w-8 h-8 text-white absolute top-1 right-1" />
  );

  function abbreviateNumber(num: number | null): string {
    if (num === null) {
      return "N";
    }
    const suffixes = ["", "K", "M", "B"];
    let i = 0;
    while (num >= 1000 && i < suffixes.length - 1) {
      num /= 1000;
      i++;
    }
    if (num % 1 === 0) {
      return Math.floor(num) + suffixes[i];
    } else {
      return (
        parseFloat(num.toFixed(2))
          .toString()
          .replace(/\.?0+$/, "") + suffixes[i]
      );
    }
  }

  const cardStyle = unlocked ? {} : { filter: "brightness(0.7)" };

  const achievementNumber =
    isJobAchievement || isInterviewAchievement
      ? abbreviateNumber(numberJobs ?? numberInterviews)
      : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-zinc-700 rounded-2xl p-6 shadow-xl transition-all duration-300 transform backdrop-blur-sm">
      <div
        className={`relative bg-gradient-to-br from-zinc-800 to-zinc-900 ${selectedBorderColor} rounded-full h-28 w-28 flex items-center justify-center mb-2`}
        style={cardStyle}
      >
        {selectedIcon}
        {achievementNumber && (
          <div className="absolute top-10 right-2 rounded-full text-white text-xs font-bold w-6 h-6 flex items-center justify-center bg-zinc-900/50">
            {achievementNumber}
          </div>
        )}
        <div className="absolute bottom-4 left-10 right-0 text-white text-xs font-bold">
          {year}
        </div>
        {lockIcon}
      </div>
      <h3 className="text-lg font-bold text-center text-white mb-2">{name}</h3>
      {dateStr && (
        <p className="text-xs text-center text-gray-400">{dateStr}</p>
      )}
    </div>
  );
}

export default function AwardsTabs({ initialData }: AwardsTabsProps) {
  const [activeAchievementTab, setActiveAchievementTab] =
    useState<string>("all");

  const { jobAchievements, interviewAchievements, holidayAchievements } =
    initialData;

  return (
    <>
      <div className="text-sm fontproteins font-medium text-center text-gray-400 border-b border-zinc-700">
        <div className="flex flex-wrap -mb-px justify-start">
          <button
            onClick={() => setActiveAchievementTab("all")}
            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-all duration-300 hover:-translate-y-0.5 transform hover:shadow-lg ${
              activeAchievementTab === "all"
                ? "bg-zinc-900 text-white border-zinc-500"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <IoMedal
              className={`w-4 h-4 me-2 transition-all duration-300 ${
                activeAchievementTab === "all"
                  ? "text-white scale-110"
                  : "text-zinc-300 hover:text-white"
              }`}
            />
            All
          </button>
          <button
            onClick={() => setActiveAchievementTab("jobs")}
            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-all duration-300 hover:-translate-y-0.5 transform hover:shadow-lg ${
              activeAchievementTab === "jobs"
                ? "bg-zinc-900 text-white border-zinc-500"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <FaBriefcase
              className={`w-4 h-4 me-2 transition-all duration-300 ${
                activeAchievementTab === "jobs"
                  ? "text-white scale-110"
                  : "text-zinc-300 hover:text-white"
              }`}
            />
            Jobs
          </button>
          <button
            onClick={() => setActiveAchievementTab("interviews")}
            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-all duration-300 hover:-translate-y-0.5 transform hover:shadow-lg ${
              activeAchievementTab === "interviews"
                ? "bg-zinc-900 text-white border-zinc-500"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <IoCalendarNumberSharp
              className={`w-4 h-4 me-2 transition-all duration-300 ${
                activeAchievementTab === "interviews"
                  ? "text-white scale-110"
                  : "text-zinc-300 hover:text-white"
              }`}
            />
            Interviews
          </button>
          <button
            onClick={() => setActiveAchievementTab("holidays")}
            className={`inline-flex items-center p-4 border-b-2 rounded-t-lg transition-all duration-300 hover:-translate-y-0.5 transform hover:shadow-lg ${
              activeAchievementTab === "holidays"
                ? "bg-zinc-900 text-white border-zinc-500"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <FaFlagUsa
              className={`w-4 h-4 me-2 transition-all duration-300 ${
                activeAchievementTab === "holidays"
                  ? "text-white scale-110"
                  : "text-zinc-300 hover:text-white"
              }`}
            />
            Holidays
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {activeAchievementTab === "all" && (
          <>
            {jobAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
            {interviewAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
            {holidayAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </>
        )}
        {activeAchievementTab === "jobs" && (
          <>
            {jobAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </>
        )}
        {activeAchievementTab === "interviews" && (
          <>
            {interviewAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </>
        )}
        {activeAchievementTab === "holidays" && (
          <>
            {holidayAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
