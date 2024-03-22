"use client";

import { useBoardStore } from "@/store/BoardStore";
import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import { useState } from "react";
import { HiTrash, HiLink } from "react-icons/hi";
import EditJobModal from "./EditJobModal";

type JobCardProps = {
  job: Job;
  index: number;
  id: ApplicationStatus;
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  draghandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

function JobCard({
  job,
  index,
  id,
  innerRef,
  draggableProps,
  draghandleProps,
}: JobCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const deleteJob = useBoardStore((state) => state.deleteJob);

  const handleEditModalOpen = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteJob = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    deleteJob(index, job, id);
  };

  return (
    <div>
      <div
        className="relative bg-gray-700 rounded-lg shadow-md mb-2"
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
            <p className="text-base mb-2 font-semibold ">{job.title}</p>
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
