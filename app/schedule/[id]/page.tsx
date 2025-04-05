import UserInfo from "@/app/components/calendar/UserInfo";
import CalendarView from "@/app/components/calendar/CalendarView";
import { getEventType } from "@/app/actions/getEventType";

interface SchedulePageProps {
  params: { id: string };
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { id } = params;
  const eventData = await getEventType(id);
  const { event, bookedSlots } = eventData;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <UserInfo user={event.user} eventTitle={event.title} />
          <CalendarView event={event} bookedSlots={bookedSlots} />
        </div>
      </div>
    </div>
  );
}
