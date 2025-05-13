import { Suspense } from "react";
import Legend from "@/app/components/calendar/Legend";
import InterviewCalendar from "@/app/components/calendar/InterviewCalendar";
import CalendarTabs from "@/app/components/calendar/CalendarTabs";
import { getEvents } from "@/app/actions/getEvents";
import { getInterviews } from "@/app/actions/getInterviews";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";

function InterviewCalendarSkeleton() {
  return (
    <div className="relative animate-pulse min-h-[600px]">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white p-2 text-center">
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-2 min-h-[100px] flex flex-col space-y-2"
            >
              <div className="h-4 w-8 bg-gray-200 rounded" />
              {Math.random() > 0.6 && (
                <div className="space-y-1">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              )}
              {Math.random() > 0.8 && (
                <div className="space-y-1">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function InterviewCalendarPage() {
  const interviews = await getInterviews();
  const events = await getEvents();

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <Suspense fallback={<InterviewCalendarSkeleton />}>
        <CalendarTabs />
        <InterviewCalendar interviews={interviews} events={events} />
        <Legend interviewTypes={clientInterviewTypes} />
      </Suspense>
    </div>
  );
}