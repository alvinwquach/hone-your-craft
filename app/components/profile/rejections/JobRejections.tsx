"use client";
import { useState } from "react";
import { RejectionInitiator } from "@prisma/client";

interface Job {
  id: string;
  company: string;
  title: string;
  postUrl: string;
}

interface JobRejection {
  id: string;
  job: Job;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
}

interface JobRejectionsProps {
  groupedRejections: Record<string, JobRejection[]>;
  onEditRejection?: (id: string, notes: string) => void;
  onDeleteRejection?: (id: string) => void;
}

function JobRejections({
  groupedRejections,
  onEditRejection,
  onDeleteRejection,
}: JobRejectionsProps) {
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const handleNotesChange = (id: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveNotes = (id: string) => {
    if (editingNotes[id] !== undefined) {
      onEditRejection?.(id, editingNotes[id]);
      setEditingNotes((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  if (Object.entries(groupedRejections).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-200">
        <h2>No Rejections Found</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {Object.entries(groupedRejections).map(([date, rejections]) => (
        <div key={date} className="w-full">
          <h2 className="text-lg font-semibold text-gray-100 my-4">
            {date === "No Date"
              ? "No Date Specified"
              : new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </h2>
          {rejections.map((rejection) => (
            <div
              key={rejection.id}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm bg-opacity-80"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {rejection.job.company}
                  </h3>
                </div>
                <div className="text-sm text-gray-300">
                  {rejection.date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                {rejection.job.title}
              </p>
              <div className="text-sm text-gray-300 mb-4">
                <strong>Initiated By:</strong>{" "}
                {rejection.initiatedBy.toLowerCase()}
              </div>
              <div className="mb-4">
                <strong>Notes:</strong>
                <textarea
                  value={editingNotes[rejection.id] || rejection.notes}
                  onChange={(e) =>
                    handleNotesChange(rejection.id, e.target.value)
                  }
                  className="w-full mt-2 bg-transparent text-gray-200 border border-gray-700 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => onDeleteRejection?.(rejection.id)}
                  className="px-4 py-2 border border-gray-300 text-white rounded-md"
                >
                  Delete Rejection
                </button>
                <button
                  type="submit"
                  onClick={() => handleSaveNotes(rejection.id)}
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default JobRejections;
