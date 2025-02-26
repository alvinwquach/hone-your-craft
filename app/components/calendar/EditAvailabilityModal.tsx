"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { format, parse, isToday, isSameDay } from "date-fns";
import { Calendar, DateObject } from "react-multi-date-picker";
import { HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import { mutate } from "swr";

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface EditAvailabilityModalProps {
  isOpen: boolean;
  closeModal: () => void;
  availabilityId: string;
  initialStartTime: string;
  initialEndTime: string;
  onSubmit: (id: string, startTime: string, endTime: string) => void;
}

function EditAvailabilityModal({
  isOpen,
  closeModal,
  availabilityId,
  initialStartTime,
  initialEndTime,
  onSubmit,
}: EditAvailabilityModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startTime: "",
    endTime: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    const start = new Date(initialStartTime);
    const end = new Date(initialEndTime);
    setTimeRange({
      startTime: format(start, "hh:mm a"),
      endTime: format(end, "hh:mm a"),
    });
    setSelectedDate(start);
    setDates([start]);
  }, [initialStartTime, initialEndTime, isOpen]);

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

    const startDate = parse(
      timeRange.startTime,
      "hh:mm a",
      new Date(initialStartTime)
    );
    const endDate = parse(
      timeRange.endTime,
      "hh:mm a",
      new Date(initialEndTime)
    );

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      const body = {
        id: availabilityId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      const response = await fetch("/api/interview-availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      onSubmit(availabilityId, startDate.toISOString(), endDate.toISOString());
      toast.success("Availability updated successfully");
      closeModal();
      mutate("/api/interview-availability");
    } catch (error) {
      toast.error("Failed to update availability");
      console.error("Error updating availability:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold text-black">
          Edit Availability for{" "}
          {format(selectedDate || new Date(), "MMMM d, yyyy")}
        </h2>
        <div className="mt-4 flex justify-center items-center">
          <Calendar
            value={selectedDate}
            minDate={new Date()}
            showOtherDays={true}
            mapDays={({ date }) => {
              const isTodayDate = isToday(date.toDate());
              const isSelected = dates.some((d) => isSameDay(d, date.toDate()));
              let dayClasses = "cursor-pointer";
              if (isTodayDate) {
                dayClasses = "bg-transparent text-blue-700";
              } else if (isSelected) {
                dayClasses = "bg-blue-700 text-white";
              }
              return { className: dayClasses };
            }}
          />
        </div>
        <form onSubmit={handleSubmit}>
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
