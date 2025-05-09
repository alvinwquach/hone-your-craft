"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FaTrash, FaSave } from "react-icons/fa";

interface Job {
  company: string;
  title: string;
}

interface JobOffer {
  job: Job;
  id: string;
  offerDate: Date;
  offerDeadline: Date | null;
  salary: string;
}

interface JobOffersProps {
  jobOffers: JobOffer[];
  onEditOffer?: (offerId: string, updatedSalary: string) => void;
  onDeleteOffer?: (offerId: string) => void;
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
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
);

function JobOffers({ jobOffers, onEditOffer, onDeleteOffer }: JobOffersProps) {
  const [editingOffer, setEditingOffer] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(jobOffers.length === 0);
  }, [jobOffers]);

  const formatSalaryDisplay = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${formattedValue}`;
  };

  const formatSalaryInput = (value: string) => {
    return value.replace(/[^\d.-]/g, "");
  };

  const handleOfferChange = (id: string, value: string) => {
    const formattedValue = formatSalaryInput(value);
    const displayValue = formatSalaryDisplay(formattedValue);
    setEditingOffer((prev) => ({ ...prev, [id]: displayValue }));
  };

  const getRawSalary = (formattedValue: string) => {
    return formattedValue.replace(/[^\d.-]/g, "");
  };

  const handleSaveOffer = async (id: string) => {
    const formattedSalary = editingOffer[id] || "";
    const rawSalary = getRawSalary(formattedSalary);

    if (rawSalary) {
      try {
        await onEditOffer?.(id, rawSalary);
        toast.success("Offer Updated");
        setEditingOffer((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        toast.error("Failed To Update Offer");
        console.error("Error updating offer:", error);
      }
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?"
    );
    if (!confirmed) return;

    try {
      await onDeleteOffer?.(offerId);
      toast.success("Offer Deleted");
    } catch (error) {
      toast.error("Failed To Delete Offer");
      console.error("Error deleting offer:", error);
    }
  };

  if (isLoading && jobOffers.length === 0) {
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

  if (jobOffers.length === 0) {
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
        <p>No Job Offers Found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="space-y-6 p-6">
        {jobOffers.map((offer) => (
          <JobOfferCard
            key={offer.id}
            offer={offer}
            editingOffer={editingOffer[offer.id]}
            onEditOffer={(value) => handleOfferChange(offer.id, value)}
            onSaveOffer={() => handleSaveOffer(offer.id)}
            onDeleteOffer={() => handleDeleteOffer(offer.id)}
            formatSalaryDisplay={formatSalaryDisplay}
          />
        ))}
      </div>
    </div>
  );
}

interface JobOfferCardProps {
  offer: JobOffer;
  editingOffer?: string;
  onEditOffer?: (value: string) => void;
  onSaveOffer?: () => void;
  onDeleteOffer?: () => void;
  formatSalaryDisplay: (value: string) => string;
}

function JobOfferCard({
  offer,
  editingOffer,
  onEditOffer,
  onSaveOffer,
  onDeleteOffer,
  formatSalaryDisplay,
}: JobOfferCardProps) {
  return (
    <div className="p-6 rounded-xl border border-zinc-800 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">
              {offer.job.company}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{offer.job.title}</p>
          </div>
          <div className="flex-1">
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                Offer Received: {format(offer.offerDate, "MM/dd/yy @ h:mm a")}
              </p>
              <p>
                Offer Deadline:{" "}
                {offer.offerDeadline
                  ? format(offer.offerDeadline, "MM/dd/yy @ h:mm a")
                  : "No deadline set"}
              </p>
              <div className="mt-4">
                <label className="text-sm text-gray-400">Notes:</label>
                <textarea
                  value={editingOffer || ""}
                  onChange={(e) => onEditOffer?.(e.target.value)}
                  className="w-full mt-2 p-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter notes..."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDeleteOffer}
            className="group relative flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700"
          >
            <FaTrash className="w-5 h-5 text-gray-400" />
            <span className="hidden md:inline-block text-sm whitespace-nowrap ml-2">
              Delete
            </span>
            <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-zinc-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
              Delete
              <div className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700" />
            </span>
          </button>
          <button
            onClick={onSaveOffer}
            className="group relative flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors border border-zinc-700"
          >
            <FaSave className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline-block text-sm whitespace-nowrap">
              Save
            </span>
            <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-zinc-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
              Save
              <div className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobOffers;
