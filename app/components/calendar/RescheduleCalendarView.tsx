"use client";

import { useState, useEffect } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import { format, isSameDay, parseISO, isToday } from "date-fns";
import RescheduleBookingForm from "./RescheduleBookingForm";

type BookingTime = { start: string; end: string };

interface User {
  name: string;
  image: string;
  email: string;
}

interface AvailabilitySlot {
  id: string;
  userId: string;
  dayOfWeek: string;
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

interface BookedSlotEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creator: User;
  participant: User;
}

interface BookedSlot {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy: string;
  event: BookedSlotEvent;
}

interface RescheduleCalendarViewProps {
  event: {
    id: string;
    userId: string;
    title: string;
    length: number;
    createdAt: string;
    updatedAt: string;
    availabilities: AvailabilitySlot[];
    user: User;
  };
  bookedSlots: BookedSlot[];
  eventId: string;
  originalStart?: string;
}

export default function RescheduleCalendarView({
  event,
  bookedSlots,
  eventId,
  originalStart,
}: RescheduleCalendarViewProps) {
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
        ? bookedSlots.filter((slot) =>
            isSameDay(parseISO(slot.startTime), selectedDate)
          )
        : [];

      while (current < end) {
        const nextSlot = new Date(current);
        nextSlot.setMinutes(nextSlot.getMinutes() + meetingLength);
        if (nextSlot <= end) {
          const slotStart = current;
          const slotEnd = nextSlot;
          const formattedStart = format(slotStart, "h:mma").toLowerCase();

          const isBooked = bookedSlotsOnDate.some(
            (booked) =>
              slotStart < parseISO(booked.endTime) &&
              slotEnd > parseISO(booked.startTime)
          );

          if (!isBooked) {
            slots.push(formattedStart);
          }
        }
        current = nextSlot;
      }

      if (
        originalStart &&
        selectedDate &&
        isSameDay(parseISO(originalStart), selectedDate)
      ) {
        const originalTime = format(
          parseISO(originalStart),
          "h:mma"
        ).toLowerCase();
        if (!slots.includes(originalTime)) {
          slots.unshift(originalTime);
        }
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
  }, [
    selectedDate,
    event.length,
    event.availabilities,
    bookedSlots,
    originalStart,
  ]);

  const handleNext = () => {
    if (selectedTime) setShowForm(true);
  };

  const isFormerTime = (time: string): boolean => {
    if (!selectedDate || !originalStart) return false;

    const originalDate = new Date(originalStart);
    const formattedOriginalStart = format(originalDate, "h:mma").toLowerCase();

    const isSameDayAsOriginal = isSameDay(originalDate, selectedDate);
    return isSameDayAsOriginal && time === formattedOriginalStart;
  };

  if (showForm && selectedDate && selectedTime) {
    return (
      <RescheduleBookingForm
        event={event}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        eventId={eventId}
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
                    <div className="flex flex-col items-start">
                      <span>{time}</span>
                      {selectedDate && time && isFormerTime(time) && (
                        <span className="text-xs text-gray-400">
                          Former Time
                        </span>
                      )}
                    </div>
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
