import { getAchievements } from "@/app/actions/getAchievements";
import AwardsTabs from "@/app/components/awards/AwardsTabs";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";
import { BsBriefcase, BsLock } from "react-icons/bs";
import { FaFlagUsa, FaUserTie, FaCheck } from "react-icons/fa";
import { GiPartyPopper, GiPumpkinMask } from "react-icons/gi";
import { MdStairs } from "react-icons/md";
import { TbChristmasTree } from "react-icons/tb";

interface Achievement {
  id: string;
  description: string;
  name: string;
  unlocked: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
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
      "border-blue-500"
    ),
    interview: createAchievement(
      isInterviewAchievement,
      <FaUserTie className="w-8 h-8 text-white" />,
      "border-green-500"
    ),
    streak: createAchievement(
      isStreakAchievement,
      <MdStairs className="w-8 h-8 text-white" />,
      "border-yellow-500"
    ),
    holiday: createAchievement(
      isHolidayAchievement,
      holidayIconMap[name.split("Applied on ")[1]?.split(" ")[0]] || (
        <FaFlagUsa className="w-8 h-8 text-white" />
      ),
      "border-red-500"
    ),
  };

  let selectedIcon: JSX.Element | null = null;
  let selectedBorderColor = "border-blue-500";
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

  const cardStyle = unlocked ? {} : { filter: "brightness(0.7)" };
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

  const achievementNumber =
    isJobAchievement || isInterviewAchievement
      ? abbreviateNumber(numberJobs ?? numberInterviews)
      : null;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-800 opacity-80 rounded-lg shadow-md">
      <div
        className={`relative bg-zinc-700 ${selectedBorderColor} rounded-full h-28 w-28 flex items-center justify-center mb-2`}
        style={cardStyle}
      >
        {selectedIcon}
        {achievementNumber && (
          <div className="absolute top-10 right-2 rounded-full text-white text-xs font-bold w-6 h-6 flex items-center justify-center">
            {achievementNumber}
          </div>
        )}
        <div className="absolute bottom-4 left-10 right-0 text-white text-xs font-bold">
          {year}
        </div>
        {lockIcon}
      </div>
      <h3 className="text-lg font-bold text-center">{name}</h3>
      {dateStr && <p className="text-xs text-center">{dateStr}</p>}
    </div>
  );
}

export default async function Awards() {
  const achievementsData = await getAchievements();

  if (!achievementsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse bg-gray-800 p-4 rounded-lg">
          Unable to load achievements
        </div>
      </div>
    );
  }

  const { jobAchievements, interviewAchievements, holidayAchievements } =
    achievementsData;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <AwardsTabs
          jobAchievements={jobAchievements}
          interviewAchievements={interviewAchievements}
          holidayAchievements={holidayAchievements}
        />
      </div>
    </section>
  );
}
