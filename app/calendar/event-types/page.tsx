import EventTypesSection from "@/app/components/calendar/EventTypesSection";
import SidesheetWrapper from "@/app/components/calendar/SidesheetWrapper";
import { getEventTypes } from "@/app/actions/getEventTypes";

export default async function EventTypesPage() {
  const { eventTypes } = await getEventTypes();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <>
      <SidesheetWrapper />
      <EventTypesSection eventTypes={eventTypes} baseUrl={baseUrl} />
    </>
  );
}
