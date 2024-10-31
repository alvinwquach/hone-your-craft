"use client";

import { useSession } from "next-auth/react"; // Import useSession to get the user type
import { useBoardStore } from "@/store/BoardStore";
import Board from "../components/track/Board";
import useSWR, { mutate } from "swr";
import { Suspense } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import JobTitleSearchForm from "../components/track/JobTitleSearchForm";
import CompanyTitleSearchForm from "../components/track/CompanyTitleSearchForm";
import { FaTools } from "react-icons/fa";

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
  const { data: session } = useSession();
  const userType = session?.user?.userType;
  const [
    titleSearchString,
    setTitleSearchString,
    companySearchString,
    setCompanySearchString,
  ] = useBoardStore((state) => [
    state.titleSearchString,
    state.setTitleSearchString,
    state.companySearchString,
    state.setCompanySearchString,
  ]);

  const {
    data: userJobs,
    isLoading: userJobsLoading,
    error,
  } = useSWR<UserJobs>("/api/jobs", fetcher);

  const loadingUserJobs = !userJobs || userJobsLoading;
  if (error) return <div>Error loading user's jobs</div>;

  const handleDeleteJob = async (job: Job) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/api/job/${job.id}`);
      mutate("/api/jobs");
      toast.success("Job Deleted");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed To Delete Job");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userType === "CANDIDATE" ? (
        <>
          <JobTitleSearchForm
            titleSearchString={titleSearchString}
            setTitleSearchString={setTitleSearchString}
          />
          <CompanyTitleSearchForm
            companySearchString={companySearchString}
            setCompanySearchString={setCompanySearchString}
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
        </>
      ) : userType === "CLIENT" ? (
        <section className="flex flex-col items-center justify-center min-h-screen">
          <FaTools className="text-6xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            We're Building Something Great!
          </h2>
          <p className="text-center text-gray-500">
            This page is currently in development. We can't wait to share it
            with you! Please check back soon for updates.
          </p>
        </section>
      ) : null}
    </div>
  );
}

export default Track;
