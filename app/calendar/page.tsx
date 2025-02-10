"use client";

import { Interview } from "@prisma/client";
import { candidateInterviewTypes } from "@/app/lib/candidateInterviewTypes";
import { clientInterviewTypes } from "@/app/lib/clientInterviewTypes";
import DeleteInterviewContext from "../../context/DeleteInterviewContext";
import InterviewCalendar from "../components/calendar/InterviewCalendar";
import Legend from "../components/calendar/Legend";
import useSWR, { mutate } from "swr";
import { Suspense, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import {
  FaCalendarCheck,
  FaCalendarPlus,
  FaClipboard,
  FaLink,
  FaPlus,
  FaCog,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import AvailabilityCalendar from "../components/calendar/AvailabilityCalendar";
import { IoCalendarSharp } from "react-icons/io5";
import Sidesheet from "../components/calendar/Sidesheet";
import Link from "next/link";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

type BookingTime = {
  start: string;
  end: string;
};

type Event = {
  id: string;
  userId: string;
  title: string;
  length: number;
  bookingTimes: {
    weekly: {
      mon: BookingTime[];
      tue: BookingTime[];
      wed: BookingTime[];
      thu: BookingTime[];
      fri: BookingTime[];
      sat: BookingTime[];
      sun: BookingTime[];
    };
    dateSpecific: {
      dayOfWeek: string;
      isRecurring: boolean;
      startTime: string;
      endTime: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
};

function Calendar() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;
  const [activeTab, setActiveTab] = useState<
    "interviews" | "availability" | "eventTypes"
  >("interviews");

  const toggleTab = (tab: "interviews" | "availability" | "eventTypes") => {
    setActiveTab(tab);
  };

  const [isSidesheetOpen, setSidesheetOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);

  const toggleSidesheet = () => {
    setSidesheetOpen((prev) => !prev);
  };

  const {
    data: interviews,
    isLoading: interviewsLoading,
    error,
  } = useSWR<Interview[]>("/api/interviews", fetcher, {
    refreshInterval: 1000,
  });

  const { data: clientAvailability, isLoading: clientAvailabilityLoading } =
    useSWR("/api/client-availability", fetcher);

  const { data: eventTypes, isLoading: eventTypesLoading } = useSWR(
    "/api/event-types",
    fetcher,
    { refreshInterval: 1000 }
  );

  const loadingInterviews = !interviews || interviewsLoading;
  if (error) return <div>Error fetching interviews</div>;

  const handleDeleteInterview = async (id: string) => {
    try {
      const response = await fetch(`/api/interview/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete interview");
      }

      mutate("/api/interviews");
      toast.success("Interview Deleted");
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed To Delete Interview");
    }
  };

  const handleDeleteEventType = async (eventId: string) => {
    try {
      const response = await fetch(`/api/event-type/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event type");
      }

      mutate("/api/event-types");
      toast.success("Event Type Deleted");
    } catch (error) {
      console.error("Error deleting event type:", error);
      toast.error("Failed To Delete Event Type");
    }
  };

  const formatEventLength = (length: number) => {
    if (length < 60) {
      return `${length} min`;
    } else {
      const hours = Math.floor(length / 60);
      const minutes = length % 60;
      return `${hours} hr${hours > 1 ? "s" : ""} ${
        minutes !== 0 ? minutes + " min" : ""
      }`;
    }
  };

  return (
    <DeleteInterviewContext.Provider value={handleDeleteInterview}>
      <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
        {userRole === "CANDIDATE" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 pr-0 md:pr-4 my-4 sm:mt-6 md:mt-0">
              <Legend interviewTypes={candidateInterviewTypes} />
            </div>

            <div className="w-full md:w-4/5">
              {loadingInterviews ? (
                <div>
                  <Suspense fallback={<InterviewCalendar interviews={[]} />}>
                    <InterviewCalendar interviews={[]} />
                  </Suspense>
                </div>
              ) : (
                <Suspense fallback={<InterviewCalendar interviews={[]} />}>
                  <InterviewCalendar interviews={interviews} />
                </Suspense>
              )}
            </div>
          </div>
        ) : userRole === "CLIENT" ? (
          <div className="flex flex-wrap">
            <div className="w-full md:w-1/5 my-4 sm:mt-6 md:mt-0 pr-0 md:pr-4">
              <Legend interviewTypes={clientInterviewTypes} />
            </div>
            <div className="w-full md:w-4/5">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="flex p-2 bg-zinc-900 rounded-lg shadow-lg">
                  <button
                    onClick={() => toggleTab("eventTypes")}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      activeTab === "eventTypes"
                        ? "bg-blue-600 text-white font-semibold border-b-4 border-blue-600"
                        : "bg-transparent text-gray-300 cursor-pointer "
                    }`}
                  >
                    <FaLink />
                    <span className="text-xs lg:text-sm">Event Types</span>
                  </button>
                  <button
                    onClick={() => toggleTab("interviews")}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      activeTab === "interviews"
                        ? "bg-blue-600 text-white font-semibold border-b-2 border-blue-600"
                        : "bg-transparent text-gray-300 cursor-pointer "
                    }`}
                  >
                    <FaCalendarCheck />
                    <span className="text-xs lg:text-sm">Meetings</span>
                  </button>
                  <button
                    onClick={() => toggleTab("availability")}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-md ${
                      activeTab === "availability"
                        ? "bg-blue-600 text-white font-semibold border-b-4 border-blue-600"
                        : "bg-transparent text-gray-300 cursor-pointer "
                    }`}
                  >
                    <FaCalendarPlus />
                    <span className="text-xs lg:text-sm">Availability</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                {activeTab === "eventTypes" && (
                  <div className="p-4">
                    <div className="flex flex-col items-center p-4 space-y-4">
                      <IoCalendarSharp className="h-24 w-24 rounded-full p-2 bg-zinc-700 text-white" />
                      <p className="text-gray-400 font-semibold text-xl">
                        Create scheduling links with event types
                      </p>
                      <button
                        className="bg-blue-700 px-4 py-2 rounded-full"
                        onClick={toggleSidesheet}
                      >
                        <FaPlus className="h-4 w-4 inline mr-2 mb-1" />
                        <span className="text-white">New event type</span>
                      </button>
                    </div>
                    {eventTypesLoading ? (
                      <p>Loading event types...</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {eventTypes?.eventTypes.map(
                          (event: Event, index: number) => (
                            <div
                              key={index}
                              className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <div className="flex justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {event.title}
                                </h3>
                                <div className="relative">
                                  <button
                                    className="text-gray-600 hover:text-gray-800"
                                    onClick={() =>
                                      setShowOptionsMenu(
                                        showOptionsMenu === event.id
                                          ? null
                                          : event.id
                                      )
                                    }
                                  >
                                    <FaCog className="w-5 h-5 inline mr-2" />
                                  </button>
                                  {showOptionsMenu === event.id && (
                                    <div className="absolute right-0 w-40 bg-white shadow-md rounded-lg mt-2 py-1">
                                      <button
                                        className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                                        onClick={() =>
                                          toast.info("Edit clicked")
                                        }
                                      >
                                        <FaEdit className="mr-2" />
                                        Edit
                                      </button>
                                      <button
                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                        onClick={() =>
                                          handleDeleteEventType(event.id)
                                        }
                                      >
                                        <FaTrash className="mr-2" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatEventLength(event.length)}, One-on-One
                              </p>

                              <div className="mt-4">
                                <div className="flex justify-between mb-2">
                                  <Link
                                    href={`/schedule/${event.id}`}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    <FaLink className="mr-2" /> View booking
                                    page
                                  </Link>
                                </div>
                                <hr className="my-4 border-t border-gray-300 w-full mx-auto" />
                                <div className="flex justify-between mt-2">
                                  <button
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        `/${event.id}`
                                      );
                                      toast.info("Link copied to clipboard!");
                                    }}
                                  >
                                    <FaClipboard className="mr-2" /> Copy link
                                  </button>

                                  <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                    onClick={() => {
                                      toast.info("Shared!");
                                    }}
                                  >
                                    Share
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
                {isSidesheetOpen && <Sidesheet onClose={toggleSidesheet} />}
                {activeTab === "interviews" && (
                  <div>
                    {loadingInterviews ? (
                      <Suspense
                        fallback={<InterviewCalendar interviews={[]} />}
                      >
                        <InterviewCalendar interviews={[]} />
                      </Suspense>
                    ) : (
                      <Suspense
                        fallback={<InterviewCalendar interviews={[]} />}
                      >
                        <InterviewCalendar interviews={interviews} />
                      </Suspense>
                    )}
                  </div>
                )}
                {activeTab === "availability" && (
                  <div>
                    <AvailabilityCalendar
                      clientAvailability={clientAvailability}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DeleteInterviewContext.Provider>
  );
}

export default Calendar;
