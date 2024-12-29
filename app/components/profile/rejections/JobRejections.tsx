import { format } from "date-fns";
import { RejectionInitiator } from "@prisma/client";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";
import { useState } from "react";

interface Job {
  company: string;
  title: string;
}

interface JobRejection {
  job: Job;
  id: string;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
}

interface JobRejectionsProps {
  jobRejections: JobRejection[];
  onEditRejection: (id: string, notes: string) => void;
  onDeleteRejection: (id: string) => void;
}

function JobRejections({
  jobRejections,
  onEditRejection,
  onDeleteRejection,
}: JobRejectionsProps) {
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>(
    {}
  );

  const handleNotesChange = (id: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveNotes = (id: string) => {
    if (editingNotes[id] !== undefined) {
      onEditRejection(id, editingNotes[id]);
      setEditingNotes((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  if (jobRejections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-200">
        <h2>No Rejections Found</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {jobRejections.map((rejection) => (
        <div
          key={rejection.id}
          className="bg-zinc-800 p-6 rounded-lg shadow-md w-full"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {rejection.job.company}
              </h3>
            </div>
            <div className="text-sm text-gray-300">
              {format(new Date(rejection.date), "MM/dd/yy @ h:mm a")}
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">{rejection.job.title}</p>
          <div className="text-sm text-gray-300 mb-4">
            <strong>Initiated By:</strong>{" "}
            {convertToSentenceCase(rejection.initiatedBy)}
          </div>
          <div className="mb-4">
            <strong>Notes:</strong>
            <textarea
              value={editingNotes[rejection.id] || rejection.notes}
              onChange={(e) => handleNotesChange(rejection.id, e.target.value)}
              className="w-full mt-2 bg-transparent text-gray-200 border border-gray-700 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => onDeleteRejection(rejection.id)}
              className="px-4 py-2 border border-gray-300 text-white rounded-md "
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
  );
}

export default JobRejections;
