import { getPastEvents } from "@/app/actions/getPastEvents";
import { getUpcomingEvents } from "@/app/actions/getUpcomingEvents";
import MeetingCalendarDownloadButton from "@/app/components/profile/meetings/MeetingCalendarDownloadButton";
import MeetingTabs from "@/app/components/profile/meetings/MeetingTabs";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  creator: { name: string | null; email: string | null };
  participant: { name: string | null; email: string | null };
  eventType?: { id: string; title: string } | null;
}

async function groupEventsByDate(events: Event[]) {
  return events.reduce((acc, event) => {
    const eventDate = new Date(event.startTime).toLocaleDateString();
    if (!acc[eventDate]) acc[eventDate] = [];
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
}

export default async function Meetings() {
  const upcomingEvents = await getUpcomingEvents();
  const pastEvents = await getPastEvents();
  const groupedUpcomingEvents = await groupEventsByDate(upcomingEvents);
  const groupedPastEvents = await groupEventsByDate(pastEvents);

  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sr-only">
            Upcoming Meetings
          </h1>
        </div>
        <div className="fixed top-24 right-8 z-10">
          {Object.entries(groupedUpcomingEvents).length > 0 && (
            <MeetingCalendarDownloadButton />
          )}
        </div>
        <div className="pt-16">
          <MeetingTabs
            groupedUpcomingEvents={groupedUpcomingEvents}
            groupedPastEvents={groupedPastEvents}
          />
        </div>
      </div>
    </section>
  );
}