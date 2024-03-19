import React from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface RejectionJobCardProps {
  company: string;
  title: string;
  postUrl: string;
}

function RejectionJobCard({ company, title, postUrl }: RejectionJobCardProps) {
  return (
    <div className="rounded-lg bg-gray-800 p-4 shadow-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="bg-red-500 text-white px-2 py-1 rounded-md">
          Rejected
        </span>
      </div>
      <div className="relative">
        <p className="text-white">{company}</p>
        <a
          href={postUrl}
          className="text-gray-400 text-sm hover:text-gray-200 flex items-center mt-2 absolute bottom-0 right-0"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View job posting for ${title} at ${company}`}
        >
          <HiOutlineExternalLink className="mr-3 mt-3 h-5 w-5 group-hover:text-gray-200" />
        </a>
      </div>
    </div>
  );
}

export default RejectionJobCard;
