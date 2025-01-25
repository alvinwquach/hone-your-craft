"use client";

import { useState } from "react";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { AiOutlinePlus } from "react-icons/ai";
import { HiClock } from "react-icons/hi";
import { ImLoop } from "react-icons/im";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Image from "next/image";

interface Availability {
  weekly: {
    [key: string]: { start: string; end: string }[];
  };
  dateSpecific: { date: string; hours: string }[];
}

interface SidesheetProps {
  onClose: () => void;
}

const fetcher = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

function Sidesheet({ onClose }: SidesheetProps) {
  const [duration, setDuration] = useState("15min");
  const [customDuration, setCustomDuration] = useState({
    value: "",
    unit: "min",
  });
  const [availability, setAvailability] = useState<Availability>({
    weekly: {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    },
    dateSpecific: [],
  });

  const { data: session } = useSession();

  const { data, isLoading: userDataLoading } = useSWR(
    session ? `/api/user/${session?.user?.email}` : null,
    (url) => fetcher(url, { method: "GET" }),
    { refreshInterval: 1000 }
  );

  const { data: clientAvailability, isLoading: clientAvailabilityLoading } =
    useSWR(session ? `/api/client-availability` : null, fetcher, {
      refreshInterval: 1000,
    });

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

  const handleAddTimeSlot = (day: string) => {
    setAvailability((prev) => ({
      ...prev,
      weekly: {
        ...prev.weekly,
        [day]: [...prev.weekly[day], { start: "", end: "" }],
      },
    }));
  };

  const handleRemoveTimeSlot = (day: string, index: number) => {
    const updatedSlots = [...availability.weekly[day]];
    updatedSlots.splice(index, 1);
    setAvailability((prev) => ({
      ...prev,
      weekly: { ...prev.weekly, [day]: updatedSlots },
    }));
  };

  const renderTimeSlotInputs = (day: string) => {
    return availability.weekly[day].map((slot, index) => (
      <div
        key={index}
        className={`flex items-center space-x-2 ${index > 0 ? "mt-4" : ""}`}
      >
        <input
          type="time"
          value={slot.start}
          onChange={(e) => {
            const updatedSlots = [...availability.weekly[day]];
            updatedSlots[index].start = e.target.value;
            setAvailability((prev) => ({
              ...prev,
              weekly: { ...prev.weekly, [day]: updatedSlots },
            }));
          }}
          className="px-4 py-1 border border-gray-300 rounded-md text-black"
        />
        <span className="text-black">-</span>
        <input
          type="time"
          value={slot.end}
          onChange={(e) => {
            const updatedSlots = [...availability.weekly[day]];
            updatedSlots[index].end = e.target.value;
            setAvailability((prev) => ({
              ...prev,
              weekly: { ...prev.weekly, [day]: updatedSlots },
            }));
          }}
          className="px-4 py-1 border border-gray-300 rounded-md text-black"
        />
        <button
          type="button"
          onClick={() => handleRemoveTimeSlot(day, index)}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          <FaTimes />
        </button>
        {index === 0 && (
          <button
            type="button"
            onClick={() => handleAddTimeSlot(day)}
            className="ml-4 text-blue-500 hover:text-blue-700"
          >
            <AiOutlinePlus />
          </button>
        )}
      </div>
    ));
  };

  const userData = data || [];
  const loadingUserData = !userData || userDataLoading;

  const groupByDateRange = (availability: any) => {
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

    return formattedTime.replace(/(AM|PM)/, (match) => match.toLowerCase());
  };

  const renderWeeklyAvailability = () => {
    const weeklyAvailability: {
      [key: string]: { start: string; end: string }[];
    } = {
      sun: [],
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
    };

    clientAvailability?.forEach((availability: any) => {
      const day = new Date(availability.startTime)
        .toLocaleString("en-US", {
          weekday: "short",
        })
        .toLowerCase();

      const slot = {
        start: formatTime(availability.startTime),
        end: formatTime(availability.endTime),
      };
      if (weeklyAvailability[day]) {
        weeklyAvailability[day].push(slot);
      }
    });

    return Object.keys(weeklyAvailability).map((day) => {
      const slotCounts = weeklyAvailability[day].reduce((acc, slot) => {
        const key = `${slot.start}-${slot.end}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const hasRecurringSlot = Object.values(slotCounts).some(
        (count) => count > 2
      );

      return (
        <div key={day} className="flex items-start space-x-4 mb-4 min-h-[20px]">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex justify-center items-center text-sm font-semibold">
            {day.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col space-y-2">
            {hasRecurringSlot ? (
              Object.keys(slotCounts).map((slotKey, index) => {
                if (slotCounts[slotKey] > 2) {
                  const [start, end] = slotKey.split("-");
                  return (
                    <div key={index} className="text-black flex items-center">
                      <HiClock className="text-gray-500 mr-2" />
                      <span>
                        {start} - {end}
                      </span>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <div className="text-gray-500 italic">Unavailable</div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 w-full lg:w-1/3 bg-white h-full shadow-lg overflow-y-auto rounded-l-lg transition-transform transform ease-in-out duration-300">
        <div className="flex justify-end items-center p-4 border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="event-name"
                className="block text-sm font-medium text-gray-700"
              >
                Event Type
              </label>
              <input
                type="text"
                id="event-name"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Name your event"
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
              <p className="text-xs text-gray-500">
                Set when you are available for meetings
              </p>
              <div className="mt-4">{renderWeeklyAvailability()}</div>
              <div className="flex justify-between items-center relative">
                <h3 className="text-sm text-gray-700 flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span>Date-specific hours</span>
                </h3>
                <button className="absolute right-0 -top-1 mt-2 mr-4 px-3 py-1 border border-gray-300 rounded-full text-blue-500 hover:text-blue-700 flex items-center">
                  <span>+ Hours</span>
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Adjust hours for specific days
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date().getFullYear()}
              </p>
              {clientAvailabilityLoading ? (
                <p className="text-sm text-gray-500">
                  Loading client availability...
                </p>
              ) : (
                groupByDateRange(clientAvailability)?.map((group, index) => {
                  return (
                    <div key={index} className="mt-4 rounded-lg shadow-sm">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center bg-gray-200 p-3 rounded-md w-full">
                          <div className="text-sm text-gray-700 font-semibold w-32">
                            {formatDateRange(group.startTime, group.endTime)}
                          </div>

                          <div className="flex-1 text-center text-sm text-gray-500">
                            <span>
                              {formatTime(group.slots[0].start)} -{" "}
                              {formatTime(
                                group.slots[group.slots.length - 1].end
                              )}
                            </span>
                          </div>

                          <button className="text-gray-500 hover:text-gray-700">
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-sm font-semibold text-gray-500">Host</p>
            <div className="border-gray-200 pt-4 flex items-center space-x-4">
              {userData?.user?.image && (
                <Image
                  src={userData?.user?.image ?? ""}
                  alt="User Image"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-gray-700">
                  {userData?.user?.name || "Host Name"}
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