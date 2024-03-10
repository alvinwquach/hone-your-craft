"use client";

import { useBoardStore } from "@/store/BoardStore";
import {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import { useState } from "react";
import { HiTrash, HiLink } from "react-icons/hi";

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
  const deleteJob = useBoardStore((state) => state.deleteJob);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative bg-zinc-800 rounded-lg shadow-md mb-8"
      {...draggableProps}
      {...draghandleProps}
      ref={innerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering && (
        <div className="absolute inset-0 border-2 border-sky-600 rounded-lg pointer-events-none"></div>
      )}
      <div className="p-4 sm:p-2 flex justify-between items-center text-gray-300 relative">
        <div>
          <p className="text-base mb-2 font-semibold">{job.title}</p>

          <span className="text-sm">{job.company}</span>
        </div>
        {isHovering && (
          <div className="absolute top-0 right-0 flex flex-col mr-2 mt-2">
            <button
              className="text-red-500 hover:text-red-600 border-2 p-0.5 rounded-lg mb-1"
              onClick={() => deleteJob(index, job, id)}
            >
              <HiTrash className="h-4 w-4" />
            </button>
            <a
              href={job.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 border-2 p-0.5 rounded-lg"
            >
              <HiLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobCard;
