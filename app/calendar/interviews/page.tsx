import { Suspense } from "react";
import InterviewCalendar from "@/app/components/calendar/InterviewCalendar";
import { getEvents } from "@/app/actions/getEvents";
import { getInterviews } from "@/app/actions/getInterviews";

export default async function InterviewCalendarPage() {
  const interviews = await getInterviews();
  const events = await getEvents();

  return (
    <Suspense fallback={<InterviewCalendar interviews={[]} events={[]} />}>
      <InterviewCalendar interviews={interviews} events={events} />
    </Suspense>
  );
}
