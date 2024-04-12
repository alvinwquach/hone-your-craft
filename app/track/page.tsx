"use client";

import { useBoardStore } from "@/store/BoardStore";
import JobTitleSearchForm from "../components/track/JobTitleSearchForm";
import Board from "../components/track/Board";
import useSWR, { mutate } from "swr";
import { Suspense, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const fetcher = async (url: string, ...args: any[]) => {
  const response = await fetch(url, ...args);
  return response.json();
};

interface UserJobs {
  APPLIED: Job[];
  SAVED: Job[];
  INTERVIEW: Job[];
  OFFER: Job[];
  REJECTED: Job[];
}

function Track() {
  const [titleSearchString, setTitleSearchString] = useBoardStore((state) => [
    state.titleSearchString,
    state.setTitleSearchString,
  ]);

  const {
    data: userJobs,
    isLoading: userJobsLoading,
    error,
  } = useSWR<UserJobs>("/api/jobs", fetcher, {
    refreshInterval: 1000,
  });

  const loadingUserJobs = !userJobs || userJobsLoading;
  if (error) return <div>Error loading user&apos;s jobs</div>;

  const handleDeleteJob = async (job: Job) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/api/job/${job.id}`);
      mutate("/api/jobs", false);
      toast.success("Job Deleted");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed To Delete Job");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <JobTitleSearchForm
        titleSearchString={titleSearchString}
        setTitleSearchString={setTitleSearchString}
      />
      {loadingUserJobs ? (
        <div>
          <Suspense fallback={<Board userJobs={[]} />}>
            <Board userJobs={[]} />
          </Suspense>
        </div>
      ) : (
        <Suspense fallback={<Board userJobs={[]} />}>
          <Board userJobs={userJobs} onDeleteJob={handleDeleteJob} />
        </Suspense>
      )}
    </div>
  );
}

export default Track;





















