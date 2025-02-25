"use client";

import { FaCalendar } from "react-icons/fa";

export default function InterviewCalendarDownloadButton() {
  const handleDownload = async () => {
    try {
      const response = await fetch("/api/interviews/ical", {
        method: "GET",
        headers: {
          Accept: "text/calendar",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate calendar");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `interviews-${Date.now()}.ics`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading calendar:", error);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleDownload}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold text-lg rounded-xl shadow-md hover:from-blue-400 hover:to-teal-400 transition duration-300 ease-in-out transform hover:scale-105"
      >
        <FaCalendar className="mr-3 text-xl" />
        Sync to Calendar
      </button>
    </div>
  );
}
