import React, { useRef, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";
import { HiCurrencyDollar } from "react-icons/hi";

interface JobOffer {
  id: string;
  company: string;
  title: string;
  salary: string;
  offerId: string;
  offerDate: Date;
  offerDeadline: Date;
  job: {
    id: string;
    userId: string;
    company: string;
    title: string;
    description: string;
    industry: string | null;
    location: string | null;
    workLocation: string | null;
    updatedAt: string;
    postUrl: string;
    offer: {
      id: string;
      userId: string;
      jobId: string;
      offerDate: Date;
      offerDeadline: Date;
      salary: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

interface JobOffersProps {
  jobOffers: JobOffer[];
  onDelete: (offerId: string) => void;
}

function JobOffers({ jobOffers, onDelete }: JobOffersProps) {
  const [editingSalary, setEditingSalary] = useState(false);
  const [salary, setSalary] = useState("");
  const salaryInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (offerId: string) => {
    onDelete(offerId);
  };

  const handleEditSalary = () => {
    setEditingSalary(true);
    // Focus on the input field when editing starts
    if (salaryInputRef.current) {
      salaryInputRef.current.focus();
    }
  };

  const handleSaveSalary = async (offerId: string) => {
    try {
      await axios.put(`/api/offer/${offerId}`, { salary });
      setEditingSalary(false);
      mutate("api/offers");
    } catch (error) {
      console.error("Error updating salary:", error);
    }
  };

  const handleKeyPress = async (
    event: React.KeyboardEvent,
    offerId: string
  ) => {
    if (event.key === "Enter") {
      await handleSaveSalary(offerId);
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove non-numeric characters and parse the numeric value
    const numericValue = parseFloat(inputValue.replace(/[^\d.]/g, ""));

    // Check if the parsed numeric value is a valid number
    if (!isNaN(numericValue)) {
      // Format the numeric value with commas for thousands separators
      const formattedNumericValue = numericValue.toLocaleString();
      setSalary(formattedNumericValue);
    }
  };
  if (jobOffers.length == 0) {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-400">
          <thead className="text-xs uppercase bg-gray-900 text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Offer Date
              </th>
              <th scope="col" className="px-6 py-3">
                Offer Deadline
              </th>
              <th scope="col" className="px-6 py-3">
                Company
              </th>
              <th scope="col" className="px-6 py-3">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3">
                Salary
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
              Offer Date
            </th>
            <th scope="col" className="px-6 py-3">
              Offer Deadline
            </th>
            <th scope="col" className="px-6 py-3">
              Company
            </th>
            <th scope="col" className="px-6 py-3">
              Job Title
            </th>
            <th scope="col" className="px-6 py-3">
              Salary
            </th>
            <th scope="col" className="px-6 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {jobOffers.map((offer) => (
            <tr className="border-b bg-gray-800 border-gray-700">
              <td className="px-6 py-4">
                {format(offer.offerDate, "MM/dd/yy h:mm a")}
              </td>
              <td className="px-6 py-4">
                {format(offer.offerDeadline, "MM/dd/yy h:mm a")}
              </td>
              <td className="px-6 py-4">{offer.job.company}</td>
              <td className="px-6 py-4">{offer.job.title}</td>
              <td className="px-6 py-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <HiCurrencyDollar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    value={salary}
                    type="text"
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5 pl-10 ${
                      editingSalary ? "border-gray-300" : "border-none"
                    } dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                    readOnly={!editingSalary}
                    onChange={handleSalaryChange}
                    onKeyPress={(event) => handleKeyPress(event, offer.offerId)}
                    ref={salaryInputRef}
                  />
                </div>
              </td>

              <td className="px-6 py-4 ">
                <button
                  onClick={handleEditSalary}
                  className="mr-2 font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(offer.offerId)}
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

export default JobOffers;
