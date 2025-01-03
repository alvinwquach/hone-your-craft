import { format } from "date-fns";
import { useState } from "react";

interface Job {
  company: string;
  title: string;
}

interface JobOffer {
  job: Job;
  id: string;
  offerDate: Date;
  offerDeadline: Date;
  salary: string;
}

interface JobOffersProps {
  jobOffers: JobOffer[];
  onEditOffer: (offerId: string, updatedSalary: string) => void;
  onDeleteOffer: (offerId: string) => void;
}

function JobOffers({ jobOffers, onEditOffer, onDeleteOffer }: JobOffersProps) {
  const [editingOffer, setEditingOffer] = useState<{ [key: string]: string }>(
    {}
  );

  jobOffers.sort(
    (a, b) =>
      new Date(a.offerDeadline).getTime() - new Date(b.offerDeadline).getTime()
  );

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

  const handleSaveOffer = (id: string) => {
    const formattedSalary = editingOffer[id] || "";
    const rawSalary = getRawSalary(formattedSalary);

    if (rawSalary) {
      onEditOffer(id, rawSalary);
      setEditingOffer((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
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
          className="bg-zinc-800 p-6 rounded-lg shadow-md w-full"
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
            {format(new Date(offer.offerDate), "MM/dd/yy @ h:mm a")}
          </div>
          <div className="text-sm text-gray-300 mb-4">
            <strong>Offer Deadline:</strong>{" "}
            {format(new Date(offer.offerDeadline), "MM/dd/yy @ h:mm a")}
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
              onClick={() => onDeleteOffer(offer.id)}
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
