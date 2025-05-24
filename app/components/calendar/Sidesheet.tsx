"use client";

import { useState } from "react";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { HiClock } from "react-icons/hi";
import { ImLoop } from "react-icons/im";
import Image from "next/image";
import { toast } from "react-toastify";
import { DayOfWeek } from "@prisma/client";
import { createEventType } from "@/app/actions/createEventType";
import { useSession } from "next-auth/react";

interface Availability {
  weekly: {
    [key: string]: { start: string; end: string }[];
  };
  dateSpecific: {
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    dayOfWeek: DayOfWeek;
  }[];
}

interface SidesheetProps {
  onClose: () => void;
  availability: Availability;
}

function Sidesheet({ onClose, availability }: SidesheetProps) {
  const [eventName, setEventName] = useState("");
  const [duration, setDuration] = useState("15min");
  const [customDuration, setCustomDuration] = useState({
    value: "",
    unit: "min",
  });

  const { data: session } = useSession();

  const handleEventNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventName(e.target.value);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDuration(e.target.value);
  };

  const handleCustomDurationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: "value" | "unit"
  ) => {
    setCustomDuration((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const renderWeeklyAvailability = () => {
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return days.map((day) => (
      <div key={day} className="flex items-start space-x-4 mb-4 min-h-[20px]">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex justify-center items-center text-sm font-semibold">
          {day.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col space-y-2">
          {availability.weekly[day].length > 0 ? (
            <div className="flex items-center space-x-1">
              <span className="text-black">
                {availability.weekly[day][0].start}
              </span>
              <span className="text-black">-</span>
              <span className="text-black">
                {availability.weekly[day][0].end}
              </span>
            </div>
          ) : (
            <div className="text-gray-500 italic">Unavailable</div>
          )}
        </div>
      </div>
    ));
  };

  const groupByDateRange = (availability: any) => {
    if (!availability || availability.length === 0) return [];

    const sortedAvailability = [...availability].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const grouped: any[] = [];
    let currentRange = {
      startTime: sortedAvailability[0]?.startTime,
      endTime: sortedAvailability[0]?.endTime,
      slots: [
        {
          start: sortedAvailability[0]?.startTime,
          end: sortedAvailability[0]?.endTime,
        },
      ],
    };

    for (let i = 1; i < sortedAvailability.length; i++) {
      const current = new Date(sortedAvailability[i].startTime);
      const previous = new Date(sortedAvailability[i - 1].endTime);

      if (current.getTime() - previous.getTime() <= 86400000) {
        currentRange.slots.push({
          start: sortedAvailability[i].startTime,
          end: sortedAvailability[i].endTime,
        });
        currentRange.endTime = sortedAvailability[i].endTime;
      } else {
        grouped.push(currentRange);
        currentRange = {
          startTime: sortedAvailability[i].startTime,
          endTime: sortedAvailability[i].endTime,
          slots: [
            {
              start: sortedAvailability[i].startTime,
              end: sortedAvailability[i].endTime,
            },
          ],
        };
      }
    }
    grouped.push(currentRange);
    return grouped;
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return start;
    }

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    const formattedStart = startDate.toLocaleDateString("en-US", options);
    const formattedEnd = endDate.toLocaleDateString("en-US", options);

    if (startDate.getDate() === endDate.getDate()) {
      return `${formattedStart}`;
    }

    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${formattedStart} - ${endDate.getDate()}`;
    }

    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${formattedStart} - ${formattedEnd}`;
    }

    return `${formattedStart} - ${formattedEnd} ${endDate.getFullYear()}`;
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    const formattedTime = date.toLocaleTimeString("en-US", options);
    return formattedTime
      .replace(/\s*(AM|PM)\s*/gi, (_, match) => match.toLowerCase())
      .replace(/\s*-\s*/, "-");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let durationInMinutes: number | undefined;

    if (duration === "custom") {
      if (customDuration.value) {
        durationInMinutes =
          parseInt(customDuration.value) *
          (customDuration.unit === "hrs" ? 60 : 1);
        if (isNaN(durationInMinutes)) {
          toast.error("Invalid custom duration format.");
          return;
        }
      } else {
        toast.error("Custom duration not specified.");
        return;
      }
    } else {
      durationInMinutes = parseInt(duration);
    }

    if (durationInMinutes === undefined) {
      toast.error("Failed to determine event duration.");
      return;
    }

    const availabilityData = [
      ...Object.entries(availability.weekly).flatMap(([day, slots]) =>
        slots.map((slot) => ({
          dayOfWeek: day.toUpperCase() as DayOfWeek,
          isRecurring: true,
          startTime: new Date(`2000-01-01T${slot.start}`).toISOString(),
          endTime: new Date(`2000-01-01T${slot.end}`).toISOString(),
        }))
      ),
      ...availability.dateSpecific.map((avail) => ({
        dayOfWeek: avail.dayOfWeek,
        isRecurring: avail.isRecurring,
        startTime: new Date(avail.startTime).toISOString(),
        endTime: new Date(avail.endTime).toISOString(),
      })),
    ];

    const dataToSend = {
      title: eventName,
      length: durationInMinutes,
      availabilityData: availabilityData,
    };

    try {
      await createEventType(dataToSend);
      toast.success("Event type created successfully!");
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        "There was an error creating the event type. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 w-full lg:w-[30%] bg-white h-full shadow-lg overflow-y-auto rounded-l-lg transition-transform transform ease-in-out duration-300">
        <div className="flex justify-end items-center p-4 border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="eventName"
                className="block text-sm font-medium text-gray-700"
              >
                Event Type
              </label>
              <input
                type="text"
                id="eventName"
                className="w-full p-3 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Name your event"
                value={eventName}
                onChange={handleEventNameChange}
              />
              <div className="text-gray-400 mt-2">One-on-One</div>
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration
              </label>
              <div className="mt-2 relative flex items-center space-x-2 text-gray-400">
                <select
                  value={duration}
                  onChange={handleDurationChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black appearance-none pl-8"
                >
                  <option value="15min">15 min</option>
                  <option value="30min">30 min</option>
                  <option value="45min">45 min</option>
                  <option value="60min">60 min</option>
                  <option value="custom">Custom</option>
                </select>
                <HiClock className="absolute left-2 text-gray-400" />
              </div>
              {duration === "custom" && (
                <div className="flex space-x-2 mt-4">
                  <input
                    type="number"
                    value={customDuration.value}
                    onChange={(e) => handleCustomDurationChange(e, "value")}
                    className="w-2/5 px-4 py-2 border border-gray-300 rounded-md text-black"
                  />
                  <select
                    value={customDuration.unit}
                    onChange={(e) => handleCustomDurationChange(e, "unit")}
                    className="w-3/5 px-4 py-2 border border-gray-300 rounded-md text-black"
                  >
                    <option value="min">min</option>
                    <option value="hrs">hrs</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm text-gray-700 flex items-center space-x-2">
                <ImLoop className="text-blue-500" />
                <span>Weekly hours</span>
              </h3>
              <div className="mt-4">{renderWeeklyAvailability()}</div>
              <div className="flex items-center relative">
                <h3 className="text-sm text-gray-700 flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span>Date-specific hours</span>
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {new Date().getFullYear()}
              </p>
              {groupByDateRange(availability.dateSpecific)?.map(
                (group, index) => (
                  <div key={index} className="mt-4 rounded-lg">
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-col items-start bg-transparent p-3 rounded-md w-full">
                        <div className="text-sm text-gray-700 font-semibold w-32">
                          {formatDateRange(group.startTime, group.endTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(group.slots[0].start)} -{" "}
                          {formatTime(group.slots[group.slots.length - 1].end)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500">Host</p>
            <div className="border-gray-200 pt-4 flex items-center space-x-4">
              {session?.user?.image && (
                <Image
                  src={session.user.image}
                  alt="User Image"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-gray-700">
                  {session?.user?.name || "Host Name"}
                </p>
                <p className="text-sm text-gray-500">(you)</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-full"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Sidesheet;
