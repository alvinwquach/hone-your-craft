import { getPastEvents } from "@/app/actions/getPastEvents";
import { getUpcomingEvents } from "@/app/actions/getUpcomingEvents";
import MeetingCalendarDownloadButton from "@/app/components/profile/meetings/MeetingCalendarDownloadButton";
import MeetingTabs from "@/app/components/profile/meetings/MeetingTabs";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";

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
    <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)]">
      <div className="container mx-auto p-4">
        <ProfileNavigation />
        <div className="flex justify-evenly items-center my-6">
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <MeetingCalendarDownloadButton />
        </div>
        <MeetingTabs
          groupedUpcomingEvents={groupedUpcomingEvents}
          groupedPastEvents={groupedPastEvents}
        />
      </div>
    </section>
  );
}
