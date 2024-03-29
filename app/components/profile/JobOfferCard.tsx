import React, { useEffect, useRef, useState } from "react";
import { HiCurrencyDollar, HiOutlineDotsHorizontal } from "react-icons/hi";
import axios from "axios";
import { mutate } from "swr";

interface JobOfferCardProps {
  company: string;
  title: string;
  salary: string;
  offerId: string;
  onDelete: (offerId: string) => void;
}

function JobOfferCard({
  company,
  title,
  salary: initialSalary,
  offerId,
  onDelete,
}: JobOfferCardProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingSalary, setEditingSalary] = useState(false);
  const [salary, setSalary] = useState(initialSalary);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const salaryInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    onDelete(offerId);
    setShowOptionsMenu(false);
  };

  const handleEditSalary = () => {
    setShowOptionsMenu(false);
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

  useEffect(() => {
    const handleClickOutsideMenu = (e: MouseEvent) => {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(e.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-md mb-4 relative">
      <div className="flex justify-between items-center mb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <HiCurrencyDollar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            value={salary}
            type="text"
            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10 ${
              editingSalary ? "border-gray-300" : "border-none"
            } dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
            readOnly={!editingSalary}
            onChange={handleSalaryChange}
            onKeyPress={handleKeyPress}
            ref={salaryInputRef}
          />
        </div>
        <button
          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          className="inline-block text-gray-400  hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-700 rounded-lg text-xs md:text-sm p-1.5"
          aria-label="Toggle options menu"
        >
          <HiOutlineDotsHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-white">{company}</p>
        {showOptionsMenu && (
          <div
            className="absolute top-12 right-0 mt-2 mr-5"
            ref={optionsMenuRef}
          >
            <div className="bg-white shadow rounded-lg">
              <button
                onClick={handleEditSalary}
                className="block w-full text-xs text-left px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
              >
                Edit Salary
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-xs text-left px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="bg-green-500 text-white px-2 py-1 rounded-md">
          Offer
        </span>
      </div>
    </div>
  );
}

export default JobOfferCard;
