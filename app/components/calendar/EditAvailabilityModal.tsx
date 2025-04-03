"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  parse,
  isToday,
  isSameDay,
  startOfDay,
  getDay,
  addDays,
  addMonths,
  startOfMonth,
} from "date-fns";
import { Calendar, DateObject } from "react-multi-date-picker";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { updateInterviewAvailability } from "@/app/actions/updateInterviewAvailability";

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface AvailabilityItem {
  id: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface EditAvailabilityModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedDates: Date[];
  interviewAvailability: AvailabilityItem[];
  isRecurring?: boolean;
  editAllRecurring?: boolean;
  onSubmit: (
    updatedEvents: {
      id: string;
      startTime: string;
      endTime: string;
      isRecurring: boolean;
    }[],
    editAllRecurring?: boolean
  ) => void;
}

function EditAvailabilityModal({
  isOpen,
  closeModal,
  selectedDates,
  interviewAvailability,
  isRecurring = false,
  editAllRecurring = false,
  onSubmit,
}: EditAvailabilityModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startTime: "09:00 AM",
    endTime: "10:00 AM",
  });
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    if (isOpen && selectedDates.length > 0) {
      if (editAllRecurring) {
        const firstDate = selectedDates[0];
        const dayOfWeek = getDay(firstDate);
        const recurringDates: Date[] = [];
        const startDate = startOfMonth(firstDate);
        const endDate = addMonths(startDate, 12);

        let currentDay = startDate;
        while (currentDay <= endDate) {
          if (getDay(currentDay) === dayOfWeek) {
            recurringDates.push(new Date(currentDay));
          }
          currentDay = addDays(currentDay, 1);
        }
        setDates(recurringDates);
      } else {
        setDates(selectedDates);
      }

      const eventsInRange = interviewAvailability.filter((item) =>
        selectedDates.some((d) => isSameDay(d, new Date(item.startTime)))
      );
      if (eventsInRange.length > 0) {
        const firstEvent = eventsInRange[0];
        setTimeRange({
          startTime: format(new Date(firstEvent.startTime), "hh:mm a"),
          endTime: format(new Date(firstEvent.endTime), "hh:mm a"),
        });
      }
    }
  }, [isOpen, selectedDates, interviewAvailability, editAllRecurring]);

  const timeOptions = useMemo(() => {
    const times: string[] = [];
    let currentTime = new Date();
    currentTime.setHours(0, 0, 0, 0);

    for (let i = 0; i < 96; i++) {
      const time = format(currentTime, "hh:mm a");
      times.push(time);
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }
    return times;
  }, []);

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    setTimeRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let eventsToUpdate = interviewAvailability.filter((item) =>
      dates.some((d) => isSameDay(d, new Date(item.startTime)))
    );

    if (editAllRecurring) {
      const sampleEvent = eventsToUpdate[0];
      eventsToUpdate = interviewAvailability.filter(
        (item) =>
          getDay(new Date(item.startTime)) ===
            getDay(new Date(sampleEvent.startTime)) && item.isRecurring
      );
    }

    const updatedEvents = eventsToUpdate
      .map((event) => {
        const eventDate = startOfDay(new Date(event.startTime));
        const startDate = parse(timeRange.startTime, "hh:mm a", eventDate);
        const endDate = parse(timeRange.endTime, "hh:mm a", eventDate);

        if (endDate <= startDate) {
          toast.error("End time must be after start time");
          return null;
        }

        return {
          id: event.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          isRecurring: event.isRecurring,
        };
      })
      .filter((event): event is NonNullable<typeof event> => event !== null); // Type guard to remove null

    if (updatedEvents.length === 0) {
      toast.error("No valid events to update");
      return;
    }

    try {
      const result = await updateInterviewAvailability({
        events: updatedEvents,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      onSubmit(updatedEvents, editAllRecurring);
      toast.success("Availability updated successfully");
      closeModal();
      mutate("/api/interview-availability");
    } catch (error) {
      toast.error("Failed to update availability");
      console.error("Error updating availability:", error);
    }
  };

  if (!isOpen) return null;

  const today = new Date();

  return (
    <div
      className="z-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        className="bg-white p-6 rounded-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-black">
          Edit{" "}
          {editAllRecurring
            ? `All ${format(dates[0] || today, "EEEE")}s`
            : "Availability for"}{" "}
          {editAllRecurring ? "" : `${dates.length} Date(s)`}
        </h2>
        <form onSubmit={handleSubmit}>
          {!editAllRecurring && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 sr-only">
                Selected Dates
              </label>
              <div className="flex justify-center items-center">
                <Calendar
                  value={dates.map((date) => new DateObject(date))}
                  onChange={(newDates) => {
                    if (!newDates) {
                      setDates([]);
                      return;
                    }
                    const selectedDates = Array.isArray(newDates)
                      ? newDates.map((dateObject) => dateObject.toDate())
                      : [newDates.toDate()];
                    setDates(selectedDates);
                  }}
                  multiple={!isRecurring}
                  minDate={today}
                  headerOrder={["MONTH_YEAR", "LEFT_BUTTON", "RIGHT_BUTTON"]}
                  monthYearSeparator={" "}
                  showOtherDays={true}
                  mapDays={({ date }) => {
                    const isTodayDate = isToday(date.toDate());
                    const isSelected = dates.some((d) =>
                      isSameDay(d, date.toDate())
                    );
                    const isBeforeToday = date.toDate() < today;
                    let dayClasses = "cursor-pointer";
                    if (isBeforeToday) {
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
                    };
                  }}
                />
              </div>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-black">
              Available Hours
            </label>
            <div className="flex items-center gap-2 mt-2">
              <select
                value={timeRange.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                className="p-1 border border-gray-300 rounded-md w-24 text-sm text-black"
                aria-label="Start time"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span className="self-center text-black">-</span>
              <select
                value={timeRange.endTime}
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                className="p-1 border border-gray-300 rounded-md w-24 text-sm text-black"
                aria-label="End time"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 py-2 px-6 w-1/2 rounded-full border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 w-1/2 rounded-full"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAvailabilityModal;
