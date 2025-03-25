import React, { useState } from "react";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import InterviewCalendarDownloadButton from "./InterviewCalendarDownloadButton";
import { FaCalendar } from "react-icons/fa";

interface JobInterview {
  id: string;
  userId: string;
  jobId: string;
  acceptedDate: string;
  interviewDate: string;
  interviewType: string;
  job: {
    title: string;
    company: string;
  };
}

interface UpcomingInterviewsProps {
  jobInterviews: JobInterview[];
  interviewConversionRate: string;
}

function UpcomingInterviews({
  jobInterviews,
  interviewConversionRate,
}: UpcomingInterviewsProps) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingInterviews = jobInterviews
    .filter((interview) => {
      const interviewDate = new Date(interview.interviewDate);
      const today = new Date();
      const oneWeekFromNow = new Date(
        today.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      return interviewDate >= today && interviewDate <= oneWeekFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.interviewDate).getTime() -
        new Date(b.interviewDate).getTime()
    );

  return (
    <div className="container mx-auto p-4">
      <div className="text-center text-gray-400 sm:pb-0 pb-2">
        {interviewConversionRate}
      </div>
      <InterviewCalendarDownloadButton />
      <div className="flex flex-wrap -mb-px justify-start mb-8">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
            activeTab === "upcoming"
              ? "text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500"
              : ""
          }`}
        >
          <FaCalendar
            className={`w-4 h-4 mr-2 text-gray-400 ${
              activeTab === "upcoming" ? "text-blue-600 dark:text-blue-500" : ""
            }`}
          />
          Upcoming Interviews
        </button>
      </div>
      <div className="w-full max-w-3xl mx-auto">
        {activeTab === "upcoming" &&
          (upcomingInterviews.length > 0 ? (
            upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="relative p-4 mb-4 rounded-lg border border-gray-600 bg-zinc-800 shadow-md hover:shadow-lg transition-shadow dark:bg-zinc-700 dark:border-zinc-600"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  {/* Interview Details */}
                  <div className="flex-shrink-0">
                    <span className="text-sm text-gray-300 dark:text-gray-400">
                      {format(
                        new Date(interview.interviewDate),
                        "MM/dd/yy @ h:mm a"
                      )}
                    </span>
                  </div>

                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-100">
                      {convertToSentenceCase(interview.job.title)}
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-300 mt-1">
                      {interview.job.company}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-300 mt-1 capitalize">
                      {convertToSentenceCase(interview.interviewType)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
              No upcoming interviews scheduled
            </div>
          ))}
      </div>
    </div>
  );
}

export default UpcomingInterviews;
