import { getUpcomingInterviews } from "@/app/actions/getUpcomingInterviews";
import { getInterviewConversionRate } from "@/app/actions/getInterviewConversionRate";
import InterviewCalendarDownloadButton from "@/app/components/profile/interviews/InterviewCalendarDownloadButton";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";
import InterviewsList from "@/app/components/profile/interviews/InterviewsList";

export default async function Interviews() {
  const upcomingInterviews = await getUpcomingInterviews();
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
        <InterviewsList
          upcomingInterviews={upcomingInterviews}
          conversionRate={conversionRate}
        />
      </div>
    </section>
  );
}
