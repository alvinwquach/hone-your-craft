"use client";

import { useEffect, useState } from "react";
import { RejectionInitiator } from "@prisma/client";
import { toast } from "react-toastify";

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

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`bg-zinc-800 motion-safe:animate-pulse rounded ${className}`}
  />
);

const SkeletonJobCard = () => (
  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-shrink-0">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
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
    setIsLoading(Object.entries(groupedRejections).length === 0);
  }, [groupedRejections]);

  const handleNotesChange = (id: string, value: string) => {
    setEditingNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveNotes = async (id: string) => {
    const notes = editingNotes[id];
    if (notes !== undefined) {
      try {
        await onEditRejection?.(id, notes);
        toast.success("Notes Updated");
        setEditingNotes((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        toast.error("Failed To Update Notes");
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
      toast.success("Rejection Deleted");
    } catch (error) {
      toast.error("Failed To Delete Rejection");
      console.error("Error deleting rejection:", error);
    }
  };

  if (isLoading && Object.entries(groupedRejections).length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-6">
        <div className="space-y-6 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonJobCard key={`loading-${index}`} />
          ))}
        </div>
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
        <p>No Rejections Found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      {Object.entries(groupedRejections).map(([date, rejections]) => (
        <div key={date} className="mb-8 last:mb-0">
          <div className="sticky top-0 z-10 bg-zinc-900 pb-2 mb-4">
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
          <div className="space-y-6 p-6">
            {rejections.map((rejection) => (
              <JobRejectionCard
                key={rejection.id}
                rejection={rejection}
                editingNotes={editingNotes[rejection.id]}
                onNotesChange={(value) =>
                  handleNotesChange(rejection.id, value)
                }
                onSaveNotes={() => handleSaveNotes(rejection.id)}
                onDeleteRejection={() => handleDeleteRejection(rejection.id)}
              />
            ))}
          </div>
        </div>
      ))}
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
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">
              {rejection.job.company}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{rejection.job.title}</p>
          </div>
          <div className="flex-1">
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                Date:{" "}
                {rejection.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p>Initiated By: {rejection.initiatedBy.toLowerCase()}</p>
              <div className="mt-4">
                <label className="text-sm text-gray-400">Notes:</label>
                <textarea
                  value={editingNotes || rejection.notes}
                  onChange={(e) => onNotesChange?.(e.target.value)}
                  className="w-full mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter notes..."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDeleteRejection}
            className="px-4 py-2 text-sm font-medium text-red-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Delete Rejection
          </button>
          <button
            onClick={onSaveNotes}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobRejections;