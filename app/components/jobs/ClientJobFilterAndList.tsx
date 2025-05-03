"use client";

import { Fragment, useState, useEffect } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { Menu, Transition } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "../profile/ui/Skeleton";

const workLocationLabels = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

enum JobPostingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  FILLED = "FILLED",
  COMPLETED = "COMPLETED",
}

interface Application {
  id: string;
  candidate: { name: string; email: string };
  status: string;
  appliedAt: string;
  resumeUrl: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workLocation: keyof typeof workLocationLabels;
  status: JobPostingStatus;
  createdAt: string;
  applications: Application[];
}

interface JobFilterAndListProps {
  filter: "all" | "drafts" | "posted" | "pending" | "accepted" | "rejected";
  filteredJobs: Job[];
  onFilterChange: (
    filter: "all" | "drafts" | "posted" | "pending" | "accepted" | "rejected"
  ) => void;
  handleDeleteJobPosting: (jobId: string) => void;
  handleAcceptApplication: (id: string) => void;
  handleRejectApplication: (id: string) => void;
  getApplicationStatusDetails: (status: string) => {
    className: string;
    displayText: string;
  };
}

export function JobFilterAndListSkeleton({
  jobsLength,
}: {
  jobsLength: number;
}) {
  return (
    <div className="w-full lg:w-1/2 rounded-lg shadow-lg border border-zinc-700">
      <div className="bg-zinc-900 p-6">
        <Skeleton className="h-6 w-24 mb-4 bg-zinc-700" />
        <div className="flex flex-wrap justify-start items-center mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-8 w-full rounded-full bg-zinc-700"
              />
            ))}
          </div>
        </div>
      </div>
      {Array.from({ length: jobsLength }).map((_, index) => (
        <div
          key={index}
          className={`bg-zinc-900 p-6 shadow-lg flex flex-col border-b border-zinc-700 ${
            index === jobsLength - 1 ? "rounded-b-lg" : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 w-52 mb-2 bg-zinc-700" />
              <Skeleton className="h-5 w-44 mb-2 bg-zinc-700" />
              <Skeleton className="h-4 w-36 bg-zinc-700" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-700" />
          </div>
          <div className="flex justify-start items-center mt-2">
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 mb-2 bg-zinc-700" />
              <Skeleton className="h-4 w-32 bg-zinc-700" />
              {index === 0 && (
                <Skeleton className="h-4 w-28 mt-2 bg-zinc-700" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Skeleton className="h-6 w-24 mb-4 bg-zinc-700" />
            <div className="bg-zinc-800 p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-40 mb-2 bg-zinc-700" />
                  <Skeleton className="h-4 w-48 bg-zinc-700" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full bg-zinc-700" />
              </div>
              <div className="flex justify-between mt-2 items-center">
                <Skeleton className="h-4 w-48 bg-zinc-700" />
                <div className="space-x-2">
                  <Skeleton className="h-10 w-20 rounded-md bg-zinc-700" />
                  <Skeleton className="h-10 w-20 rounded-md bg-zinc-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function JobFilterAndList({
  filter,
  filteredJobs,
  onFilterChange,
  handleDeleteJobPosting,
  handleAcceptApplication,
  handleRejectApplication,
  getApplicationStatusDetails,
}: JobFilterAndListProps) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(false);
  }, []);
  if (isLoading) {
    return <JobFilterAndListSkeleton jobsLength={filteredJobs.length || 3} />;
  }
  return (
    <div className="w-full lg:w-1/2 rounded-lg shadow-lg border border-zinc-700">
      <div className="p-6">
        <div className="text-xl font-semibold text-blue-500">Posted Jobs</div>
        <div className="flex flex-wrap justify-start items-center mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
            <button
              onClick={() => onFilterChange("all")}
              className={`px-2 py-1 rounded-full ${
                filter === "all" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              All Jobs
            </button>
            <button
              onClick={() => onFilterChange("drafts")}
              className={`px-2 py-1 rounded-full ${
                filter === "drafts" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              Drafts
            </button>
            <button
              onClick={() => onFilterChange("posted")}
              className={`px-2 py-1 rounded-full ${
                filter === "posted" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              Posted
            </button>
            <button
              onClick={() => onFilterChange("pending")}
              className={`px-2 py-1 rounded-full ${
                filter === "pending" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              Pending
            </button>
            <button
              onClick={() => onFilterChange("accepted")}
              className={`px-2 py-1 rounded-full ${
                filter === "accepted" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              Accepted
            </button>
            <button
              onClick={() => onFilterChange("rejected")}
              className={`px-2 py-1 rounded-full ${
                filter === "rejected" ? "bg-blue-500" : "bg-zinc-700"
              } text-white`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>
      {filteredJobs.length === 0 ? (
        <div className="p-6 shadow-lg flex flex-col items-center border-b border-zinc-700">
          <h3 className="text-lg font-semibold text-white mb-2">
            No jobs under this category yet.
          </h3>
          <p className="text-gray-400 text-sm">
            Jobs that you post will show up here.
          </p>
        </div>
      ) : (
        filteredJobs.map((job, index) => (
          <div
            key={job.id}
            className={`p-6 shadow-lg flex flex-col border-b border-zinc-700 ${
              index === filteredJobs.length - 1 ? "rounded-b-lg" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-semibold text-blue-500">
                  {job.title}
                </div>
                <div className="text-lg text-gray-400">{job.company}</div>
                <div className="text-sm text-gray-500">
                  {job.location} (
                  {
                    workLocationLabels[
                      job.workLocation as keyof typeof workLocationLabels
                    ]
                  }
                  )
                </div>
              </div>
              <Menu as="div" className="relative">
                <Menu.Button className="text-gray-400 hover:text-blue-500 mt-2">
                  <FiMoreHorizontal size={20} />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {job.status === JobPostingStatus.DRAFT && (
                      <div className="py-1">
                        <Menu.Item>
                          <button
                            className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                            onClick={() => alert(`Editing draft job ${job.id}`)}
                          >
                            Edit Draft
                          </button>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                            onClick={() => handleDeleteJobPosting(job.id)}
                          >
                            Delete Draft
                          </button>
                        </Menu.Item>
                      </div>
                    )}
                    {job.status === JobPostingStatus.OPEN && (
                      <div className="py-1">
                        <Menu.Item>
                          <Link
                            href={`/post-job/${job.id}/edit`}
                            className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                          >
                            Edit Job
                          </Link>
                        </Menu.Item>
                        <Menu.Item>
                          <button
                            className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                            onClick={() => handleDeleteJobPosting(job.id)}
                          >
                            Delete Job
                          </button>
                        </Menu.Item>
                      </div>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <div className="flex justify-start items-center mt-2">
              <div className="flex flex-col">
                {job.status === JobPostingStatus.DRAFT ? (
                  <>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-blue-500">
                        Draft
                      </span>
                      <span className="text-xs text-gray-400 mx-2">
                        • Created{" "}
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-blue-500 mt-1">
                      Complete Draft
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-blue-500">
                        Posted
                      </span>
                      <span className="text-xs text-gray-400 mx-2">
                        • Created{" "}
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold text-blue-500">
                Applications
              </div>
              {job.applications.length === 0 ? (
                <p className="text-gray-400">No applications yet.</p>
              ) : (
                job.applications.map((application) => (
                  <div
                    key={application.id}
                    className="p-4 mt-4 rounded-md shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {application.candidate.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {application.candidate.email}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-4 py-2 text-sm font-bold rounded-full ${
                            getApplicationStatusDetails(application.status)
                              .className
                          }`}
                        >
                          {
                            getApplicationStatusDetails(application.status)
                              .displayText
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 items-center">
                      <span className="text-sm text-gray-400">
                        Applied{" "}
                        {formatDistanceToNow(new Date(application.appliedAt), {
                          addSuffix: true,
                        })}
                        <div className="mt-4">
                          {application.resumeUrl ? (
                            <a
                              href={application.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                              aria-label={`View resume of ${application.candidate.name}`}
                            >
                              View Resume
                            </a>
                          ) : (
                            <span className="text-gray-400">
                              Resume not available
                            </span>
                          )}
                        </div>
                      </span>
                      <div className="space-x-2">
                        {application.status === "PENDING" && (
                          <>
                            <button
                              className="text-sm bg-blue-500 text-white rounded-md px-4 py-2"
                              onClick={() =>
                                handleAcceptApplication(application.id)
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="text-sm bg-red-500 text-white rounded-md px-4 py-2"
                              onClick={() =>
                                handleRejectApplication(application.id)
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
