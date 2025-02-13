"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import { Calendar, DateObject } from "react-multi-date-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

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

interface SchedulePageProps {
  params: {
    id: string;
  };
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .email("Please enter a valid email")
    .min(1, "Email is required"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function SchedulePage({ params }: SchedulePageProps) {
  const { id } = params;
  const router = useRouter();

  const {
    data: event,
    error,
    isLoading,
  } = useSWR<Event | null>(id ? `/api/event-type/${id}` : null, fetcher);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { data: session, status } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

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
        const formattedStart = format(current, "hh:mm a").toLowerCase();
        slots.push(formattedStart);
      }
      current = new Date(nextSlot);
    }
    return slots;
  };

  const handleNextButtonClick = () => {
    if (selectedTime) {
      setIsFormVisible(true);
    }
  };

  const onSubmit = (data: FormData) => {
    const meetingTime =
      selectedDate && selectedTime
        ? generateMeetingTime(selectedDate, selectedTime, event?.length || 30)
        : null;

    const formattedMeetingTime = meetingTime
      ? `${format(new Date(meetingTime[0].start), "hh:mm a")} - ${format(
          new Date(meetingTime[0].end),
          "hh:mm a"
        )}, ${format(selectedDate!, "EEEE, MMMM d, yyyy")}`
      : "Select a time slot";

    const queryParams = new URLSearchParams({
      name: data.name,
      email: data.email,
      meetingTime: formattedMeetingTime,
    });

    router.push(`/schedule/confirmation?${queryParams.toString()}`);

    toast.success("Event scheduled successfully!");
    reset();
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

  const selectedTimeSlot =
    selectedTime && timeSlots.find((time) => time === selectedTime);

  const generateMeetingTime = (
    selectedDate: Date,
    selectedTime: string,
    meetingLength: number
  ): { start: string; end: string }[] => {
    const [hour, minute, ampm] = selectedTime.split(/[: ]/);
    let hours = parseInt(hour, 10);
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;

    const meetingStart = new Date(selectedDate);
    meetingStart.setHours(hours, parseInt(minute, 10), 0, 0);

    const meetingEnd = new Date(meetingStart);
    meetingEnd.setMinutes(meetingEnd.getMinutes() + meetingLength);

    return [
      {
        start: meetingStart.toISOString(),
        end: meetingEnd.toISOString(),
      },
    ];
  };

  const meetingTime =
    selectedDate && selectedTime
      ? generateMeetingTime(selectedDate, selectedTime, event?.length || 30)
      : null;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-start justify-between p-6 border-b">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src={session?.user?.image as string}
                alt={session?.user?.name as string}
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl text-gray-900 font-bold">
                  {session?.user?.name}
                </h2>
                <p className="text-sm text-gray-600">{event.title}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <Calendar
                  className="w-full max-w-lg"
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
                      className: isAvailable
                        ? "bg-blue-200 cursor-pointer"
                        : "bg-white cursor-not-allowed",
                      children: date.day,
                      disabled: !isAvailable,
                    };
                  }}
                />
              </div>
              <div className="w-full">
                <h3 className="text-center text-gray-900 text-lg mb-3">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d, yyyy")
                    : "Select a Date"}
                </h3>
                <ul className="flex flex-col space-y-3">
                  {timeSlots.map((time, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <button
                        onClick={() => setSelectedTime(time)}
                        className={`w-full py-2 px-4 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-300 ${
                          selectedTime === time ? "bg-gray-600 text-white" : ""
                        }`}
                      >
                        {time}
                      </button>
                      {selectedTime === time && (
                        <button
                          onClick={handleNextButtonClick}
                          className="w-1/2 py-2 px-4 text-sm text-white bg-blue-600 rounded-md ml-2 transition-all duration-300"
                        >
                          Next
                        </button>
                      )}
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
          {isFormVisible && (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col justify-center items-start space-y-6">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={session?.user?.image as string}
                      alt={session?.user?.name as string}
                      width={56}
                      height={56}
                      className="rounded-full w-14 h-14 object-cover shadow-md"
                    />
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {session?.user?.name}
                      </h2>
                      <p className="text-sm text-gray-600">{event.title}</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <FaClock className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatEventLength(event.length)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <FaCalendarAlt className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {meetingTime
                          ? `${format(
                              new Date(meetingTime[0].start),
                              "hh:mm a"
                            )} - ${format(
                              new Date(meetingTime[0].end),
                              "hh:mm a"
                            )}, ${format(selectedDate!, "EEEE, MMMM d, yyyy")}`
                          : "Select a time slot"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    Enter Details
                  </h3>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className="text-black w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className="text-black w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Please share anything that will help prepare for your
                        meeting
                      </label>
                      <textarea
                        id="message"
                        {...register("message")}
                        rows={4}
                        className="text-black w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors duration-200"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 px-6 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Schedule Event
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
