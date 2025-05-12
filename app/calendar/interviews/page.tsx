import { Suspense } from "react";
import Legend from "@/app/components/calendar/Legend";
import InterviewCalendar from "@/app/components/calendar/InterviewCalendar";
import CalendarTabs from "@/app/components/calendar/CalendarTabs";
import { getEvents } from "@/app/actions/getEvents";
import { getInterviews } from "@/app/actions/getInterviews";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";

export default async function InterviewCalendarPage() {
  const interviews = await getInterviews();
  const events = await getEvents();

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <Suspense fallback={<InterviewCalendar interviews={[]} events={[]} />}>
        <CalendarTabs />
        <InterviewCalendar interviews={interviews} events={events} />
        <Legend interviewTypes={clientInterviewTypes} />
      </Suspense>
    </div>
  );
}
