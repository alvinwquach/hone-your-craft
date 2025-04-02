"use client";

import { EventType } from "@prisma/client";
import { FaLink, FaCog, FaTrash, FaClipboard, FaShare } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { deleteEventType } from "@/app/actions/deleteEventType";

interface EventTypesSectionProps {
  eventTypes: EventType[];
  baseUrl: string;
}

export default function EventTypesSection({
  eventTypes,
  baseUrl,
}: EventTypesSectionProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);

  const formatEventLength = (length: number) => {
    if (length < 60) return `${length} min`;
    const hours = Math.floor(length / 60);
    const minutes = length % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${
      minutes !== 0 ? minutes + " min" : ""
    }`;
  };

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
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventTypes.map((event) => (
          <div
            key={event.id}
            className="p-6 border rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {event.title}
              </h3>
              <div className="relative">
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() =>
                    setShowOptionsMenu(
                      showOptionsMenu === event.id ? null : event.id
                    )
                  }
                >
                  <FaCog className="w-5 h-5 inline mr-2" />
                </button>
                {showOptionsMenu === event.id && (
                  <div className="absolute right-0 w-40 bg-white shadow-md rounded-lg mt-2 py-1">
                    <button
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleDelete(event.id)}
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {formatEventLength(event.length || 0)}, One-on-One
            </p>
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <Link
                  href={`/schedule/${event.id}`}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaLink className="mr-2" /> View booking page
                </Link>
              </div>
              <hr className="my-4 border-t border-gray-300 w-full mx-auto" />
              <div className="flex justify-between mt-2">
                <button
                  className="flex items-center text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${baseUrl}/schedule/${event.id}`
                    );
                    toast.info("Link copied to clipboard!");
                  }}
                >
                  <FaClipboard className="mr-2" /> Copy link
                </button>
                <button
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                  onClick={() => {
                    const shareUrl = `${baseUrl}/schedule/${event.id}`;
                    if (navigator.share) {
                      navigator
                        .share({
                          title: event.title,
                          text: `Book a ${event.title} meeting`,
                          url: shareUrl,
                        })
                        .catch(console.error);
                    } else {
                      window.open(shareUrl, "_blank");
                    }
                    toast.info("Shared!");
                  }}
                >
                  <FaShare className="mr-2 h-4 w-4 text-white" /> Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
