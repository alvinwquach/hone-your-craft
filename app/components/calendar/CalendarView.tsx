"use client";

import { useState, useEffect } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import { format, isSameDay, parseISO, isToday } from "date-fns";
import BookingForm from "./BookingForm";

interface BookingTime {
  start: string;
  end: string;
}

interface Availability {
  id: string;
  startTime: string;
  endTime: string;
}

interface User {
  name: string;
  image: string;
  email: string;
}

interface CalendarViewProps {
  event: {
    id: string;
    userId: string;
    title: string;
    length: number;
    availabilities: Availability[];
    user: User;
  };
  bookedSlots: Availability[];
}

export default function CalendarView({
  event,
  bookedSlots,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const findAvailabilityForDate = (date: Date): BookingTime[] => {
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
      const slots: string[] = [];
      let current = start;

      const bookedSlotsOnDate = selectedDate
        ? bookedSlots
            .filter((slot) => isSameDay(parseISO(slot.startTime), selectedDate))
            .map((slot) => ({
              start: parseISO(slot.startTime),
              end: parseISO(slot.endTime),
            }))
        : [];

      while (current < end) {
        const nextSlot = new Date(current);
        nextSlot.setMinutes(nextSlot.getMinutes() + meetingLength);
        if (nextSlot <= end) {
          const slotStart = current;
          const slotEnd = nextSlot;
          const isBooked = bookedSlotsOnDate.some(
            (booked) => slotStart < booked.end && slotEnd > booked.start
          );
          if (!isBooked) {
            slots.push(format(slotStart, "h:mma").toLowerCase());
          }
        }
        current = nextSlot;
      }
      return slots;
    };

    if (selectedDate) {
      const newTimeSlots = findAvailabilityForDate(selectedDate).flatMap(
        (timeRange) => generateTimeSlots(timeRange, event.length)
      );
      setTimeSlots(newTimeSlots);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, event.length, event.availabilities, bookedSlots]);

  const handleNext = () => {
    if (selectedTime) setShowForm(true);
  };

  if (showForm && selectedDate && selectedTime) {
    return (
      <BookingForm
        event={event}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full">
          <p className="text-gray-800 mb-4">Select a Date & Time</p>
          <Calendar
            className="w-full"
            value={selectedDate ? new DateObject(selectedDate) : null}
            onChange={(newDate) =>
              setSelectedDate(newDate ? newDate.toDate() : null)
            }
            mapDays={({ date }) => {
              const isAvailable = event.availabilities.some((avail) =>
                isSameDay(parseISO(avail.startTime), date.toDate())
              );
              const isTodayDate = isToday(date.toDate());
              const isSelected =
                selectedDate && isSameDay(selectedDate, date.toDate());
              const isBeforeToday = date.toDate() < new Date();

              let dayClasses = "cursor-pointer";
              if (!isAvailable || isBeforeToday) {
                dayClasses = "bg-white cursor-not-allowed";
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
                    />
                  </div>
                ) : (
                  date.day
                ),
                disabled: !isAvailable || isBeforeToday,
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
                <li key={index} className="flex justify-between items-center">
                  <button
                    onClick={() => setSelectedTime(time)}
                    className={`w-full py-2 px-4 text-sm text-blue-600 font-medium border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all duration-300 ${
                      selectedTime === time ? "bg-gray-500 text-white" : ""
                    }`}
                  >
                    {time}
                  </button>
                  {selectedTime === time && (
                    <button
                      onClick={handleNext}
                      className="w-full py-2 px-4 text-sm text-white bg-blue-600 rounded-md ml-2 transition-all duration-300"
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
  );
}