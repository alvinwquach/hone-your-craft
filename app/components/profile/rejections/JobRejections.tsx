"use client";

import { useEffect, useState } from "react";
import { RejectionInitiator } from "@prisma/client";
import { toast } from "react-toastify";
import { Skeleton } from "../../ui/InfiniteScrollClient";

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
      <div className="w-full max-w-7xl mx-auto mt-6">
        <div>
          <div className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonJobCard key={`loading-${index}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (Object.entries(groupedRejections).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2>No Rejections Found</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-6">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {Object.entries(groupedRejections).map(([date, rejections]) => (
            <div key={date} className="w-full">
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
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonJobCard() {
  return (
    <div className="relative p-4 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-shadow hover:scale-[1.01] active:scale-[0.99]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-full" />
          </div>
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
    <div className="relative p-4 bg-white rounded-xl border shadow-sm border-gray-700">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {rejection.job.company}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{rejection.job.title}</p>
          </div>
          <div className="flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Date:{" "}
                {rejection.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Initiated By:</strong>{" "}
                {rejection.initiatedBy.toLowerCase()}
              </p>
              <div className="mt-4">
                <strong className="text-sm text-gray-700">Notes:</strong>
                <textarea
                  value={editingNotes || rejection.notes}
                  onChange={(e) => onNotesChange?.(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter notes..."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDeleteRejection}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
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
    </div>
  );
}

export default JobRejections;