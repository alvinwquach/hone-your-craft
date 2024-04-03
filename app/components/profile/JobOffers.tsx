import React, { useRef, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { mutate } from "swr";
import { HiCurrencyDollar } from "react-icons/hi";

interface JobOffersProps {
  company: string;
  title: string;
  salary: string;
  offerId: string;
  offerDate: Date;
  offerDeadline: Date;
  onDelete: (offerId: string) => void;
}

function JobOffers({
  company,
  title,
  salary: initialSalary,
  offerId,
  offerDate,
  offerDeadline,
  onDelete,
}: JobOffersProps) {
  const [editingSalary, setEditingSalary] = useState(false);
  const [salary, setSalary] = useState(initialSalary);
  const salaryInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    onDelete(offerId);
  };

  const handleEditSalary = () => {
    setEditingSalary(true);
    // Focus on the input field when editing starts
    if (salaryInputRef.current) {
      salaryInputRef.current.focus();
    }
  };

  const handleSaveSalary = async () => {
    try {
      await axios.put(`/api/offer/${offerId}`, { salary });
      setEditingSalary(false);
      mutate("api/offers");
    } catch (error) {
      console.error("Error updating salary:", error);
    }
  };

  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      await handleSaveSalary();
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
              Title
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
          <tr key={offerId} className="border-b bg-gray-800 border-gray-700">
            <td className="px-6 py-4">
              {format(offerDate, "MM/dd/yy h:mm a")}
            </td>
            <td className="px-6 py-4">
              {format(offerDeadline, "MM/dd/yy h:mm a")}
            </td>
            <td className="px-6 py-4">{company}</td>
            <td className="px-6 py-4">{title}</td>
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
                  onKeyPress={handleKeyPress}
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
                onClick={handleDelete}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default JobOffers;
