"use client";

import { useState, useEffect } from "react";
import { MdRefresh } from "react-icons/md";
import { FaChevronRight, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { cancelEvent } from "@/app/actions/cancelEvent";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  creator: { name: string | null; email: string | null };
  participant: { name: string | null; email: string | null };
  eventType?: { id: string; title: string } | null;
}

interface MeetingTabsProps {
  groupedUpcomingEvents: Record<string, Event[]>;
  groupedPastEvents: Record<string, Event[]>;
}

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`bg-gray-200 motion-safe:animate-pulse rounded ${className}`}
  />
);

const EventSkeleton = () => (
  <div className="bg-white transition-all duration-200">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-gray-50">
      <div className="flex flex-col flex-shrink-0 min-w-[150px]">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex flex-col text-sm text-gray-600 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
        <Skeleton className="w-4 h-4 text-gray-500 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

const DateSectionSkeleton = () => (
  <div className="mb-8">
    <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
      <Skeleton className="h-8 w-1/3 mx-4" />
      <hr className="border-gray-200" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <EventSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default function MeetingTabs({
  groupedUpcomingEvents,
  groupedPastEvents,
}: MeetingTabsProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const totalMeetings = Object.values(groupedUpcomingEvents).reduce(
    (acc, events) => acc + events.length,
    0
  );

  useEffect(() => {
    setIsLoading(totalMeetings === 0);
  }, [groupedUpcomingEvents, groupedPastEvents]);

  const MeetingCard = ({ event }: { event: Event }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="bg-white  transition-all duration-200 ">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-gray-50">
          <div className="flex flex-col flex-shrink-0">
            <div className="text-sm text-gray-600 mb-2 font-medium">
              {new Date(event.startTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(event.endTime).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
            <div className="pb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-start text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Host:</span>
              <span>{event.creator.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Invitee:</span>
              <span>{event.participant.name || "Unknown"}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <FaChevronRight
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                expanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">Details</span>
          </button>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Host: {event.creator.name || "Unknown"}
                  {activeTab === "upcoming" && (
                    <span className="text-gray-500 ml-1">
                      ({event.creator.email || "Unknown"})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Invitee: {event.participant.name || "Unknown"}
                  {activeTab === "upcoming" && (
                    <span className="text-gray-500 ml-1">
                      ({event.participant.email || "Unknown"})
                    </span>
                  )}
                </div>
              </div>
            </div>
            {activeTab === "upcoming" && (
              <div className="mt-4 flex flex-col md:flex-row gap-2 md:gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRescheduleEvent(event.id);
                  }}
                  className="flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-white hover:bg-gray-50 text-gray-900 transition-colors border border-gray-200"
                >
                  <MdRefresh className="w-5 h-5 text-gray-500" />
                  <span className="hidden md:inline-block text-sm whitespace-nowrap ml-2">
                    Reschedule
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEvent(event.id);
                  }}
                  className="flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-white hover:bg-gray-50 text-gray-900 transition-colors border border-gray-200"
                >
                  <FaTrash className="w-5 h-5 text-gray-500" />
                  <span className="hidden md:inline-block text-sm whitespace-nowrap ml-2">
                    Cancel
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleRescheduleEvent = (eventId: string) => {
    const event = groupedUpcomingEvents[
      Object.keys(groupedUpcomingEvents)[0]
    ]?.find((event) => event.id === eventId);
    if (event) {
      const eventTypeId = event.eventType?.id;
      const startTime = event.startTime;
      const endTime = event.endTime;
      if (!eventTypeId) {
        console.error("Event type ID not found for event:", eventId);
        toast.error("Unable to reschedule: Event type not found");
        return;
      }
      router.push(
        `/reschedule/${eventTypeId}?eventId=${eventId}&start=${startTime}&end=${endTime}`
      );
    } else {
      toast.error("Event not found for rescheduling");
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      await cancelEvent(eventId);
      toast.success("Event cancelled successfully");
      router.refresh();
    } catch (error) {
      console.error("Error cancelling event:", error);
      toast.error("Failed to cancel event");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap -mb-px justify-start px-4 py-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg hover:text-gray-900 hover:border-blue-600 dark:hover:text-gray-300 ${
                activeTab === "upcoming" ? "text-blue-600 border-blue-600" : ""
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg hover:text-gray-900 hover:border-blue-600 dark:hover:text-gray-300 ${
                activeTab === "past" ? "text-blue-600 border-blue-600" : ""
              }`}
            >
              Past
            </button>
          </div>
        </div>
        <div className="p-6">
          {isLoading && (
            <>
              {Array.from({ length: totalMeetings }).map((_, index) => (
                <DateSectionSkeleton key={`loading-${index}`} />
              ))}
            </>
          )}
          {!isLoading && (
            <>
              {activeTab === "upcoming" &&
                Object.entries(groupedUpcomingEvents).map(([date, events]) => (
                  <div key={date} className="mb-8 last:mb-0">
                    <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 px-4 mb-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <hr className="border-gray-200" />
                    </div>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <MeetingCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              {activeTab === "past" &&
                Object.entries(groupedPastEvents).map(([date, events]) => (
                  <div key={date} className="mb-8 last:mb-0">
                    <div className="sticky top-0 z-10 bg-white pb-2 mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 px-4 mb-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <hr className="border-gray-200" />
                    </div>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <MeetingCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              {Object.keys(groupedUpcomingEvents).length === 0 &&
                Object.keys(groupedPastEvents).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <svg
                      className="w-12 h-12 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7v16l11-8-11-8v16zm2-8l10 10M9 3L1 9l8 8"
                      />
                    </svg>
                    <p>No meetings found</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}