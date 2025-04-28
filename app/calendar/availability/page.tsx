import { Suspense } from "react";
import AvailabilityCalendar from "@/app/components/calendar/AvailabilityCalendar";
import { getInterviewAvailability } from "@/app/actions/getInterviewAvailability";

function AvailabilityCalendarSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <div className="h-8 w-20 bg-gray-200 rounded" />
          <div className="h-8 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="flex space-x-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white p-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-2 min-h-[100px] flex flex-col space-y-1"
            >
              <div className="h-4 w-8 bg-gray-200 rounded" />
              {Math.random() > 0.7 && (
                <div className="h-6 w-full bg-gray-200 rounded" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AvailabilityPage() {
  const interviewAvailability = await getInterviewAvailability();

  return (
    <Suspense fallback={<AvailabilityCalendarSkeleton />}>
      <AvailabilityCalendar interviewAvailability={interviewAvailability} />
    </Suspense>
  );
}
