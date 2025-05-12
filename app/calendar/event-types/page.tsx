import EventTypesSection from "@/app/components/calendar/EventTypesSection";
import SidesheetWrapper from "@/app/components/calendar/SidesheetWrapper";
import { getEventTypes } from "@/app/actions/getEventTypes";
import CalendarTabs from "@/app/components/calendar/CalendarTabs";

export default async function EventTypesPage() {
  const { eventTypes } = await getEventTypes();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 animate-fade-in-up min-h-screen">
      <CalendarTabs />
      <SidesheetWrapper />
      <EventTypesSection eventTypes={eventTypes} baseUrl={baseUrl} />
    </div>
  );
}
