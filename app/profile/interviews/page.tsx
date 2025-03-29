import InterviewCalendarDownloadButton from "@/app/components/profile/interviews/InterviewCalendarDownloadButton";
import { format } from "date-fns";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { InterviewType } from "@prisma/client";
import { getUpcomingInterviews } from "@/app/actions/getUpcomingInterviews";

interface JobInterview {
  id: string;
  userId: string | null;
  jobId: string;
  acceptedDate: Date;
  startTime: Date | null;
  endTime: Date | null;
  interviewDate: Date | null;
  interviewType: InterviewType;
  videoUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  job: {
    title: string;
    company: string;
  };
}

async function groupInterviewsByDate(interviews: JobInterview[]) {
  return interviews.reduce((acc, interview) => {
    const interviewDate = interview.interviewDate
      ? new Date(interview.interviewDate).toLocaleDateString()
      : "No Date";
    if (!acc[interviewDate]) acc[interviewDate] = [];
    acc[interviewDate].push(interview);
    return acc;
  }, {} as Record<string, JobInterview[]>);
}

export default async function Interviews() {
  const upcomingInterviews = await getUpcomingInterviews();
  const groupedUpcomingInterviews = await groupInterviewsByDate(
    upcomingInterviews
  );

  return (
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Upcoming Interviews
          </h1>
          {Object.entries(groupedUpcomingInterviews).length > 0 && (
            <InterviewCalendarDownloadButton />
          )}
        </div>
        <div className="w-full max-w-3xl mx-auto mt-6">
          {Object.entries(groupedUpcomingInterviews).length > 0 ? (
            Object.entries(groupedUpcomingInterviews).map(
              ([date, interviews]) => (
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
              )
            )
          ) : (
            <div className="text-gray-700 text-center p-8">
              No upcoming interviews scheduled
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
