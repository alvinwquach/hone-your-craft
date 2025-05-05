import { getUpcomingInterviews } from "@/app/actions/getUpcomingInterviews";
import { getInterviewConversionRate } from "@/app/actions/getInterviewConversionRate";
import InterviewCalendarDownloadButton from "@/app/components/profile/interviews/InterviewCalendarDownloadButton";
import InterviewsList from "@/app/components/profile/interviews/InterviewsList";

export default async function Interviews() {
  const upcomingInterviews = await getUpcomingInterviews();
  const conversionRate = await getInterviewConversionRate();

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sr-only">
            Upcoming Interviews
          </h1>
        </div>
        <div className="fixed top-24 right-8 z-10">
          {Object.entries(upcomingInterviews).length > 0 && (
            <InterviewCalendarDownloadButton />
          )}
        </div>
        <InterviewsList
          upcomingInterviews={upcomingInterviews}
          conversionRate={conversionRate}
        />
      </div>
    </section>
  );
}
