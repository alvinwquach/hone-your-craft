"use client";
import { FaCalendar } from "react-icons/fa";

export default function MeetingCalendarDownloadButton() {
  const handleDownload = async () => {
    try {
      const response = await fetch("/api/events/ical", {
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
      link.download = `events-${Date.now()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading calendar:", error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handleDownload}
        className="md:ml-auto inline-flex items-center px-3 py-1.5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 text-white font-semibold text-lg rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        <FaCalendar className="mr-3 text-xl" />
        iCal
      </button>
    </div>
  );
}
