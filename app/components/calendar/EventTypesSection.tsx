"use client";

import { EventType } from "@prisma/client";
import { toast } from "react-toastify";
import { EventTypeCard } from "./EventTypeCard";
import { deleteEventType } from "@/app/actions/deleteEventType";

interface EventTypesSectionProps {
  eventTypes: EventType[];
  baseUrl: string;
}

export default function EventTypesSection({ eventTypes, baseUrl }: EventTypesSectionProps) {
  const handleDelete = async (eventId: string) => {
    try {
      await deleteEventType(eventId);
      toast.success("Event Type Deleted");
    } catch (error) {
      console.error("Error deleting event type:", error);
      toast.error("Failed To Delete Event Type");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {eventTypes.map((event) => (
        <EventTypeCard
          key={event.id}
          event={event}
          baseUrl={baseUrl}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}