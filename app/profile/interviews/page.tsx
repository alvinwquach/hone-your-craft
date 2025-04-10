import InterviewCalendarDownloadButton from "@/app/components/profile/interviews/InterviewCalendarDownloadButton";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import {
  getUpcomingInterviews,
  InterviewWithJob,
} from "@/app/actions/getUpcomingInterviews";
import { getInterviewConversionRate } from "@/app/actions/getInterviewConversionRate";
import { FaCalendarDay } from "react-icons/fa";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

interface InterviewGroup {
  [date: string]: InterviewWithJob[];
}

export default async function Interviews() {
  const upcomingInterviews: InterviewGroup = await getUpcomingInterviews();
  const conversionRate = await getInterviewConversionRate();

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <ProfileNavigation />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sr-only">
            Upcoming Interviews
          </h1>
        </div>
        <div className="flex justify-end mb-4">
          {Object.entries(upcomingInterviews).length > 0 && (
            <InterviewCalendarDownloadButton />
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-600 text-center">
              {conversionRate.message}
            </p>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto mt-6">
          {Object.entries(upcomingInterviews).length > 0 ? (
            Object.entries(upcomingInterviews).map(([date, interviews]) => (
              <div key={date} className="w-full">
                <h2 className="text-lg font-semibold text-gray-900 my-4">
                  {date === "No Date"
                    ? "No Date Specified"
                    : new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                </h2>
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="relative p-4 mb-4 rounded-lg border border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex items-center flex-shrink-0 mb-4 md:mb-0">
                        <span className="text-sm text-gray-700">
                          {interview.interviewDate
                            ? format(
                                new Date(interview.interviewDate),
                                "MM/dd/yy @ h:mm a"
                              )
                            : "Date TBD"}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {convertToSentenceCase(interview.job.title)}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {interview.job.company}
                        </p>
                        <p className="text-sm text-gray-700 mt-1 capitalize">
                          {convertToSentenceCase(interview.interviewType)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)] space-y-6">
              <div className="w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center">
                <FaCalendarDay className="w-24 h-24 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                No Upcoming Interviews
              </h2>
              <p className="text-gray-600 text-center max-w-md">
                You don&apos;t have any scheduled interviews at the moment.
                Start by applying to jobs or responding to interview
                invitations.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}