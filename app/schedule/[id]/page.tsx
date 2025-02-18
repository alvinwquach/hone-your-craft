"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "react-toastify";
import { Calendar, DateObject } from "react-multi-date-picker";
import { format, isSameDay, parseISO, isToday } from "date-fns";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  createdAt: string;
  updatedAt: string;
  availabilities: Array<{
    id: string;
    userId: string;
    dayOfWeek: string;
    isRecurring: boolean;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
  }>;
  user: {
    name: string;
    image: string;
    email: string;
  };
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
  const { data: session, status } = useSession();

  const {
    data: event,
    error,
    isLoading,
  } = useSWR<Event | null>(id ? `/api/event-type/${id}` : null, fetcher);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

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

    return event.availabilities
      .filter((item) => isSameDay(parseISO(item.startTime), date))
      .map((item) => ({ start: item.startTime, end: item.endTime }));
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
        const formattedStart = format(current, "h:mma").toLowerCase();
        slots.push(formattedStart);
      }
      current = new Date(nextSlot);
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDate && event) {
      const newTimeSlots = findAvailabilityForDate(selectedDate).flatMap(
        (timeRange) =>
          generateTimeSlots(
            { start: timeRange.start, end: timeRange.end },
            event.length
          )
      );
      setTimeSlots(newTimeSlots);
    }
  }, [selectedDate, event, event?.availabilities]);

  const handleNextButtonClick = () => {
    if (selectedTime) {
      setIsFormVisible(true);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (selectedDate && selectedTime && event && session?.user?.userId) {
      const meetingTime = generateMeetingTime(
        selectedDate,
        selectedTime,
        event.length
      );

      const response = await fetch("/api/schedule-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: event.title,
          description: `Meeting scheduled with ${data.name}`,
          startTime: meetingTime[0].start,
          endTime: meetingTime[0].end,
          creatorId: session.user.userId,
          participantId: event.userId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const startTime = format(new Date(meetingTime[0].start), "hh:mm a");
        const endTime = format(new Date(meetingTime[0].end), "hh:mm a");
        const dateStr = format(selectedDate, "EEEE, MMMM d");

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
        toast.success(
          `Event scheduled successfully! Your ${event.title} with ${data.name}is booked for ${startTime} - ${endTime} on ${dateStr}`
        );

        setTimeSlots(timeSlots.filter((time) => time !== selectedTime));
        setSelectedTime(null);
        setSelectedDate(null);
        reset();
        setIsFormVisible(false);

        mutate(`/api/event-type/${id}`);
      } else {
        toast.error(
          result.error || "An error occurred while scheduling the event"
        );
      }
    }
  };

  const generateMeetingTime = (
    selectedDate: Date,
    selectedTime: string,
    meetingLength: number
  ): { start: string; end: string }[] => {
    const match = selectedTime.match(/(\d+):(\d+)([ap]m)/i);
    if (!match) {
      console.error("Invalid time format:", selectedTime);
      throw new Error("Invalid time format");
    }
    const [, hour, minute, ampm] = match;

    let hours = parseInt(hour, 10);
    if (ampm.toLowerCase() === "pm") {
      hours = hours === 12 ? hours : hours + 12;
    } else if (ampm.toLowerCase() === "am" && hours === 12) {
      hours = 0;
    }

    const meetingStart = new Date(selectedDate);
    meetingStart.setHours(hours, parseInt(minute, 10), 0, 0);

    const meetingEnd = new Date(meetingStart);
    meetingEnd.setMinutes(meetingEnd.getMinutes() + meetingLength);

    console.log("Generated meeting start:", meetingStart);
    console.log("Generated meeting end:", meetingEnd);

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

  if (isLoading) {
    return <div>Loading event details...</div>;
  }

  if (status === "loading") {
    return <div>Loading user session...</div>;
  }

  if (!session) {
    return <div>Please sign in to schedule an event.</div>;
  }

  if (error) {
    toast.error("Failed to fetch event details");
    return <div>Error loading event details</div>;
  }

  if (!event) {
    return <div>Event not found!</div>;
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-start justify-between p-6">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src={event.user.image}
                alt={event.user.name}
                width={48}
                height={48}
                className="rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl text-gray-900 font-bold">
                  {event.user.name}
                </h2>
                <p className="text-sm text-gray-600">{event.user.email}</p>
                <p className="text-sm text-gray-600">{event.title}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col md:flex-row items-start justify-between p-6">
                <div className="w-full ">
                  <h3 className="text-lg text-gray-900 font-bold mb-3">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-3 rounded-lg">
                    <FaClock className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatEventLength(event.length)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <p className="text-gray-800 mb-4">Select a Date & Time</p>
                <Calendar
                  className="w-full"
                  value={selectedDate ? new DateObject(selectedDate) : null}
                  onChange={(newDate) =>
                    setSelectedDate(newDate ? newDate.toDate() : null)
                  }
                  minDate={new Date()}
                  mapDays={({ date }) => {
                    const isAvailable = event?.availabilities?.some((avail) => {
                      const availDate = new Date(avail.startTime);
                      return isSameDay(availDate, date.toDate());
                    });

                    const isTodayDate = isToday(date.toDate());
                    const isSelected =
                      selectedDate && isSameDay(selectedDate, date.toDate());
                    const isBeforeToday = date.toDate() < new Date();
                    let dayClasses = "cursor-pointer";

                    if (!isAvailable) {
                      dayClasses = "bg-white cursor-not-allowed";
                    } else if (isBeforeToday) {
                      dayClasses = "text-gray-400";
                    } else if (isSelected) {
                      dayClasses = "bg-blue-700 text-white";
                    } else if (isTodayDate) {
                      dayClasses = "bg-transparent text-blue-700";
                    } else {
                      dayClasses = "bg-blue-100 text-blue-700 font-bold";
                    }

                    return {
                      className: dayClasses,
                      children: isTodayDate ? (
                        <div>
                          <div>{date.day}</div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: 2,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 4,
                              height: 4,
                              backgroundColor: "white",
                              borderRadius: "50%",
                            }}
                          ></div>
                        </div>
                      ) : (
                        date.day
                      ),
                      disabled: !isAvailable,
                    };
                  }}
                />
              </div>
              <div className="w-full">
                {selectedDate && (
                  <p className="text-lg font-medium text-gray-900 mb-4">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </p>
                )}
                <div className="max-h-72 overflow-y-auto mb-4">
                  <ul className="flex flex-col space-y-3">
                    {timeSlots.map((time, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <button
                          onClick={() => setSelectedTime(time)}
                          className={`w-full py-2 px-4 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-300 ${
                            selectedTime === time
                              ? "bg-gray-500 text-white"
                              : ""
                          }`}
                        >
                          {time}
                        </button>

                        {selectedTime === time && (
                          <button
                            onClick={handleNextButtonClick}
                            className="next-button w-full py-2 px-4 text-sm text-white bg-blue-600 rounded-md ml-2 transition-all duration-300"
                          >
                            Next
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
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
                      src={event?.user?.image as string}
                      alt={event?.user?.name as string}
                      width={56}
                      height={56}
                      className="rounded-full w-14 h-14 object-cover shadow-md"
                    />
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {event.user.name}
                      </h2>
                      <p className="text-sm text-gray-600">{event.title}</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg">
                      <FaClock className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatEventLength(event.length)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg">
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
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col justify-start space-y-4"
                >
                  <div className="w-full space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm text-gray-700 font-medium"
                    >
                      Name
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      id="name"
                      className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <span className="text-red-500 text-sm">
                        {errors.name.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm text-gray-700 font-medium"
                    >
                      Email
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      id="email"
                      className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="w-full space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm text-gray-700 font-medium"
                    >
                      Message (optional)
                    </label>
                    <textarea
                      {...register("message")}
                      id="message"
                      rows={4}
                      className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300"
                    >
                      Schedule Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;