"use client";

import { Interview } from "@prisma/client";
import { candidateInterviewTypes } from "@/app/lib/candidateInterviewTypes";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";
import DeleteInterviewContext from "../../context/DeleteInterviewContext";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import useSWR, { mutate } from "swr";
import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { FaCalendarCheck, FaCalendarPlus } from "react-icons/fa";
import AvailabilityCalendar from "../components/calendar/AvailabilityCalendar";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

function Calendar() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;
  const [activeTab, setActiveTab] = useState<"interviews" | "availability">(
    "interviews"
  );

  const toggleTab = (tab: "interviews" | "availability") => {
    setActiveTab(tab);
  };

  const {
    data: interviews,
    isLoading: interviewsLoading,
    error,
  } = useSWR<Interview[]>("/api/interviews", fetcher, {
    refreshInterval: 1000,
  });

  const { data: clientAvailability, isLoading: clientAvailabilityLoading } =
    useSWR("/api/client-availability", fetcher);

  const loadingInterviews = !interviews || interviewsLoading;
  if (error) return <div>Error fetching interviews</div>;

  const handleDeleteInterview = async (id: string) => {
    try {
      const response = await fetch(`/api/interview/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }

      mutate("/api/interviews");
      toast.success("Interview Deleted");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed To Delete Interview");
    }
  };

  return (
    <DeleteInterviewContext.Provider value={handleDeleteInterview}>
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        {userRole === "CANDIDATE" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 pr-0 md:pr-4 my-4 sm:mt-6 md:mt-0">
              <Legend interviewTypes={candidateInterviewTypes} />
            </div>

            <div className="w-full md:w-4/5">
              {loadingInterviews ? (
                <div>
                  <Suspense fallback={<InterviewCalendar interviews={[]} />}>
                    <InterviewCalendar interviews={[]} />
                  </Suspense>
                </div>
              ) : (
                <Suspense fallback={<InterviewCalendar interviews={[]} />}>
                  <InterviewCalendar interviews={interviews} />
                </Suspense>
              )}
            </div>
          </div>
        ) : userRole === "CLIENT" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 my-4 sm:mt-6 md:mt-0 pr-0 md:pr-4">
              <Legend interviewTypes={clientInterviewTypes} />
            </div>
            <div className="w-full md:w-4/5">
              <div className="flex justify-start mb-4">
                <div className="flex p-2 bg-zinc-900 rounded-lg shadow-lg">
                  <button
                    onClick={() => toggleTab("interviews")}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      activeTab === "interviews"
                        ? "bg-blue-600 text-white font-semibold border-b-2 border-blue-600"
                        : "bg-transparent text-gray-300 cursor-pointer "
                    }`}
                  >
                    <FaCalendarCheck />
                    <span className="text-sm">Interview View</span>
                  </button>
                  <button
                    onClick={() => toggleTab("availability")}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      activeTab === "availability"
                        ? "bg-blue-600 text-white font-semibold border-b-4 border-blue-600"
                        : "bg-transparent text-gray-300 cursor-pointer "
                    }`}
                  >
                    <FaCalendarPlus />
                    <span className="text-sm">Availability View</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                {activeTab === "interviews" && (
                  <div>
                    {loadingInterviews ? (
                      <Suspense
                        fallback={<InterviewCalendar interviews={[]} />}
                      >
                        <InterviewCalendar interviews={[]} />
                      </Suspense>
                    ) : (
                      <Suspense
                        fallback={<InterviewCalendar interviews={[]} />}
                      >
                        <InterviewCalendar interviews={interviews} />
                      </Suspense>
                    )}
                  </div>
                )}
                {activeTab === "availability" && (
                  <div>
                    <AvailabilityCalendar
                      clientAvailability={clientAvailability}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DeleteInterviewContext.Provider>
  );
}

export default Calendar;
