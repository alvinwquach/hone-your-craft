"use client";

import axios from "axios";
import { Interview } from "@prisma/client";
import { interviewTypes } from "@/app/lib/interviewTypes";
import DeleteInterviewContext from "../../context/DeleteInterviewContext";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import useSWR, { mutate } from "swr";
import { Suspense } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { FaTools } from "react-icons/fa";

const fetcher = async (url: string, ...args: any[]) => {
  const response = await fetch(url, ...args);
  return response.json();
};

function Calendar() {
  const { data: session } = useSession();
  const userType = session?.user?.userType;
  const {
    data: interviews,
    isLoading: interviewsLoading,
    error,
  } = useSWR<Interview[]>("/api/interviews", fetcher, {
    refreshInterval: 1000,
  });

  const loadingInterviews = !interviews || interviewsLoading;
  if (error) return <div>Error fetching interviews</div>;

  const handleDeleteInterview = async (id: string) => {
    try {
      await axios.delete(`/api/interview/${id}`);
      mutate("/api/interviews");
      toast.success("Interview Deleted");
      console.log("Interview deleted successfully");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed To Delete Interview");
    }
  };

  return (
    <DeleteInterviewContext.Provider value={handleDeleteInterview}>
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        {userType === "CANDIDATE" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 pr-4">
              <Legend interviewTypes={interviewTypes} />
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
        ) : userType === "CLIENT" ? (
          <section className="flex flex-col items-center justify-center min-h-screen">
            <FaTools className="text-6xl text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              We're Building Something Great!
            </h2>
            <p className="text-center text-gray-500">
              This section is currently in development. We can't wait to share
              it with you! Please check back soon for updates.
            </p>
          </section>
        ) : null}
      </div>
    </DeleteInterviewContext.Provider>
  );
}

export default Calendar;
