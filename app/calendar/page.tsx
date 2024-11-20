"use client";

import axios from "axios";
import { Interview } from "@prisma/client";
import { candidateInterviewTypes } from "@/app/lib/candidateInterviewTypes";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";
import DeleteInterviewContext from "../../context/DeleteInterviewContext";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import useSWR, { mutate } from "swr";
import { Suspense } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

const fetcher = async (url: string, ...args: any[]) => {
  const response = await fetch(url, ...args);
  return response.json();
};

function Calendar() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;

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
        {userRole === "CANDIDATE" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 pr-4 mt-4 sm:mt-6 md:mt-0">
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
            <div className="w-full md:w-1/5 mt-4 sm:mt-6 md:mt-0 pr-0 md:pr-4">
              <Legend interviewTypes={clientInterviewTypes} />
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
        ) : null}
      </div>
    </DeleteInterviewContext.Provider>
  );
}

export default Calendar;
