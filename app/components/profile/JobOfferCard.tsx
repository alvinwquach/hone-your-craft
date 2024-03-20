import React, { useEffect, useRef, useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

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
  salary,
  offerId,
  onDelete,
}: JobOfferCardProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  const handleDelete = () => {
    onDelete(offerId);
    setShowOptionsMenu(false);
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
        <p className="text-green-400">${salary}</p>
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
            className="absolute top-8 right-0 mt-2 mr-2"
            ref={optionsMenuRef}
          >
            <div className="bg-white shadow rounded-lg">
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
