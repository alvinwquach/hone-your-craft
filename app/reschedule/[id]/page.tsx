import { getEventTypeToReschedule } from "@/app/actions/getEventTypeToReschedule";
import UserInfo from "@/app/components/calendar/UserInfo";
import RescheduleCalendarView from "@/app/components/calendar/RescheduleCalendarView";

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

type BookedSlot = {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookedBy: string;
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    creator: User;
    participant: User;
  };
};

interface ReschedulePageProps {
  params: { id: string };
  searchParams: { eventId?: string; start?: string };
}

async function fetchEventData(eventId: string) {
  const eventData = await getEventTypeToReschedule(eventId);
  return {
    event: eventData.event,
    bookedSlots: eventData.bookedSlots as BookedSlot[],
  };
}

export default async function ReschedulePage({
  searchParams,
}: ReschedulePageProps) {
  const eventId = searchParams.eventId;
  const originalStart = searchParams.start;
  const { event, bookedSlots } = await fetchEventData(eventId ?? "");

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="flex justify-center">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
          <UserInfo user={event.user} eventTitle={event.title} />
          <RescheduleCalendarView
            event={event}
            bookedSlots={bookedSlots}
            eventId={eventId ?? ""}
            originalStart={originalStart}
          />
        </div>
      </div>
    </div>
  );
}
