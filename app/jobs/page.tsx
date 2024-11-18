"use client";

import { useSession } from "next-auth/react";
import { useState, Fragment } from "react";
import { FaTools } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import useSWR, { mutate } from "swr";
import { Menu, Transition } from "@headlessui/react";
import { FiMoreHorizontal } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

enum JobPostingStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
  ARCHIVED = "ARCHIVED",
  FILLED = "FILLED",
  COMPLETED = "COMPLETED",
}

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  workLocation: string;
  status: JobPostingStatus;
  createdAt: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  return data.jobPostings || [];
};

function Jobs() {
  const { data: session } = useSession();
  const userType = session?.user?.userType;
  const [filter, setFilter] = useState<"all" | "drafts" | "posted">("all");

  const {
    data: userJobPostings,
    isLoading: userJobPostingsLoading,
    error,
  } = useSWR<JobPosting[]>("/api/job-postings", fetcher);

  const jobPostings = userJobPostings ? userJobPostings : [];
  if (userType !== "CLIENT") {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen">
        <FaTools className="text-6xl text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          We&rsquo;re Building Something Great!
        </h2>
        <p className="text-center text-gray-500">
          This page is currently in development. We can&rsquo;t wait to share it
          with you! Please check back soon for updates.
        </p>
      </section>
    );
  }

  if (userJobPostingsLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading job postings</div>;
  }

  const handleDeleteJobPosting = async (jobId: string) => {
    const updatedJobs =
      userJobPostings?.filter((job) => job.id !== jobId) ?? [];
    mutate("/api/job-postings", updatedJobs, false);
    try {
      const response = await fetch(`/api/job-posting/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete job posting");
      }
      toast.success("Job posting deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      mutate("/api/job-postings", userJobPostings, false);
      toast.error("An error occurred while deleting the job posting.");
    }
  };

  const filteredJobs = jobPostings.filter((job) => {
    if (filter === "drafts") return job.status === JobPostingStatus.DRAFT;
    if (filter === "posted") return job.status === JobPostingStatus.OPEN;
    return true;
  });

  const postedJobsCount = jobPostings.filter(
    (job) => job.status === JobPostingStatus.OPEN
  ).length;
  const draftJobsCount = jobPostings.filter(
    (job) => job.status === JobPostingStatus.DRAFT
  ).length;

  const workLocationLabels: {
    ONSITE: string;
    HYBRID: string;
    REMOTE: string;
  } = {
    ONSITE: "On-site",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
  };

  return (
    <section className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6 mt-4">
        <div className="w-full lg:w-1/4">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
            <div className="text-xl font-semibold mb-4 text-blue-500">
              My Jobs
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg text-white">
                <span>Posted Jobs</span>
                <span className="text-blue-500">{postedJobsCount}</span>
              </div>
              <div className="flex justify-between items-center text-lg text-white">
                <span>Drafts</span>
                <span className="text-blue-500">{draftJobsCount}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 rounded-lg shadow-lg border border-zinc-700">
          <div className="bg-zinc-900 p-6 ">
            <div className="text-xl font-semibold text-blue-500">
              Posted Jobs
            </div>
            <div className="flex justify-start items-center gap-4 mt-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full ${
                  filter === "all" ? "bg-blue-500" : "bg-zinc-700"
                } text-white`}
              >
                All Jobs
              </button>
              <button
                onClick={() => setFilter("drafts")}
                className={`px-4 py-2 rounded-full ${
                  filter === "drafts" ? "bg-blue-500" : "bg-zinc-700"
                } text-white`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilter("posted")}
                className={`px-4 py-2 rounded-full ${
                  filter === "posted" ? "bg-blue-500" : "bg-zinc-700"
                } text-white`}
              >
                Posted
              </button>
            </div>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="bg-zinc-900 p-6 shadow-lg flex flex-col items-center border-b border-zinc-700">
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
                className={`bg-zinc-900 p-6 shadow-lg flex flex-col border-b border-zinc-700 ${
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
                                onClick={() =>
                                  alert(`Editing draft job ${job.id}`)
                                }
                              >
                                Edit Draft
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Deleting draft job ${job.id}`)
                                }
                              >
                                Delete Draft
                              </button>
                            </Menu.Item>
                          </div>
                        )}
                        {job.status === JobPostingStatus.OPEN && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Editing posted job ${job.id}`)
                                }
                              >
                                Edit Job
                              </button>
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
                        {job.status === JobPostingStatus.COMPLETED && (
                          <div className="py-1">
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Editing completed job ${job.id}`)
                                }
                              >
                                Edit Job
                              </button>
                            </Menu.Item>
                            <Menu.Item>
                              <button
                                className="block w-full px-4 py-2 text-sm text-white hover:bg-blue-500 text-left"
                                onClick={() =>
                                  alert(`Deleting completed job ${job.id}`)
                                }
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
                          <span className="rounded-full text-xs font-bold">
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
                          <span className="text-xs font-bold">Posted</span>
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
              </div>
            ))
          )}
        </div>
        <div className="w-full lg:w-1/4">
          <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700 flex flex-col items-center">
            <Link href="/post-job">
              <button className="bg-zinc-700 text-white px-4 py-2 rounded-full flex items-center justify-center w-full sm:w-auto">
                <IoIosAddCircleOutline className="mr-2" size={20} />
                Post a Job
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Jobs;
