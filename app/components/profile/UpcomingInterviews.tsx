import React from "react";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";

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
}

function UpcomingInterviews({ jobInterviews }: UpcomingInterviewsProps) {
  // Filter interviews within the next week
  const upcomingInterviews = jobInterviews.filter((interview) => {
    const interviewDate = new Date(interview.interviewDate);
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return interviewDate >= today && interviewDate <= oneWeekFromNow;
  });

  // Sort the interviews in ascending order based on interview date
  upcomingInterviews.sort((a, b) => {
    return (
      new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
    );
  });

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-400">
        <thead className="text-xs  uppercase  bg-gray-900 text-gray-400">
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
              className=" border-b bg-gray-800 border-gray-700"
            >
              <td className="px-6 py-4">
                {/* Format the date with last two digits of year */}
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
