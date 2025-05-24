import EventTypesSection from "@/app/components/calendar/EventTypesSection";
import SidesheetWrapper from "@/app/components/calendar/SidesheetWrapper";
import { getEventTypes } from "@/app/actions/getEventTypes";
import { getInterviewAvailability } from "@/app/actions/getInterviewAvailability";
import { DayOfWeek } from "@prisma/client";
import CalendarTabs from "@/app/components/calendar/CalendarTabs";

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

export default async function EventTypesPage() {
  const { eventTypes } = await getEventTypes();
  const interviewAvailability = await getInterviewAvailability();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const availability: Availability = {
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
  };

  if (interviewAvailability) {
    Object.keys(availability.weekly).forEach((day) => {
      const recurringSlots = interviewAvailability
        .filter(
          (avail: any) =>
            new Date(avail.startTime)
              .toLocaleString("en-US", { weekday: "short" })
              .toLowerCase() === day && avail.isRecurring
        )
        .map((avail: any) => ({
          start: new Date(avail.startTime)
            .toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(/\s*(AM|PM)\s*/gi, (_, match) => match.toLowerCase()),
          end: new Date(avail.endTime)
            .toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            .replace(/\s*(AM|PM)\s*/gi, (_, match) => match.toLowerCase()),
        }));
      availability.weekly[day] =
        recurringSlots.length > 0 ? [recurringSlots[0]] : [];
    });

    availability.dateSpecific = interviewAvailability.map((avail: any) => ({
      startTime: avail.startTime,
      endTime: avail.endTime,
      isRecurring: avail.isRecurring,
      dayOfWeek: new Date(avail.startTime)
        .toLocaleString("en-US", { weekday: "long" })
        .toUpperCase() as DayOfWeek,
    }));
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <CalendarTabs />
      <SidesheetWrapper availability={availability} />
      <EventTypesSection eventTypes={eventTypes} baseUrl={baseUrl} />
    </div>
  );
}