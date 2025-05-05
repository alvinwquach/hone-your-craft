"use client";

import { useEffect, useState } from "react";
import { RejectionInitiator } from "@prisma/client";
import { toast } from "react-toastify";
import { FaTrash, FaSave } from "react-icons/fa";

interface Job {
  id: string;
  company: string;
  title: string;
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

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`bg-zinc-800 motion-safe:animate-pulse rounded ${className}`}
  />
);

const SkeletonJobCard = () => (
  <div className="bg-zinc-900 transition-all duration-200">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-zinc-800">
      <div className="flex-shrink-0">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-4 w-48 mb-2" />
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  </div>
);

const DateSectionSkeleton = () => (
  <div className="mb-8">
    <div className="sticky top-0 z-10 bg-zinc-900 pb-2 mb-4">
      <Skeleton className="h-8 w-1/3 mx-4" />
      <hr className="border-zinc-800" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  </div>
);

function JobRejections({
  groupedRejections,
  onEditRejection,
  onDeleteRejection,
}: JobRejectionsProps) {
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [groupedRejections]);

  const handleNotesChange = (id: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveNotes = async (id: string) => {
    const notes = editingNotes[id];
    if (notes !== undefined) {
      try {
        await onEditRejection?.(id, notes);
        toast.success("Notes updated successfully");
        setEditingNotes((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        toast.error("Failed to update notes");
        console.error("Error updating notes:", error);
      }
    }
  };

  const handleDeleteRejection = async (rejectionId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rejection?"
    );
    if (!confirmed) return;

    try {
      await onDeleteRejection?.(rejectionId);
      toast.success("Rejection deleted successfully");
    } catch (error) {
      toast.error("Failed to delete rejection");
      console.error("Error deleting rejection:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6">
        <DateSectionSkeleton />
      </div>
    );
  }

  if (Object.entries(groupedRejections).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg
          className="w-12 h-12 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No rejections found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-black border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          {Object.entries(groupedRejections).map(([date, rejections]) => (
            <div key={date} className="mb-8 last:mb-0">
              <div className="sticky top-0 z-10 pb-2 mb-4">
                <h2 className="text-xl font-semibold text-white px-4 mb-2">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <hr className="border-zinc-800" />
              </div>
              <div className="space-y-4">
                {rejections.map((rejection) => (
                  <JobRejectionCard
                    key={rejection.id}
                    rejection={rejection}
                    editingNotes={editingNotes[rejection.id]}
                    onNotesChange={(value) =>
                      handleNotesChange(rejection.id, value)
                    }
                    onSaveNotes={() => handleSaveNotes(rejection.id)}
                    onDeleteRejection={() =>
                      handleDeleteRejection(rejection.id)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface JobRejectionCardProps {
  rejection: JobRejection;
  editingNotes?: string;
  onNotesChange?: (value: string) => void;
  onSaveNotes?: () => void;
  onDeleteRejection?: () => void;
}

function JobRejectionCard({
  rejection,
  editingNotes,
  onNotesChange,
  onSaveNotes,
  onDeleteRejection,
}: JobRejectionCardProps) {
  return (
    <div className="transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-zinc-800">
        <div className="flex flex-col flex-shrink-0">
          <div className="text-sm text-gray-400 mb-2 font-medium">
            {new Date(rejection.date).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="pb-2">
            <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
              {rejection.job.company}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {rejection.job.title}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-start text-sm text-gray-400 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Initiated By:</span>
            <span>{rejection.initiatedBy.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Date:</span>
            <span>
              {rejection.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="mt-4">
              <label className="text-sm text-gray-400">Notes:</label>
              <textarea
                value={
                  editingNotes !== undefined ? editingNotes : rejection.notes
                }
                onChange={(e) => onNotesChange?.(e.target.value)}
                className="w-full mt-2 p-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Enter notes..."
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end flex-col md:flex-row gap-2 md:gap-4">
          <button
            onClick={onDeleteRejection}
            className="group relative flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700"
          >
            <FaTrash className="w-5 h-5 text-gray-400" />
            <span className="hidden md:inline-block text-sm whitespace-nowrap ml-2">
              Delete
            </span>
            <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-zinc-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
              Delete
              <div
                className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700"
                data-popper-arrow
              />
            </span>
          </button>
          <button
            onClick={onSaveNotes}
            className="group relative flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors border border-zinc-700"
          >
            <FaSave className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline-block text-sm whitespace-nowrap">
              Save
            </span>
            <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-zinc-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
              Save
              <div
                className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700"
                data-popper-arrow
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobRejections;