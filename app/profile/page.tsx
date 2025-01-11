"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import getUserJobPostings from "../actions/getUserJobPostings";
import { getUserJobSkillsAndFrequency } from "@/app/actions/getUserJobSkillsAndFrequency";
import { getUserMissingSkillsAndFrequency } from "@/app/actions/getUserMissingSkillsAndFrequency";
import { getJobsByApplicationStatus } from "@/app/actions/getJobsByApplicationStatus";
import { getCandidateJobInterviews } from "@/app/actions/getCandidateJobInterviews";
import { getUserJobPostingSourceCount } from "@/app/actions/getUserJobPostingSourceCount";
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
import UpcomingInterviews from "../components/profile/interviews/UpcomingInterviews";
import JobOffers from "../components/profile/offers/JobOffers";
import JobRejections from "../components/profile/rejections/JobRejections";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaCalendarAlt,
  FaMoneyCheckAlt,
  FaFileAlt,
  FaBan,
  FaTools,
  FaAward,
  FaUserTie,
} from "react-icons/fa";
import { SiBaremetrics } from "react-icons/si";
import RolesCard from "../components/profile/profile/RolesCard";
import { GiThreeFriends } from "react-icons/gi";
import ConnectionsCard from "../components/profile/connections/ConnectionsCard";
import { GoGoal } from "react-icons/go";
import GoalForm from "../components/profile/goal/GoalForm";
import { BsBriefcase } from "react-icons/bs";

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

