"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import getUserJobPostings from "../actions/getUserJobPostings";
import { getUserJobSkillsAndFrequency } from "@/app/actions/getUserJobSkillsAndFrequency";
import { getUserJobMissingSkillsAndFrequency } from "@/app/actions/getUserJobMissingSkillsAndFrequency";
import { getJobsByApplicationStatus } from "@/app/actions/getJobsByApplicationStatus";
import { getCandidateJobInterviewFrequency } from "@/app/actions/getCandidateJobInterviewFrequency";
import { getCandidateJobPostingSourceCount } from "@/app/actions/getCandidateJobPostingSourceCount";
import { getCandidateApplicationStatus } from "../actions/getCandidateApplicationStatus";
import ProfileCard from "../components/profile/profile/ProfileCard";
import SkillsCard from "../components/profile/profile/SkillsCard";
import SuggestedSkillsCard from "../components/profile/profile/SuggestedSkillsCard";
import EducationList from "../components/profile/profile/EducationList";
import SkillsTable from "../components/profile/dashboard/SkillsTable";
import MissingSkillsTable from "../components/profile/dashboard/MissingSkillsTable";
import JobPostingSourceCountChart from "../components/profile/dashboard/JobPostingSourceCountChart";
import ApplicationStatusChart from "../components/profile/dashboard/ApplicationStatusChart";
import InterviewFrequencyChart from "../components/profile/dashboard/InterviewFrequencyChart";
import JobApplicationStatusChart from "../components/profile/dashboard/JobApplicationStatusChart";
import ResumeUpload from "../components/profile/resume/ResumeUpload";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaCalendarAlt,
  FaMoneyCheckAlt,
  FaFileAlt,
  FaBan,
  FaAward,
  FaUserTie,
  FaCheck,
  FaFlagUsa,
  FaTrophy,
  FaBriefcase,
  FaCalendar,
  FaTrash,
} from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import { SiBaremetrics } from "react-icons/si";
import RolesCard from "../components/profile/profile/RolesCard";
import { GiPumpkinMask, GiTargeting, GiThreeFriends } from "react-icons/gi";
import ConnectionsCard from "../components/profile/connections/ConnectionsCard";
import { GoGoal } from "react-icons/go";
import GoalForm from "../components/profile/goal/GoalForm";
import { BsBriefcase, BsLock } from "react-icons/bs";
import { MdMeetingRoom, MdStairs } from "react-icons/md";
import { GiPartyPopper } from "react-icons/gi";
import { TbChristmasTree } from "react-icons/tb";
import { gsap } from "gsap";
import { GrTrophy } from "react-icons/gr";
import { IoMdMedal } from "react-icons/io";
import {
  IoCalendarClearSharp,
  IoCalendarNumberSharp,
  IoCalendarSharp,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import MeetingCalendarDownloadButton from "../components/profile/meetings/MeetingCalendarDownloadButton";
import { getUserJobPostingsWithSkillMatch } from "@/app/actions/getUserJobPostingsWithSkillMatch";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  userRole?: string;
  image?: string;
  headline?: string;
  connectionStatus?: string;
}

interface JobPosting {
  title: string;
  company: string;
  postUrl: string;
  skills: string[];
}

interface JobMatchPosting {
  id: string;
  title: string;
  company: string;
  postUrl: string;
  source: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
}

