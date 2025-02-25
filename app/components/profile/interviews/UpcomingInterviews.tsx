import React from "react";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import InterviewCalendarDownloadButton from "./InterviewCalendarDownloadButton";

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
  const upcomingInterviews = jobInterviews.filter((interview) => {
    const interviewDate = new Date(interview.interviewDate);
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return interviewDate >= today && interviewDate <= oneWeekFromNow;
  });

  upcomingInterviews.sort((a, b) => {
    return (
      new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
    );
  });

  if (upcomingInterviews.length === 0) {
    return (
      <div className="relative overflow-x-auto">
        <div className="mt-4">
          <InterviewCalendarDownloadButton />
        </div>
        <div className="p-4 text-center">{interviewConversionRate}</div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-200">
          <thead className="text-xs uppercase bg-zinc-900 text-gray-200">
            <tr>
              <th scope="col" className="px-6 py-3">
                Interview Date
              </th>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3">
                Interview Type
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-zinc-700 border-gray-700">
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-200">
        <thead className="text-xs uppercase bg-zinc-900 text-gray-200">
          <tr>
            <th scope="col" className="px-6 py-3">
              Interview Date
            </th>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Job Title
            </th>
            <th scope="col" className="px-6 py-3">
              Interview Type
            </th>
          </tr>
        </thead>
        <tbody>
          {upcomingInterviews.map((interview) => (
            <tr
              key={interview.id}
              className="border-b bg-zinc-700 border-gray-700"
            >
              <td className="px-6 py-4">
                <span className="md:hidden">
                  {format(new Date(interview.interviewDate), "MM/dd/yy h:mm a")}
                </span>
                <span className="hidden md:inline">
                  {format(
                    new Date(interview.interviewDate),
                    "MM/dd/yy @ h:mm a"
                  )}
                </span>
              </td>
              <td className="px-6 py-4">{interview.job.company}</td>
              <td className="px-6 py-4">{interview.job.title}</td>
              <td className="px-6 py-4">
                {convertToSentenceCase(interview.interviewType)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UpcomingInterviews;
