import React from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface OfferJobCardProps {
  company: string;
  title: string;
  postUrl: string;
  salary: string;
}

function OfferJobCard({ company, title, postUrl, salary }: OfferJobCardProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="bg-green-500 text-white px-2 py-1 rounded-md">
          Offer
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-white">{company}</p>
        <a
          href={postUrl}
          className="text-gray-400 text-sm hover:text-gray-200 flex items-center mt-2"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View job posting for ${title} at ${company}`}
        >
          <HiOutlineExternalLink className="mr-3 h-5 w-5" />
        </a>
      </div>
      <div className="flex justify-center">
        <p className="text-green-400">${salary}</p>
      </div>
    </div>
  );
}

export default OfferJobCard;