function Profile() {
  const { data: session } = useSession();
  const { data, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" }),
    { refreshInterval: 1000 }
  );
  const { data: userInterviews, isLoading: userInterviewsLoading } = useSWR(
    "/api/interviews",
    (url) => fetch(url).then((res) => res.json())
  );
  const { data: userOffers, isLoading: userOffersLoading } = useSWR(
    "/api/offers",
    (url) => fetch(url).then((res) => res.json())
  );
  const { data: userRejections, isLoading: userRejectionsLoading } = useSWR(
    "/api/rejections",
    (url) => fetch(url).then((res) => res.json())
  );
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

  const { data: currentGoalData } = useSWR(
    "/api/weekly-application-goal",
    (url) => fetch(url).then((res) => res.json())
  );

  const { data: weeklyApplicationDayTrackerData } = useSWR(
    "/api/weekly-application-day-tracker",
    (url) => fetch(url).then((res) => res.json())
  );

  const { data: weeklyApplicationGoalTrackerData } = useSWR(
    "/api/weekly-application-goal-tracker",
    (url) => fetch(url).then((res) => res.json())
  );

  const { data: monthlyInterviewGoalTrackerData } = useSWR(
    "/api/monthly-interview-goal-tracker",
    (url) => fetch(url).then((res) => res.json())
  );

  const { data: userAchievementData } = useSWR("/api/achievements", (url) =>
    fetch(url).then((res) => res.json())
  );

  const achievements = userAchievementData?.allAchievements || [];

  const userRole = data?.user?.userRole;
  const jobOffers = userOffers || [];
  const jobRejections = userRejections || [];
  const jobInterviews = userInterviews || [];
  const userSkills = data?.user?.skills || [];
  const userData = data || [];

  const [activeTab, setActiveTab] = useState<string>("profile");
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
          await getUserMissingSkillsAndFrequency(currentPageMissingSkills);
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
        const { interviewTypeFrequency } = await getCandidateJobInterviews();
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
        const sourceCount = await getUserJobPostingSourceCount();
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

  const handleEditOffer = async (id: string, updatedSalary: string) => {
    try {
      const currentOffer = jobOffers.find((offer: any) => offer.id === id);
      const response = await fetch(`/api/offer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salary: updatedSalary,
          offerDate: currentOffer?.offerDate,
          offerDeadline: currentOffer?.offerDeadline,
        }),
      });

      if (response.ok) {
        mutate("/api/offers");
        toast.success("Offer Updated");
      } else {
        throw new Error("Failed to update offer");
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Failed To Update Offer");
      throw error;
    }
  };

  const handleEditRejection = async (id: string, updatedNotes: string) => {
    try {
      const currentRejection = jobRejections.find(
        (rejection: any) => rejection.id === id
      );
      const response = await fetch(`/api/rejection/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: updatedNotes,
          date: currentRejection?.date,
          initiatedBy: currentRejection?.initiatedBy,
        }),
      });

      if (response.ok) {
        mutate("/api/rejections");
        toast.success("Rejection Updated");
      } else {
        throw new Error("Failed to update rejection");
      }
    } catch (error) {
      console.error("Error updating rejection:", error);
      toast.error("Failed To Update Rejection");
      throw error;
    }
  };

  const handleDeleteRejection = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rejection?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/rejection/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        mutate("/api/rejections");
        toast.success("Rejection Deleted");
      } else {
        throw new Error("Failed to delete rejection");
      }
    } catch (error) {
      console.error("Error deleting rejection:", error);
      toast.error("Failed To Delete Rejection");
      throw error;
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?"
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/offer/${offerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        mutate("/api/offers");
        toast.success("Offer Deleted");
      } else {
        throw new Error("Failed to delete offer");
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed To Delete Offer");
      throw error;
    }
  };

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
  const loadingUserInterviews = !userInterviews || userInterviewsLoading;
  const loadingUserOffers = !userOffers || userOffersLoading;
  const loadingUserRejections = !userRejections || userRejectionsLoading;
  const loadingUserSkills = !userSkills || userDataLoading;

  interface Achievement {
    id: string;
    description: string;
  }

  interface AchievementCardProps {
    achievement: Achievement;
  }

  function AchievementCard({ achievement }: AchievementCardProps) {
    const jobsApplied = achievement.description.match(/applying to (\d+) jobs/);
    const numberJobs = jobsApplied ? parseInt(jobsApplied[1], 10) : null;

    const interviewsAttended = achievement.description.match(
      /attending (\d+) interviews/
    );
    const numberInterviews = interviewsAttended
      ? parseInt(interviewsAttended[1], 10)
      : null;

    const dateParts = achievement.description.split(/ on | by /);
    const dateStr = dateParts.length > 1 ? dateParts[1] : null;

    const year = dateStr ? dateStr.split("/")[2] : "Unknown";

    const isJobAchievement = numberJobs !== null;
    const icon = isJobAchievement ? (
      <BsBriefcase className="w-8 h-8 text-white" />
    ) : (
      <FaUserTie className="w-8 h-8 text-white" />
    );

    const descriptionText = isJobAchievement
      ? achievement.description.split(" on ")[0]
      : achievement.description.split(" by ")[0];

    return (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative bg-zinc-800 border border-blue-500 rounded-full h-28 w-28 flex items-center justify-center mb-2">
          {icon}
          <div className="absolute top-10 right-2 rounded-full text-white text-xs font-bold w-6 h-6 flex items-center justify-center">
            {isJobAchievement ? numberJobs : numberInterviews}
          </div>
          <div className="absolute bottom-4 left-10 right-0 text-white text-xs font-bold">
            {year}
          </div>
        </div>
        <h3 className="text-lg font-bold text-center">{descriptionText} by</h3>
        <p className="text-xs text-gray-500 text-center">{dateStr}</p>
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
                  <h2 className="text-2xl font-bold mb-4">Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map(
                      (achievement: Achievement, index: number) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
              {activeTab === "goal" && (
                <GoalForm
                  currentGoalData={currentGoalData}
                  weeklyApplicationDayTrackerData={
                    weeklyApplicationDayTrackerData
                  }
                  weeklyApplicationGoalTrackerData={
                    weeklyApplicationGoalTrackerData
                  }
                  monthlyInterviewGoalTrackerData={
                    monthlyInterviewGoalTrackerData
                  }
                />
              )}
              {activeTab === "resume" && (
                <Suspense fallback={<ResumeUpload />}>
                  <ResumeUpload />
                </Suspense>
              )}
              {activeTab === "interviews" && (
                <Suspense fallback={<UpcomingInterviews jobInterviews={[]} />}>
                  {!loadingUserInterviews ? (
                    <UpcomingInterviews jobInterviews={jobInterviews} />
                  ) : (
                    <div>Loading Interviews...</div>
                  )}
                </Suspense>
              )}
              {activeTab === "offers" && (
                <Suspense
                  fallback={
                    <JobOffers
                      jobOffers={[]}
                      onEditOffer={handleEditOffer}
                      onDeleteOffer={handleDeleteOffer}
                    />
                  }
                >
                  {!loadingUserOffers ? (
                    <JobOffers
                      jobOffers={jobOffers}
                      onEditOffer={handleEditOffer}
                      onDeleteOffer={handleDeleteOffer}
                    />
                  ) : (
                    <div>Loading Offers...</div>
                  )}
                </Suspense>
              )}
              {activeTab === "rejections" && (
                <Suspense
                  fallback={
                    <JobRejections
                      jobRejections={[]}
                      onEditRejection={handleEditRejection}
                      onDeleteRejection={handleDeleteRejection}
                    />
                  }
                >
                  {!loadingUserRejections ? (
                    <JobRejections
                      jobRejections={jobRejections}
                      onEditRejection={handleEditRejection}
                      onDeleteRejection={handleDeleteRejection}
                    />
                  ) : (
                    <div>Loading Rejections...</div>
                  )}
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
            </ul>
          </div>
          {activeTab === "profile" && (
            <Suspense fallback={<RolesCard userData={[]} />}>
              {!loadingUserData ? (
                <div className="mt-6 bg-zinc-900 border-gray-700 rounded-lg">
                  <RolesCard userData={userData} />
                </div>
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
        </section>
      ) : null}
    </section>
  );
}

export default Profile;