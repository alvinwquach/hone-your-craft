"use client";
import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import { Calendar, DateObject } from "react-multi-date-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type Day = (typeof DAYS)[number];

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
    weekly: Record<Day, BookingTime[]>;
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

interface BookingPageProps {
  params: {
    id: string;
  };
}

function BookingPage({ params }: BookingPageProps) {
  const { id } = params;
  const {
    data: event,
    error,
    isLoading,
  } = useSWR<Event | null>(id ? `/api/event-type/${id}` : null, fetcher);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: session, status } = useSession();

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

  const findAvailabilityForDate = (date: Date): BookingTime[] => {
    if (!event) return [];

    const dayOfWeek = format(date, "EEE").toLowerCase() as Day;

    const specific = event.bookingTimes.dateSpecific.find((item) =>
      isSameDay(parseISO(item.startTime), date)
    );
    if (specific) return [{ start: specific.startTime, end: specific.endTime }];

    return event.bookingTimes.weekly[dayOfWeek] || [];
  };

  const generateTimeSlots = (
    timeRange: BookingTime,
    meetingLength: number
  ): string[] => {
    const start = parseISO(timeRange.start);
    const end = parseISO(timeRange.end);
    const slots = [];
    let current = start;
    while (current < end) {
      const nextSlot = new Date(current);
      nextSlot.setMinutes(nextSlot.getMinutes() + meetingLength);
      if (nextSlot <= end) {
        slots.push(format(current, "hh:mm a"));
      }
      current = new Date(nextSlot);
    }
    return slots;
  };

  if (isLoading) {
    return <div>Loading event details...</div>;
  }

  if (error) {
    toast.error("Failed to fetch event details");
    return <div>Error loading event details</div>;
  }

  if (!event) {
    return <div>Event not found!</div>;
  }

  if (status === "loading") {
    return <div>Loading user session...</div>;
  }

  if (!session) {
    return <div>Please sign in to access this page.</div>;
  }

  const availableTimes = selectedDate
    ? findAvailabilityForDate(selectedDate)
    : [];

  const timeSlots = availableTimes.flatMap((timeRange) =>
    generateTimeSlots(
      { start: timeRange.start, end: timeRange.end },
      event.length
    )
  );

  return (
    <div className="max-w-screen-xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen bg-white">
      <div className="flex flex-col md:flex-row items-start justify-center">
        <div className="w-full md:w-1/3 p-6 border rounded-lg bg-white shadow-lg mb-4 md:mb-0 md:mr-4">
          <div className="flex items-center mb-4">
            <Image
              src={session?.user?.image as string}
              alt={session?.user?.name as string}
              width={48}
              height={48}
              className="rounded-full mr-3"
            />
            <div>
              <h2 className="text-xl text-gray-900 font-bold">
                {session?.user?.name}
              </h2>
            </div>
          </div>
          <h2 className="text-xl text-gray-900 font-bold mb-2">
            {event.title}
          </h2>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center">
              <span className="text-gray-900 text-base font-medium">
                {formatEventLength(event.length)}
              </span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/3 p-6 border rounded-lg bg-white shadow-lg mb-4 md:mb-0 flex justify-center">
          <Calendar
            className="w-full max-w-sm"
            value={selectedDate ? new DateObject(selectedDate) : null}
            onChange={(newDate) =>
              setSelectedDate(newDate ? newDate.toDate() : null)
            }
            minDate={new Date()}
            mapDays={({ date }) => {
              const isAvailable =
                event.bookingTimes.dateSpecific.some((item) =>
                  isSameDay(parseISO(item.startTime), date.toDate())
                ) ||
                event.bookingTimes.weekly[
                  format(date.toDate(), "EEE").toLowerCase() as Day
                ].length > 0;
              return {
                className: isAvailable ? "bg-blue-200" : "bg-white",
                children: date.day,
              };
            }}
          />
        </div>
        <div className="w-full md:w-1/3 p-6 border rounded-lg bg-white shadow-lg mt-4 md:mt-0 md:ml-4">
          <h3 className="text-gray-900 text-base font-medium mb-3 text-center">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d, yyyy")
              : "Select a Date"}
          </h3>
          <div>
            <button
              type="button"
              className="inline-flex items-center w-full py-2 px-5 justify-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
            >
              Pick a Time
            </button>
            <ul className="grid w-full grid-cols-2 gap-2 mt-5">
              {timeSlots.map((time, index) => (
                <li key={index}>
                  <input
                    type="radio"
                    id={`time-${index}`}
                    value={time}
                    className="hidden peer"
                    name="timetable"
                  />
                  <label
                    htmlFor={`time-${index}`}
                    className="inline-flex items-center justify-center w-full p-2 text-sm font-medium text-center bg-white border rounded-lg cursor-pointer text-blue-600 border-blue-600 hover:text-white hover:bg-blue-500 peer-checked:bg-blue-600 peer-checked:text-white"
                  >
                    {time}
                  </label>
                </li>
              ))}
            </ul>
            {timeSlots.length === 0 && (
              <p className="text-center text-gray-500">
                No availability on this date
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
