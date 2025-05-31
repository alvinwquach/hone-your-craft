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
    className={`bg-neutral-900 border border-zinc-700 motion-safe:animate-pulse rounded ${className}`}
    style={{ backgroundColor: "transparent" }}
  />
);

const EventSkeleton = () => (
  <div className="transition-all duration-200 bg-neutral-800 border border-zinc-700">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-zinc-600">
      <div className="flex flex-col flex-shrink-0 min-w-[150px]">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex flex-col text-sm text-gray-400 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-600">
        <Skeleton className="w-4 h-4 text-gray-500 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

const DateSectionSkeleton = () => (
  <div className="mb-8">
    <div className="sticky top-0 z-10 pb-2 mb-4 border-b border-zinc-600">
      <Skeleton className="h-8 w-1/3 mx-4" />
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

  useEffect(() => {
    setIsLoading(false);
  }, [groupedUpcomingEvents, groupedPastEvents]);

  const MeetingCard = ({ event }: { event: Event }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="transition-all duration-200 bg-neutral-800 border border-zinc-700  rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4">
          <div className="flex flex-col flex-shrink-0">
            <h3 className="text-lg text-white font-semibold tracking-tight">
              {event.title}
            </h3>
            <div className="pb-2">
              <div className="text-sm text-gray-400 mb-2 font-medium">
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
              <p className="text-sm text-gray-400 line-clamp-2">
                {event.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-start text-sm text-gray-400">
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
            className="bg-white flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors border border-zinc-600"
          >
            <FaChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? "rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">Details</span>
          </button>
        </div>
        {expanded && (
          <div className="mt-4 p-4 border-t border-zinc-600">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">
                  <span className="whitespace-nowrap">
                    Host: {event.creator.name || "Unknown"}
                  </span>
                  {activeTab === "upcoming" && (
                    <span className="text-gray-500 ml-1 whitespace-nowrap">
                      ({event.creator.email || "Unknown"})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  <span className="whitespace-nowrap">
                    Invitee: {event.participant.name || "Unknown"}
                  </span>
                  {activeTab === "upcoming" && (
                    <span className="text-gray-500 ml-1 whitespace-nowrap">
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
                  className="flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-colors border border-zinc-600"
                >
                  <MdRefresh className="w-5 h-5 text-gray-400" />
                  <span className="hidden md:inline-block text-sm whitespace-nowrap ml-2">
                    Reschedule
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEvent(event.id);
                  }}
                  className="flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-700 hover:bg-zinc-600 text-white transition-colors border border-zinc-600"
                >
                  <FaTrash className="w-5 h-5 text-gray-400" />
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
      <div className="rounded-xl shadow-lg overflow-hidden bg-neutral-900 border border-zinc-700">
        <div className="border-b border-zinc-600">
          <div className="flex flex-wrap -mb-px justify-start px-4 py-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg hover:text-white hover:border-blue-500 dark:hover:text-white dark:hover:border-blue-500 ${
                activeTab === "upcoming"
                  ? "text-white border-blue-500"
                  : "text-gray-400"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`inline-flex items-center p-4 border-b-2 rounded-t-lg hover:text-white hover:border-blue-500 dark:hover:text-white dark:hover:border-blue-500 ${
                activeTab === "past"
                  ? "text-white border-blue-500"
                  : "text-gray-400"
              }`}
            >
              Past
            </button>
          </div>
        </div>
        <div className="p-6">
          {isLoading && <DateSectionSkeleton />}
          {!isLoading && (
            <>
              {activeTab === "upcoming" &&
                Object.keys(groupedUpcomingEvents).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <p>No upcoming meetings found</p>
                  </div>
                )}
              {activeTab === "past" &&
                Object.keys(groupedPastEvents).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <svg
                      className="w-12 h-12 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7v16l11-8-11-8v16zm2-8l10 10M9 3L1 9l8 8"
                      />
                    </svg>
                    <p>No past meetings found</p>
                  </div>
                )}
              {activeTab === "upcoming" &&
                Object.entries(groupedUpcomingEvents).map(([date, events]) => (
                  <div key={date} className="mb-8 last:mb-0">
                    <div className="sticky top-0 z-10 pb-2 mb-4 border-b border-zinc-600">
                      <h2 className="text-xl font-semibold text-white px-4 mb-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
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
                    <div className="sticky top-0 z-10 pb-2 mb-4 border-b border-zinc-600">
                      <h2 className="text-xl font-semibold text-white px-4 mb-2">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <MeetingCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
