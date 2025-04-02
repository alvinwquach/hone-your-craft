"use client";

import { useState } from "react";
import Sidesheet from "./Sidesheet";
import { FaPlus } from "react-icons/fa";
import { IoCalendarSharp } from "react-icons/io5";

export default function SidesheetWrapper() {
  const [isSidesheetOpen, setSidesheetOpen] = useState(false);

  const toggleSidesheet = () => {
    setSidesheetOpen((prev) => !prev);
  };

  return (
    <>
      {isSidesheetOpen && <Sidesheet onClose={toggleSidesheet} />}
      <div className="p-4">
        <div className="flex flex-col items-center p-4 space-y-4">
          <IoCalendarSharp className="h-24 w-24 rounded-full p-2 bg-white text-blue-700" />
          <p className="text-gray-700 font-semibold text-xl">
            Create scheduling links with event types
          </p>
          <button
            className="bg-blue-700 px-4 py-2 rounded-full"
            onClick={toggleSidesheet}
          >
            <FaPlus className="h-4 w-4 inline mr-2 mb-1" />
            <span className="text-white">New event type</span>
          </button>
        </div>
      </div>
    </>
  );
}
