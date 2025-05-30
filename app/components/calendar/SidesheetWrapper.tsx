"use client";

import { useState } from "react";
import Sidesheet from "./Sidesheet";
import { FaPlus } from "react-icons/fa";
import { IoCalendarSharp } from "react-icons/io5";
import { DayOfWeek } from "@prisma/client";

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

interface SidesheetWrapperProps {
  availability: Availability;
}

export default function SidesheetWrapper({
  availability,
}: SidesheetWrapperProps) {
  const [isSidesheetOpen, setSidesheetOpen] = useState(false);

  const toggleSidesheet = () => {
    setSidesheetOpen((prev) => !prev);
  };

  return (
    <>
      {isSidesheetOpen && (
        <Sidesheet onClose={toggleSidesheet} availability={availability} />
      )}
      <div className="p-4">
        <div className="flex flex-col items-center p-4 space-y-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white p-2">
            <IoCalendarSharp className="h-16 w-16 text-blue-600" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              Create Scheduling Links with Event Types
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Define event types to share scheduling links for one-on-one
              meetings.
            </p>
          </div>
          <button
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-white  transition-colors"
            onClick={toggleSidesheet}
          >
            <FaPlus className="h-4 w-4 text-black mb-[2px]" />
            <span className="text-black">New event type</span>
          </button>
        </div>
      </div>
    </>
  );
}
