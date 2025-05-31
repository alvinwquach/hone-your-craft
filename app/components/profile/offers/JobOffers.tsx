"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FaTrash, FaSave, FaBriefcase } from "react-icons/fa";

interface Job {
  company: string;
  title: string;
  id: string;
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
    className={`bg-neutral-900 motion-safe:animate-pulse rounded ${className}`}
  />
);

const SkeletonJobCard = () => (
  <div className="bg-neutral-900 transition-all duration-200 rounded-lg border-zinc-700">
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


function JobOffers({ jobOffers, onEditOffer, onDeleteOffer }: JobOffersProps) {
  const [editingOffer, setEditingOffer] = useState<Record<string, string>>({});

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

  // Group offers by date
  const groupedOffers = jobOffers.reduce<Record<string, JobOffer[]>>(
    (acc, offer) => {
      const dateStr = format(offer.offerDate, "yyyy-MM-dd");
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(offer);
      return acc;
    },
    {}
  );

  if (jobOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <FaBriefcase className="w-12 h-12 mb-4 text-gray-400" />
        <p>No offers found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-neutral-900 border border-zinc-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          {Object.entries(groupedOffers).map(([date, offers]) => (
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
                {offers.map((offer) => (
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
          ))}
        </div>
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
    <div className="transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 border-b border-zinc-800">
        <div className="flex-shrink-0">
          <div className="text-sm text-gray-400 mb-2 font-medium">
            {format(offer.offerDate, "hh:mm aa")}
          </div>
          <div className="pb-2">
            <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
              {offer.job.company}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {offer.job.title}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-start text-sm text-gray-400 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium">Salary:</span>
            <span>
              {editingOffer ? editingOffer : formatSalaryDisplay(offer.salary)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Deadline:</span>
            <span>
              {offer.offerDeadline
                ? format(offer.offerDeadline, "MM/dd/yyyy")
                : "No deadline set"}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Notes:</label>
            <textarea
              value={editingOffer || ""}
              onChange={(e) => onEditOffer?.(e.target.value)}
              className="w-full mt-2 p-3 bg-neutral-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter notes..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end flex-col md:flex-row gap-2 md:gap-4">
          <button
            onClick={onDeleteOffer}
            className="group relative flex items-center justify-center w-10 h-10 md:w-28 md:h-10 rounded-full md:rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-700"
          >
            <FaTrash className="w-5 h-5 text-gray-400" />
            <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-zinc-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity md:hidden">
              Delete
              <div
                className="absolute top-1/2 left-[-4px] transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-zinc-700"
                data-popper-arrow
              />
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
