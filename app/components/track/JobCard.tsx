"use client";

import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import axios from "axios";
import { useState } from "react";
import { HiTrash, HiLink } from "react-icons/hi";
import { mutate } from "swr";
import EditJobModal from "./EditJobModal";
import { toast } from "react-toastify";

type JobCardProps = {
  job: Job;
  index: number;
  id: ApplicationStatus;
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  draghandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onDeleteJob: (job: Job) => void;
};

function JobCard({
  job,
  index,
  id,
  innerRef,
  draggableProps,
  draghandleProps,
  onDeleteJob,
}: JobCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleEditModalOpen = () => {
    setIsEditModalOpen(true);
  };

  const truncateTitle = (title: string, maxLength: number) => {
    let truncatedTitle = title;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    switch (true) {
      case screenWidth === 1024 && screenHeight === 1366: // iPad Pro
        truncatedTitle = title.length > 18 ? `${title.slice(0, 17)}...` : title;
        break;
      case screenWidth === 768 && screenHeight === 1024: // iPad Mini
        truncatedTitle = title.length > 12 ? `${title.slice(0, 11)}...` : title;
        break;
      case screenWidth === 820 && screenHeight === 1180: // iPad Air
        truncatedTitle = title.length > 18 ? `${title.slice(0, 13)}...` : title;
        break;
      case screenWidth === 912 && screenHeight === 1368: // Surface Pro 7
        truncatedTitle = title.length > 16 ? `${title.slice(0, 15)}...` : title;
        break;
      case screenWidth === 853 && screenHeight === 1280: // Asus Zenbook Fold
        truncatedTitle = title.length > 14 ? `${title.slice(0, 13)}...` : title;
        break;
      case screenWidth === 1024 && screenHeight === 600: // Nest Hub
        truncatedTitle = title.length > 18 ? `${title.slice(0, 17)}...` : title;
        break;
      case screenWidth === 1280 && screenHeight === 800: // Nest Hub Max
        truncatedTitle = title.length > 26 ? `${title.slice(0, 25)}...` : title;
        break;
      default:
        truncatedTitle =
          title.length > maxLength ? `${title.slice(0, maxLength)}...` : title;
    }

    return truncatedTitle;
  };

  const handleDeleteJob = (event: React.MouseEvent<HTMLButtonElement>) => {
    onDeleteJob(job);
  };

  return (
    <div>
      <div
        className="relative bg-gray-700 rounded-lg shadow-md mb-2 "
        {...draggableProps}
        {...draghandleProps}
        ref={innerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleEditModalOpen}
        tabIndex={0}
        role="button"
      >
        {isHovering && (
          <div className="absolute inset-0 border-2 border-sky-600 rounded-lg pointer-events-none"></div>
        )}
        <div className="p-4 sm:p-2 flex justify-between items-center text-gray-300 relative">
          <div>
            <p className="text-sm mb-2 font-semibold">
              {truncateTitle(job.title, 27)}
            </p>
            <span className="text-sm">{job.company}</span>
          </div>
          <div className="absolute top-0 right-0 mr-2 mt-2">
            {isHovering && (
              <button
                className="text-gray-400 hover:text-gray-500 border-2 p-0.5 rounded-lg"
                onClick={handleDeleteJob}
              >
                <HiTrash className="h-4 w-4" />
              </button>
            )}
          </div>
          {isHovering && (
            <div className="absolute bottom-0 right-0 flex flex-col mr-2 mb-2">
              <a
                href={job.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View job posting for ${job.title} at ${job.company}`}
                className=" text-gray-400 hover:text-gray-500 border-2 p-0.5 rounded-lg"
                onClick={(event) => event.stopPropagation()}
              >
                <HiLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
      {isEditModalOpen && (
        <EditJobModal
          isOpen={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          job={job}
          id={id}
        />
      )}
    </div>
  );
}

export default JobCard;
