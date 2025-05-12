"use client";

import { EventType } from "@prisma/client";
import { FaLink, FaCog, FaTrash, FaClipboard, FaShare } from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { deleteEventType } from "@/app/actions/deleteEventType";

interface EventTypeCardProps {
  event: EventType;
  baseUrl: string;
  onDelete?: (id: string) => void;
}

export function EventTypeCard({
  event,
  baseUrl,
  onDelete,
}: EventTypeCardProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);

  const formatEventLength = (length: number) => {
    if (length < 60) return `${length} min`;
    const hours = Math.floor(length / 60);
    const minutes = length % 60;
    return `${hours} hr${hours > 1 ? "s" : ""} ${
      minutes !== 0 ? minutes + " min" : ""
    }`;
  };

  const handleDelete = async () => {
    try {
      await deleteEventType(event.id);
      toast.success("Event Type Deleted");
      onDelete?.(event.id);
    } catch (error) {
      console.error("Error deleting event type:", error);
      toast.error("Failed To Delete Event Type");
    }
  };

  return (
    <div className="border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start p-6">
        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
        <div className="relative">
          <button
            className="text-zinc-400 hover:text-zinc-200"
            onClick={() =>
              setShowOptionsMenu(showOptionsMenu === event.id ? null : event.id)
            }
          >
            <FaCog className="w-5 h-5" />
          </button>
          {showOptionsMenu === event.id && (
            <div className="absolute right-0 w-40 bg-zinc-800 border border-zinc-700 shadow-md rounded-lg mt-2 py-1 z-10">
              <button
                className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-zinc-700 hover:text-red-400 w-full text-left"
                onClick={handleDelete}
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-sm text-zinc-400 px-6 pb-4">
          {formatEventLength(event.length || 0)}, One-on-One
        </p>
        <div className="flex justify-between  px-6  mb-2 ">
          <Link
            href={`/schedule/${event.id}`}
            className="flex items-center text-blue-400 hover:text-blue-300 group"
          >
            <FaLink className="mr-2" /> View booking page
          </Link>
        </div>
        <div className="border-t border-zinc-800 py-4">
          <div className="flex justify-between gap-4 px-6">
            <button
              className="flex items-center text-blue-400 hover:text-blue-300 group"
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
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
              <FaShare className="mr-2 h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
