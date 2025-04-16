"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Skeleton } from "../ui/skeleton";

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

  if (jobOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2>No Job Offers Found</h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-6">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
    <div className="relative p-4 bg-white rounded-xl border shadow-sm border-gray-700">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {offer.job.company}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{offer.job.title}</p>
          </div>
          <div className="flex-1 ml-0 md:ml-4 mb-4 md:mb-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Offer Received: {format(offer.offerDate, "MM/dd/yy @ h:mm a")}
              </p>
              <p className="text-sm text-gray-600">
                Offer Deadline:{" "}
                {offer.offerDeadline
                  ? format(offer.offerDeadline, "MM/dd/yy @ h:mm a")
                  : "No deadline set"}
              </p>
              <div className="mt-4">
                <strong className="text-sm text-gray-700">Salary:</strong>
                <input
                  type="text"
                  value={editingOffer || formatSalaryDisplay(offer.salary)}
                  onChange={(e) => onEditOffer?.(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter salary"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDeleteOffer}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete Offer
            </button>
            <button
              onClick={onSaveOffer}
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

export default JobOffers;