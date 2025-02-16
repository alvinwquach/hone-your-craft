import { useState, useEffect, useMemo } from "react";
import {
  format,
  getDay,
  addDays,
  startOfMonth,
  addHours,
  parse,
  isToday,
  isSameDay,
  addMonths,
} from "date-fns";
import { HiPlus, HiX } from "react-icons/hi";
import { Calendar, DateObject } from "react-multi-date-picker";
import { toast } from "react-toastify";
import { mutate } from "swr";

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface AddAvailabilityModalProps {
  isOpen: boolean;
  closeModal: () => void;
  selectedDate: Date | null;
  selectedDates: Date[];
  isRecurring: boolean;
  onSubmit: (dates: Date[], timeRanges: TimeRange[]) => void;
}

function AddAvailabilityModal({
  isOpen,
  closeModal,
  selectedDate,
  selectedDates,
  isRecurring,
  onSubmit,
}: AddAvailabilityModalProps) {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    { startTime: "09:00 AM", endTime: "10:00 AM" },
  ]);
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    if (selectedDates.length > 0) {
      setDates(selectedDates);
    } else if (selectedDate) {
      setDates([selectedDate]);
    }

    setTimeRanges([{ startTime: "09:00 AM", endTime: "10:00 AM" }]);
  }, [selectedDates, selectedDate, isOpen]);

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

  const addTimeRange = () => {
    if (timeRanges.length === 0) {
      setTimeRanges([{ startTime: "09:00 AM", endTime: "10:00 AM" }]);
      return;
    }

    const lastRange = timeRanges[timeRanges.length - 1];
    const parsedEndTime = parse(
      `01/01/1970 ${lastRange.endTime}`,
      "MM/dd/yyyy hh:mm a",
      new Date()
    );
    if (isNaN(parsedEndTime.getTime())) return;

    const newStartTime = addHours(parsedEndTime, 1);
    const formattedStart = format(newStartTime, "hh:mm a");
    const formattedEnd = format(addHours(newStartTime, 1), "hh:mm a");

    setTimeRanges([
      ...timeRanges,
      { startTime: formattedStart, endTime: formattedEnd },
    ]);
  };

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const updatedTimeRanges = [...timeRanges];
    updatedTimeRanges[index][field] = value;
    setTimeRanges(updatedTimeRanges);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let datesToSubmit = dates;

    if (selectedDates.length > 0) {
      setDates(selectedDates);
    }

    if (selectedDate && selectedDates.length === 0) {
      datesToSubmit = [selectedDate];
    }

    if (isRecurring && selectedDate) {
      const dayOfWeek = getDay(selectedDate);
      const recurringDates: Date[] = [];

      const startDate = startOfMonth(selectedDate);
      const endDate = addMonths(startDate, 12);

      let currentDay = startDate;
      while (currentDay <= endDate) {
        if (getDay(currentDay) === dayOfWeek) {
          recurringDates.push(currentDay);
        }
        currentDay = addDays(currentDay, 1);
      }

      datesToSubmit = recurringDates;
    }

    const body = {
      dates: datesToSubmit.map((date) => date.toISOString()),
      timeRanges: timeRanges.map((range) => ({
        startTime: range.startTime,
        endTime: range.endTime,
      })),
      isRecurring: isRecurring,
    };

    try {
      const response = await fetch("/api/interview-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to add availability");
      }

      onSubmit(datesToSubmit, timeRanges);
      toast.success("Availability added successfully");
      closeModal();
      mutate("/api/interview-availability");
    } catch (error) {
      toast.error("Your availability cannot overlap with other time slots");
      console.error("Error submitting availability:", error);
    }
  };

  const handleRemoveTimeRange = (index: number) => {
    const updatedTimeRanges = [...timeRanges];
    updatedTimeRanges.splice(index, 1);

    if (updatedTimeRanges.length === 0) {
      setTimeRanges([]);
    } else {
      setTimeRanges(updatedTimeRanges);
    }
  };

  const renderTimeRangeSection = () => {
    if (timeRanges.length === 0) {
      return (
        <div className="flex justify-between mt-2 text-gray-600">
          <p className="text-sm">Unavailable</p>
          <button
            type="button"
            onClick={addTimeRange}
            className="ml-2 text-blue-600 flex"
            aria-label="Add another time range"
          >
            <HiPlus />
          </button>
        </div>
      );
    }

    return timeRanges.map((timeRange, index) => (
      <div key={index} className="flex items-center gap-2 mt-2">
        <select
          value={timeRange.startTime}
          onChange={(e) => handleTimeChange(index, "startTime", e.target.value)}
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
          onChange={(e) => handleTimeChange(index, "endTime", e.target.value)}
          className="p-1 border border-gray-300 rounded-md w-24 text-sm text-black"
          aria-label="End time"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleRemoveTimeRange(index)}
          className="ml-2 text-red-600"
          aria-label="Remove time range"
        >
          <HiX />
        </button>
        <div className="ml-auto flex items-center">
          {index === 0 && (
            <button
              type="button"
              onClick={addTimeRange}
              className="ml-2 text-blue-600"
              aria-label="Add another time range"
            >
              <HiPlus />
            </button>
          )}
        </div>
      </div>
    ));
  };

  if (!isOpen) return null;

  const today = new Date();

  return (
    <div className="z-10 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold text-black">
          {isRecurring
            ? `Edit availability for all ${format(
                selectedDate || today,
                "EEEE"
              )}s`
            : "Select the date(s) you want to assign specific hours"}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isRecurring && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 sr-only">
                Select Dates
              </label>
              <div className="flex justify-center items-center">
                <Calendar
                  value={dates.map((date) => new DateObject(date))}
                  onChange={(newDates) => {
                    const selectedDates = newDates.map((dateObject) =>
                      dateObject.toDate()
                    );
                    setDates(selectedDates);
                  }}
                  multiple
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
              What hours are you available?
            </label>
            {renderTimeRangeSection()}
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                closeModal();
                setTimeRanges([{ startTime: "09:00 AM", endTime: "10:00 AM" }]);
              }}
              className="text-gray-500 hover:text-gray-700 py-2 px-6 w-1/2 rounded-full border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 w-1/2 rounded-full"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAvailabilityModal;