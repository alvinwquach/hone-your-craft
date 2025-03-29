"use client";

import { useState } from "react";
import { IoCalendarSharp, IoCalendarClearSharp } from "react-icons/io5";
import { MdRefresh } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { cancelEvent } from "@/app/actions/cancelEvent";
import { rescheduleEvent } from "@/app/actions/rescheduleEvent";
// import { cancelEvent, rescheduleEvent } from "@/app/actions/meetingActions";

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

export default function MeetingTabs({
  groupedUpcomingEvents,
  groupedPastEvents,
}: MeetingTabsProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const router = useRouter();

  const handleRescheduleEvent = async (event: Event) => {
    try {
      // Using existing startTime and endTime as placeholders; adjust if new times are provided elsewhere
      await rescheduleEvent(
        event.id,
        event.startTime.toISOString(),
        event.endTime.toISOString()
      );
      toast.success("Event rescheduled successfully");
      router.refresh();
    } catch (error) {
      console.error("Error rescheduling event:", error);
      toast.error("Failed to reschedule event");
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

  const renderEventCard = (event: Event) => (
    <div
      key={event.id}
      className="relative p-4 mb-4 rounded-lg border border-gray-600 bg-zinc-800 shadow-md hover:shadow-lg transition-shadow"
    >
      {activeTab === "upcoming" && (
        <div className="absolute top-2 right-2 flex flex-col gap-2 md:absolute md:top-2 md:right-2 lg:static lg:self-start lg:mb-4">
          <button
            onClick={() => handleRescheduleEvent(event)}
            className="flex items-center justify-center w-28 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MdRefresh className="w-5 h-5 text-white" />
              <span className="text-xs text-white whitespace-nowrap">
                Reschedule
              </span>
            </div>
          </button>
          <button
            onClick={() => handleCancelEvent(event.id)}
            className="flex items-center justify-center w-28 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FaTrash className="w-5 h-5 text-white" />
              <span className="text-xs text-white whitespace-nowrap">
                Cancel
              </span>
            </div>
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center flex-shrink-0 mb-4 md:mb-0">
          <span className="text-sm text-gray-300 dark:text-gray-400">
            {new Date(event.startTime).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(event.endTime).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex flex-col flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-100">
              {event.title}
            </h3>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-300 mb-2">
            {event.description || "No description provided"}
          </p>
        </div>
        <div className="flex flex-col justify-start text-sm text-gray-400 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span>Host:</span>
            <span className="font-medium">
              {event.creator.name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Invitee:</span>
            <span className="font-medium">
              {event.participant.name || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-700">
        <div className="flex flex-wrap -mb-px justify-start">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
              activeTab === "upcoming" ? "text-blue-600 border-blue-600" : ""
            }`}
          >
            <IoCalendarSharp
              className={`w-4 h-4 me-2 text-gray-400 ${
                activeTab === "upcoming" ? "text-blue-600" : ""
              }`}
            />
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`inline-flex items-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
              activeTab === "past" ? "text-blue-600 border-blue-600" : ""
            }`}
          >
            <IoCalendarClearSharp
              className={`w-4 h-4 me-2 text-gray-400 ${
                activeTab === "past" ? "text-blue-600" : ""
              }`}
            />
            Past
          </button>
        </div>
      </div>
      <div className="mt-6">
        {activeTab === "upcoming" &&
          Object.entries(groupedUpcomingEvents).map(([date, events]) => (
            <div key={date} className="w-full">
              <h2 className="text-lg font-semibold text-gray-100 my-4">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              {events.map(renderEventCard)}
            </div>
          ))}
        {activeTab === "past" &&
          Object.entries(groupedPastEvents).map(([date, events]) => (
            <div key={date} className="w-full">
              <h2 className="text-lg font-semibold text-gray-100 my-4">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              {events.map(renderEventCard)}
            </div>
          ))}
        {Object.keys(groupedUpcomingEvents).length === 0 &&
          Object.keys(groupedPastEvents).length === 0 && (
            <div className="text-gray-400 text-center">No events found</div>
          )}
      </div>
    </div>
  );
}
