"use client";

import { format } from "date-fns";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import Image from "next/image";
import { scheduleEvent } from "@/app/actions/scheduleEvent";

interface User {
  name: string;
  image: string;
  email: string;
}

interface Event {
  id: string;
  userId: string;
  title: string;
  length: number;
  user: User;
}

interface ScheduleBookingFormProps {
  event: Event;
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
}

export default function ScheduleBookingForm({
  event,
  selectedDate,
  selectedTime,
  onBack,
}: ScheduleBookingFormProps) {
  const formatEventLength = (length: number) => {
    if (length < 60) return `${length} min`;
    const hours = Math.floor(length / 60);
    const minutes = length % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${
      minutes !== 0 ? minutes + " min" : ""
    }`;
  };

  const generateMeetingTime = () => {
    const match = selectedTime.match(/(\d+):(\d+)([ap]m)/i);
    if (!match) throw new Error("Invalid time format");
    const [, hour, minute, ampm] = match;
    let hours = parseInt(hour, 10);
    if (ampm.toLowerCase() === "pm") hours = hours === 12 ? hours : hours + 12;
    else if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
    const meetingStart = new Date(selectedDate);
    meetingStart.setHours(hours, parseInt(minute, 10), 0, 0);
    const meetingEnd = new Date(meetingStart);
    meetingEnd.setMinutes(meetingEnd.getMinutes() + event.length);
    return [
      { start: meetingStart.toISOString(), end: meetingEnd.toISOString() },
    ];
  };

  const meetingTime = generateMeetingTime();

  const handleSubmit = async (formData: FormData) => {
    formData.append("title", event.title);
    formData.append(
      "description",
      `Meeting scheduled with ${formData.get("name")}`
    );
    formData.append("startTime", meetingTime[0].start);
    formData.append("endTime", meetingTime[0].end);
    formData.append("participantId", event.userId);
    formData.append("eventTypeId", event.id);

    await scheduleEvent(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form action={handleSubmit} className="grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center items-start space-y-6">
            <div className="flex items-center space-x-4">
              <Image
                src={event.user.image}
                alt={event.user.name}
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
                  {`${format(
                    new Date(meetingTime[0].start),
                    "hh:mm a"
                  )} - ${format(
                    new Date(meetingTime[0].end),
                    "hh:mm a"
                  )}, ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-start space-y-4">
            <div className="w-full space-y-2">
              <label
                htmlFor="name"
                className="text-sm text-gray-700 font-medium"
              >
                Name
              </label>
              <input
                name="name"
                type="text"
                id="name"
                className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="w-full space-y-2">
              <label
                htmlFor="email"
                className="text-sm text-gray-700 font-medium"
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                id="email"
                className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="w-full space-y-2">
              <label
                htmlFor="message"
                className="text-sm text-gray-700 font-medium"
              >
                Message (optional)
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                className="w-full text-black py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-3 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-4 py-3 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all duration-300"
              >
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
