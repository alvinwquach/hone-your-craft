import React, { useRef, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";
import { RejectionInitiator } from "@prisma/client";
import { convertToSentenceCase } from "@/app/lib/convertToSentenceCase";

interface Job {
  company: string;
  title: string;
}

interface JobRejection {
  job: Job;
  rejectionId: string;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
}

interface JobRejectionsProps {
  jobRejections: JobRejection[];
  onDelete: (rejectionId: string) => void;
}
function JobRejections({ jobRejections, onDelete }: JobRejectionsProps) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = (rejectionId: string) => {
    onDelete(rejectionId);
  };

  const handleEditNotes = () => {
    setEditingNotes(true);
    if (notesRef.current) {
      notesRef.current.focus();
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
  };

  const handleSubmitNotes = async (rejectionId: string) => {
    try {
      await axios.put(`/api/rejection/${rejectionId}`, {
        notes: notes,
      });
      setEditingNotes(false);
      mutate("/api/rejections");
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleKeyPress = async (
    event: React.KeyboardEvent,
    rejectionId: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSubmitNotes(rejectionId);
    }
  };

  if (jobRejections.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rejection Date
              </th>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3">
                Initiated By
              </th>
              <th scope="col" className="px-6 py-3">
                Notes
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
              <td className="px-6 py-4">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-400">
        <thead className="text-xs uppercase bg-gray-900 text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Rejection Date
            </th>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Job Title
            </th>
            <th scope="col" className="px-6 py-3">
              Initiated By
            </th>
            <th scope="col" className="px-6 py-3">
              Notes
            </th>
            <th scope="col" className="px-6 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {jobRejections.map((rejection) => (
            <tr
              key={rejection.rejectionId}
              className="border-b bg-gray-800 border-gray-700"
            >
              <td className="px-6 py-4">
                {format(rejection.date, "MM/dd/yy h:mm a")}
              </td>
              <td className="px-6 py-4">{rejection.job.company}</td>
              <td className="px-6 py-4">{rejection.job.title}</td>
              <td className="px-6 py-4">
                {convertToSentenceCase(rejection.initiatedBy)}
              </td>
              <td className="px-6 py-4">
                <div className="relative">
                  <textarea
                    ref={notesRef}
                    value={notes}
                    onChange={handleNotesChange}
                    readOnly={!editingNotes}
                    className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    rows={4}
                    placeholder="Notes"
                    onKeyPress={(event) =>
                      handleKeyPress(event, rejection.rejectionId)
                    }
                  />
                </div>
              </td>
              <td className="px-6 py-4 ">
                <button
                  onClick={handleEditNotes}
                  className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rejection.rejectionId)}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobRejections;
