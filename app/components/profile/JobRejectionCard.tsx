import { useEffect, useRef, useState } from "react";
import { RejectionInitiator } from "@prisma/client";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { convertToSentenceCase } from "../../lib/convertToSentenceCase";
import axios from "axios";
import { mutate } from "swr";

interface JobRejectionCardProps {
  company: string;
  title: string;
  rejectionId: string;
  date: Date;
  initiatedBy: RejectionInitiator;
  notes: string;
  onDelete: (rejectionId: string) => void;
}

function JobRejectionCard({
  company,
  title,
  rejectionId,
  date,
  initiatedBy,
  notes: initialNotes,
  onDelete,
}: JobRejectionCardProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDelete = () => {
    onDelete(rejectionId);
    setShowOptionsMenu(false);
  };

  const handleEditNotes = () => {
    setShowOptionsMenu(false);
    setEditingNotes(true);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(event.target.value);
  };

  const handleSubmitNotes = async () => {
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

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSubmitNotes();
    }
  };

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-md mb-4 relative">
      <div className="flex justify-between items-center mb-2">
        <span className="bg-red-500 text-white px-2 py-1 rounded-md">
          Rejected
        </span>
        <button
          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          className="inline-block text-gray-400  hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-700 rounded-lg text-xs md:text-sm p-1.5"
          aria-label="Toggle options menu"
        >
          <HiOutlineDotsHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-gray-400 text-sm">{company}</p>
          </div>
        </div>
        <div className="mb-2">
          <p className="text-gray-400 text-sm mb-1">
            {new Date(date).toLocaleDateString()}
          </p>
          <p className="text-gray-400 text-sm mb-1">
            Initiated By: {convertToSentenceCase(initiatedBy)}
          </p>
        </div>
      </div>
      {showOptionsMenu && (
        <div className="absolute top-12 right-0 mt-2 mr-2" ref={optionsMenuRef}>
          <div className="bg-white shadow rounded-lg">
            <button
              onClick={handleEditNotes}
              className="block w-full text-xs text-left px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
            >
              Edit Notes
            </button>
            <button
              onClick={handleDelete}
              className="block w-full text-xs text-left px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      <div className="mb-4">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          readOnly={!editingNotes}
          className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          rows={4}
          placeholder="Notes"
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
}

export default JobRejectionCard;