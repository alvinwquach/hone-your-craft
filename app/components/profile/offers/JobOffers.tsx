"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";

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

  if (jobOffers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-200">
        <h2>No Job Offers Found</h2>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {jobOffers.map((offer) => (
        <div
          key={offer.id}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm bg-opacity-80"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {offer.job.company}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">{offer.job.title}</p>
          <div className="text-sm text-gray-300">
            <strong>Offer Received:</strong>{" "}
            {format(offer.offerDate, "MM/dd/yy @ h:mm a")}
          </div>
          <div className="text-sm text-gray-300 mb-4">
            <strong>Offer Deadline:</strong>{" "}
            {offer.offerDeadline
              ? format(offer.offerDeadline, "MM/dd/yy @ h:mm a")
              : "No deadline set"}
          </div>
          <div className="mb-4">
            <strong>Salary:</strong>
            <input
              type="text"
              value={
                editingOffer[offer.id] || formatSalaryDisplay(offer.salary)
              }
              onChange={(e) => handleOfferChange(offer.id, e.target.value)}
              className="w-full mt-2 bg-transparent text-gray-200 border border-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handleDeleteOffer(offer.id)}
              className="px-4 py-2 border border-gray-300 text-white rounded-md hover:bg-gray-700"
            >
              Delete Offer
            </button>
            <button
              onClick={() => handleSaveOffer(offer.id)}
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

export default JobOffers;