interface JobApplicationStatus {
  status: string;
  count: number;
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchDocument = async () => {
  const response = await fetch("/api/documents/current", { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to fetch document.");
  }
  return response.json();
};

function Profile() {
  const { data: session } = useSession();
  const { data, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" }),
    { refreshInterval: 1000 }
  );
  const { data: resumeData } = useSWR("/api/documents/current", fetchDocument, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { data: users } = useSWR("/api/users", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: connections } = useSWR("/api/connections/", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: connectionsReceived } = useSWR(
    "/api/connections/received",
    (url) => fetch(url).then((res) => res.json())
  );
  const { data: connectionsSent } = useSWR("/api/connections/sent", (url) =>
    fetch(url).then((res) => res.json())
  );
  const { data: userAchievementData } = useSWR("/api/achievements", (url) =>
    fetch(url).then((res) => res.json())
  );
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activeAchievementTab, setActiveAchievementTab] =
    useState<string>("all");
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [currentPageSkills, setCurrentPageSkills] = useState(1);
  const [totalPagesSkills, setTotalPagesSkills] = useState(1);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [missingSkillsFrequency, setMissingSkillsFrequency] = useState<
    number[]
  >([]);
  const [currentPageMissingSkills, setCurrentPageMissingSkills] = useState(1);
  const [totalPagesMissingSkills, setTotalPagesMissingSkills] = useState(1);
  const [statusPercentages, setStatusPercentages] = useState<
    Map<string, number>
  >(new Map());
  const [interviewTypeFrequency, setInterviewTypeFrequency] = useState<
    Record<string, number>
  >({});
  const [jobPostingSourceCount, setJobPostingSourceCount] = useState<
    Record<string, number>
  >({});
  const [jobApplicationStatusCount, setJobApplicationStatusCount] = useState<
    JobApplicationStatus[]
  >([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set()
  );
  const jobAchievements = userAchievementData?.jobAchievements || [];
  const interviewAchievements =
    userAchievementData?.interviewAchievements || [];
  const holidayAchievements = userAchievementData?.holidayAchievements || [];

  const userRole = data?.user?.userRole;
  const userSkills = data?.user?.skills || [];
  const userData = data || [];

  const sendConnectionRequest = async (receiverId: string) => {
    const connectionStatus = users.find(
      (user: User) => user.id === receiverId
    )?.connectionStatus;

    if (connectionStatus === "NONE") {
      try {
        const response = await fetch("/api/connections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ receiverId }),
        });

        if (response.ok) {
          mutate("/api/connections/sent");
          mutate("/api/users");
          toast.success("Connection sent successfully!");
        } else {
          console.error("Failed to send connection request");
          toast.error("Failed to send connection request.");
        }
      } catch (error) {
        console.error("Error sending connection request:", error);
        toast.error("Error sending connection request.");
      } finally {
        setTimeout(() => {
          setPendingRequests((prev) => {
            const updated = new Set(prev);
            updated.delete(receiverId);
            return updated;
          });
        }, 3000);
      }
    } else {
      toast.info("You have already interacted with this user.");
    }
  };

  useEffect(() => {
    async function fetchJobPostings() {
      try {
        const userJobPostings = await getUserJobPostings();
        setJobPostings(userJobPostings);
      } catch (error) {
        console.error("Error fetching user job postings:", error);
      }
    }
    fetchJobPostings();
  }, []);

  useEffect(() => {
    async function fetchSkillsData() {
      try {
        const { sortedSkills, sortedFrequencies, totalPages } =
          await getUserJobSkillsAndFrequency(currentPageSkills);
        setSkills(sortedSkills);
        setFrequencies(sortedFrequencies);
        setTotalPagesSkills(totalPages);
      } catch (error) {
        console.error("Error fetching user skills:", error);
      }
    }
    fetchSkillsData();
  }, [currentPageSkills]);

  useEffect(() => {
    async function fetchMissingSkillsData() {
      try {
        const { sortedMissingSkills, sortedMissingFrequencies, totalPages } =
          await getUserJobMissingSkillsAndFrequency(currentPageMissingSkills);
        setMissingSkills(sortedMissingSkills);
        setMissingSkillsFrequency(sortedMissingFrequencies);
        setTotalPagesMissingSkills(totalPages);
      } catch (error) {
        console.error("Error fetching missing skills:", error);
      }
    }
    fetchMissingSkillsData();
  }, [currentPageMissingSkills]);

  const goToFirstPageSkills = () => {
    setCurrentPageSkills(1);
  };

  const goToLastPageSkills = () => {
    setCurrentPageSkills(totalPagesSkills);
  };

  const goToPreviousPageSkills = () => {
    if (currentPageSkills > 1) {
      setCurrentPageSkills(currentPageSkills - 1);
    }
  };

  const goToNextPageSkills = () => {
    if (currentPageSkills < totalPagesSkills) {
      setCurrentPageSkills(currentPageSkills + 1);
    }
  };

  const goToFirstPageMissingSkills = () => setCurrentPageMissingSkills(1);
  const goToLastPageMissingSkills = () =>
    setCurrentPageMissingSkills(totalPagesMissingSkills);
  const goToPreviousPageMissingSkills = () =>
    setCurrentPageMissingSkills((prev) => Math.max(prev - 1, 1));
  const goToNextPageMissingSkills = () =>
    setCurrentPageMissingSkills((prev) =>
      Math.min(prev + 1, totalPagesMissingSkills)
    );
  useEffect(() => {
    async function fetchApplicationStatusData() {
      try {
        const { percentages } = await getJobsByApplicationStatus();
        setStatusPercentages(percentages);
      } catch (error) {
        console.error("Error fetching application status:", error);
      }
    }
    fetchApplicationStatusData();
  }, []);

  useEffect(() => {
    const fetchCandidateJobInterviews = async () => {
      try {
        const { interviewTypeFrequency } =
          await getCandidateJobInterviewFrequency();
        setInterviewTypeFrequency(interviewTypeFrequency);
      } catch (error) {
        console.error("Error fetching user job interviews:", error);
      }
    };
    fetchCandidateJobInterviews();
  }, []);

  useEffect(() => {
    async function fetchJobPostingSourceCount() {
      try {
        const sourceCount = await getCandidateJobPostingSourceCount();
        setJobPostingSourceCount(sourceCount);
      } catch (error) {
        console.error("Error fetching job posting source count:", error);
      }
    }
    fetchJobPostingSourceCount();
  }, []);

  useEffect(() => {
    const fetchCandidateApplicationStatusCount = async () => {
      try {
        const result = await getCandidateApplicationStatus();
        setJobApplicationStatusCount(result.statusData);
      } catch (error) {
        console.error("Failed to fetch pie chart data", error);
      }
    };

    fetchCandidateApplicationStatusCount();
  }, []);

  const suggestedSkills = Array.from(
    new Set(
      jobPostings
        ? jobPostings
            .flatMap((job) => job.skills)
            .filter((skill) => !userSkills?.user?.skills.includes(skill))
        : []
    )
  );

  const rejectConnectionRequest = async (connectionId: string) => {
    try {
      const response = await fetch("/api/connections/reject", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        mutate("/api/connections/received");
        mutate("/api/connections/sent");
        mutate("/api/users");
        toast.success("Connection rejected successfully!");
      } else {
        toast.error("Failed to reject connection request.");
      }
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast.error("Error rejecting connection request.");
    }
  };

  const acceptConnectionRequest = async (connectionId: string) => {
    try {
      const response = await fetch("/api/connections/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        mutate("/api/connections/received");
        mutate("/api/connections/sent");
        mutate("/api/connections");
        toast.success("Connection accepted successfully!");
      } else {
        toast.error("Failed to accept connection request.");
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Error accepting connection request.");
    }
  };

  const loadingUserData = !userData || userDataLoading;
  const loadingUserSkills = !userSkills || userDataLoading;

  interface Achievement {
    id: string;
    description: string;
    name: string;
    unlocked: boolean;
  }

  interface AchievementCardProps {
    achievement: Achievement;
  }

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

  const holidayIconMap: { [key: string]: JSX.Element } = {
    "Memorial Day": <FaFlagUsa className="w-8 h-8 text-white" />,
    "New Year's Day": <GiPartyPopper className="w-8 h-8 text-white" />,
    Halloween: <GiPumpkinMask className="w-8 h-8 text-white" />,
    "Christmas Day": <TbChristmasTree className="w-8 h-8 text-white" />,
  };

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
        holidayIconMap[name] || <FaFlagUsa className="w-8 h-8 text-white" />,
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
  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userRole === "CANDIDATE" ? (
        <>
          <div>
            <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px justify-start">
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "profile"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaUser
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "profile" ? "text-blue-600" : ""
                      }`}
                    />
                    Profile
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("match")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "match"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <GiTargeting
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "match" ? "text-blue-600" : ""
                      }`}
                    />
                    Match
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("connections")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "connections"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <GiThreeFriends
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "connections" ? "text-blue-600" : ""
                      }`}
                    />
                    Connections
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("awards")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "awards"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaAward
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "awards" ? "text-blue-600" : ""
                      }`}
                    />
                    Awards
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("goal")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "goal"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                    aria-current={activeTab === "goal" ? "page" : undefined}
                  >
                    <GoGoal
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "goal" ? "text-blue-600" : ""
                      }`}
                    />
                    Goal
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "dashboard"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                    aria-current={
                      activeTab === "dashboard" ? "page" : undefined
                    }
                  >
                    <SiBaremetrics
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "dashboard" ? "text-blue-600" : ""
                      }`}
                    />
                    Dashboard
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("resume")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "resume"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaFileAlt
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "resume" ? "text-blue-600" : ""
                      }`}
                    />
                    Resume
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("meetings")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "meetings"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <MdMeetingRoom
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "meetings" ? "text-blue-600" : ""
                      }`}
                    />
                    Meetings
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("interviews")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "interviews"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaCalendarAlt
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "interviews" ? "text-blue-600" : ""
                      }`}
                    />
                    Interviews
                  </button>
                </li>
                <li className="me-2">
                  <button
                    onClick={() => setActiveTab("offers")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "offers"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaMoneyCheckAlt
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "offers" ? "text-blue-600" : ""
                      }`}
                    />
                    Offers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("rejections")}
                    className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                      activeTab === "rejections"
                        ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                        : ""
                    }`}
                  >
                    <FaBan
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                        activeTab === "rejections" ? "text-blue-600" : ""
                      }`}
                    />
                    Rejections
                  </button>
                </li>
              </ul>
            </div>
            {activeTab === "connections" && (
              <Suspense
                fallback={
                  <ConnectionsCard
                    users={[]}
                    connections={[]}
                    connectionsReceived={[]}
                    connectionsSent={[]}
                    sendConnectionRequest={sendConnectionRequest}
                    pendingRequests={pendingRequests}
                    acceptConnectionRequest={acceptConnectionRequest}
                    rejectionConnectionRequest={rejectConnectionRequest}
                  />
                }
              >
                <ConnectionsCard
                  users={users}
                  connections={connections}
                  connectionsReceived={connectionsReceived}
                  connectionsSent={connectionsSent}
                  sendConnectionRequest={sendConnectionRequest}
                  pendingRequests={pendingRequests}
                  acceptConnectionRequest={acceptConnectionRequest}
                  rejectionConnectionRequest={rejectConnectionRequest}
                />
              </Suspense>
            )}
            <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
              {activeTab === "profile" && (
                <Suspense fallback={<ProfileCard userData={[]} />}>
                  {!loadingUserData ? (
                    <ProfileCard userData={userData} />
                  ) : (
                    <div>Loading Profile...</div>
                  )}
                  <div className="my-4 border-t border-gray-600" />
                  {loadingUserSkills ? (
                    <div className="mt-4">
                      <Suspense fallback={<SkillsCard userSkills={[]} />}>
                        <SkillsCard userSkills={[]} />
                      </Suspense>
                    </div>
                  ) : (
                    <Suspense fallback={<SkillsCard userSkills={[]} />}>
                      <SkillsCard userSkills={userSkills} />
                    </Suspense>
                  )}
                  <div className="my-4 border-t border-gray-600" />
                  {loadingUserSkills ? (
                    <div className="mt-4">
                      <Suspense
                        fallback={
                          <SuggestedSkillsCard
                            userSkills={[]}
                            suggestedSkills={[]}
                          />
                        }
                      >
                        <SuggestedSkillsCard
                          userSkills={[]}
                          suggestedSkills={[]}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    <Suspense
                      fallback={
                        <SuggestedSkillsCard
                          userSkills={[]}
                          suggestedSkills={[]}
                        />
                      }
                    >
                      <SuggestedSkillsCard
                        userSkills={userSkills}
                        suggestedSkills={suggestedSkills}
                      />
                    </Suspense>
                  )}
                  <div className="my-4 border-t border-gray-600" />
                  <EducationList />
                </Suspense>
              )}
              {activeTab === "awards" && (
                <div className="container mx-auto p-4">
                  <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
                    <div className="flex flex-wrap -mb-px justify-start">
                      <button
                        onClick={() => setActiveAchievementTab("all")}
                        className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                          activeAchievementTab === "all"
                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                            : ""
                        }`}
                      >
                        <IoMdMedal
                          className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                            activeAchievementTab === "all"
                              ? "text-blue-600"
                              : ""
                          }`}
                        />
                        All
                      </button>
                      <button
                        onClick={() => setActiveAchievementTab("jobs")}
                        className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                          activeAchievementTab === "jobs"
                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                            : ""
                        }`}
                      >
                        <FaBriefcase
                          className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                            activeAchievementTab === "jobs"
                              ? "text-blue-600"
                              : ""
                          }`}
                        />
                        Jobs
                      </button>
                      <button
                        onClick={() => setActiveAchievementTab("interviews")}
                        className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                          activeAchievementTab === "interviews"
                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                            : ""
                        }`}
                      >
                        <IoCalendarNumberSharp
                          className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                            activeAchievementTab === "interviews"
                              ? "text-blue-600"
                              : ""
                          }`}
                        />
                        Interviews
                      </button>
                      <button
                        onClick={() => setActiveAchievementTab("holidays")}
                        className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                          activeAchievementTab === "holidays"
                            ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                            : ""
                        }`}
                      >
                        <FaFlagUsa
                          className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                            activeAchievementTab === "holidays"
                              ? "text-blue-600"
                              : ""
                          }`}
                        />
                        Holidays
                      </button>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold my-4">Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAchievementTab === "all" && (
                      <>
                        {jobAchievements.map((achievement: Achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                          />
                        ))}
                        {interviewAchievements.map(
                          (achievement: Achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                            />
                          )
                        )}
                        {holidayAchievements.map((achievement: Achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                          />
                        ))}
                      </>
                    )}
                    {activeAchievementTab === "jobs" && (
                      <>
                        {jobAchievements.map((achievement: Achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                          />
                        ))}
                      </>
                    )}
                    {activeAchievementTab === "interviews" && (
                      <>
                        {interviewAchievements.map(
                          (achievement: Achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                            />
                          )
                        )}
                      </>
                    )}
                    {activeAchievementTab === "holidays" && (
                      <>
                        {holidayAchievements.map((achievement: Achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
              {activeTab === "resume" && (
                <Suspense fallback={<ResumeUpload resumeData={resumeData} />}>
                  <ResumeUpload resumeData={resumeData} />
                </Suspense>
              )}
            </div>
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="w-full">
                  <SkillsTable
                    skills={skills}
                    frequencies={frequencies}
                    currentPage={currentPageSkills}
                    totalPages={totalPagesSkills}
                    goToFirstPage={goToFirstPageSkills}
                    goToPreviousPage={goToPreviousPageSkills}
                    goToNextPage={goToNextPageSkills}
                    goToLastPage={goToLastPageSkills}
                  />
                </div>
                <div className="w-full">
                  <MissingSkillsTable
                    missingSkills={missingSkills}
                    missingSkillsFrequency={missingSkillsFrequency}
                    currentPage={currentPageMissingSkills}
                    totalPages={totalPagesMissingSkills}
                    goToFirstPage={goToFirstPageMissingSkills}
                    goToPreviousPage={goToPreviousPageMissingSkills}
                    goToNextPage={goToNextPageMissingSkills}
                    goToLastPage={goToLastPageMissingSkills}
                  />
                </div>
                <div className="w-full">
                  <JobPostingSourceCountChart
                    jobPostingSourceCount={jobPostingSourceCount}
                  />
                </div>
                <div className="w-full">
                  <ApplicationStatusChart
                    statusPercentages={statusPercentages}
                  />
                </div>
                <div className="w-full">
                  <InterviewFrequencyChart
                    interviewFrequencies={interviewTypeFrequency}
                  />
                </div>
                <div className="w-full">
                  <JobApplicationStatusChart
                    jobApplicationStatus={jobApplicationStatusCount}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      ) : userRole === "CLIENT" ? (
        <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
          <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px justify-start">
              <li className="me-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                    activeTab === "profile"
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                >
                  <FaUser
                    className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                      activeTab === "profile" ? "text-blue-600" : ""
                    }`}
                  />
                  Profile
                </button>
              </li>
              <li className="me-2">
                <button
                  onClick={() => setActiveTab("connections")}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                    activeTab === "connections"
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                >
                  <GiThreeFriends
                    className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                      activeTab === "connections" ? "text-blue-600" : ""
                    }`}
                  />
                  Connections
                </button>
              </li>
              <li className="me-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                    activeTab === "dashboard"
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                  aria-current={activeTab === "dashboard" ? "page" : undefined}
                >
                  <SiBaremetrics
                    className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                      activeTab === "dashboard" ? "text-blue-600" : ""
                    }`}
                  />
                  Dashboard
                </button>
              </li>
              <li className="me-2">
                <button
                  onClick={() => setActiveTab("interviews")}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                    activeTab === "interviews"
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                >
                  <FaCalendarAlt
                    className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                      activeTab === "interviews" ? "text-blue-600" : ""
                    }`}
                  />
                  Interviews
                </button>
              </li>
              <li className="me-2">
                <button
                  onClick={() => setActiveTab("meetings")}
                  className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
                    activeTab === "meetings"
                      ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                >
                  <MdMeetingRoom
                    className={`w-4 h-4 me-2 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300 ${
                      activeTab === "meetings" ? "text-blue-600" : ""
                    }`}
                  />
                  Meetings
                </button>
              </li>
            </ul>
          </div>
          <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
            {activeTab === "profile" && (
              <Suspense fallback={<RolesCard userData={[]} />}>
                {!loadingUserData ? (
                  <RolesCard userData={userData} />
                ) : (
                  <div>Loading Profile...</div>
                )}
              </Suspense>
            )}
            {activeTab === "connections" && (
              <Suspense
                fallback={
                  <ConnectionsCard
                    users={[]}
                    connections={[]}
                    connectionsReceived={[]}
                    connectionsSent={[]}
                    sendConnectionRequest={sendConnectionRequest}
                    pendingRequests={pendingRequests}
                    acceptConnectionRequest={acceptConnectionRequest}
                    rejectionConnectionRequest={rejectConnectionRequest}
                  />
                }
              >
                <ConnectionsCard
                  users={users}
                  connections={connections}
                  connectionsReceived={connectionsReceived}
                  connectionsSent={connectionsSent}
                  sendConnectionRequest={sendConnectionRequest}
                  pendingRequests={pendingRequests}
                  acceptConnectionRequest={acceptConnectionRequest}
                  rejectionConnectionRequest={rejectConnectionRequest}
                />
              </Suspense>
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default Profile;