import { Suspense } from "react";
import InterviewCalendar from "@/app/components/calendar/InterviewCalendar";
import AvailabilityCalendar from "@/app/components/calendar/AvailabilityCalendar";
import Legend from "@/app/components/calendar/Legend";
import EventTypesSection from "@/app/components/calendar/EventTypesSection";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";
import Link from "next/link";
import { FaLink, FaCalendarCheck, FaCalendarPlus } from "react-icons/fa";
import { getEvents } from "../actions/getEvents";
import { getEventTypes } from "../actions/getEventTypes";
import { getInterviewAvailability } from "../actions/getInterviewAvailability";
import { getInterviews } from "../actions/getInterviews";
import SidesheetWrapper from "../components/calendar/SidesheetWrapper";

export default async function Calendar({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const activeTab =
    (searchParams.tab as "interviews" | "availability" | "eventTypes") ||
    "interviews";
  const interviews = await getInterviews();
  const interviewAvailability = await getInterviewAvailability();
  const { eventTypes } = await getEventTypes();
  const events = await getEvents();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <div className="flex flex-wrap">
        <div className="w-full md:w-1/5 my-4 sm:mt-6 md:mt-0 pr-0 md:pr-4">
          <Legend interviewTypes={clientInterviewTypes} />
        </div>
        <div className="w-full md:w-4/5">
          <div className="flex justify-center lg:justify-start mb-4">
            <div className="flex p-2 bg-zinc-900 rounded-lg shadow-lg">
              <Link
                href="?tab=eventTypes"
                className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                  activeTab === "eventTypes"
                    ? "bg-blue-600 text-white font-semibold border-b-4 border-blue-600"
                    : "bg-transparent text-gray-300 cursor-pointer"
                }`}
              >
                <FaLink />
                <span className="text-xs lg:text-sm">Event Types</span>
              </Link>
              <Link
                href="?tab=interviews"
                className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                  activeTab === "interviews"
                    ? "bg-blue-600 text-white font-semibold border-b-2 border-blue-600"
                    : "bg-transparent text-gray-300 cursor-pointer"
                }`}
              >
                <FaCalendarCheck />
                <span className="text-xs lg:text-sm">Meetings</span>
              </Link>
              <Link
                href="?tab=availability"
                className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                  activeTab === "availability"
                    ? "bg-blue-600 text-white font-semibold border-b-4 border-blue-600"
                    : "bg-transparent text-gray-300 cursor-pointer"
                }`}
              >
                <FaCalendarPlus />
                <span className="text-xs lg:text-sm">Availability</span>
              </Link>
            </div>
          </div>
          <div className="relative">
            {activeTab === "eventTypes" && (
              <>
                <SidesheetWrapper />
                <EventTypesSection eventTypes={eventTypes} baseUrl={baseUrl} />
              </>
            )}
            {activeTab === "interviews" && (
              <Suspense
                fallback={<InterviewCalendar interviews={[]} events={[]} />}
              >
                <InterviewCalendar interviews={interviews} events={events} />
              </Suspense>
            )}
            {activeTab === "availability" && (
              <AvailabilityCalendar
                interviewAvailability={interviewAvailability}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
