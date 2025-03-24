"use client";

import { useSession } from "next-auth/react"; 
import { useBoardStore } from "@/store/BoardStore";
import Board from "../components/track/Board";
import useSWR, { mutate } from "swr";
import { Suspense } from "react";
import { toast } from "react-toastify";
import JobTitleSearchForm from "../components/track/JobTitleSearchForm";
import CompanyTitleSearchForm from "../components/track/CompanyTitleSearchForm";
import { FaTools } from "react-icons/fa";

const fetcher = async (url: string, ...args: any[]) => {
  const response = await fetch(url, ...args);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
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
  const userRole = session?.user?.userRole;
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
  } = useSWR<UserJobs>("/api/trackedjobs", fetcher);

  const loadingUserJobs = !userJobs || userJobsLoading;
  if (error) return <div>Error loading user jobs</div>;

  const handleDeleteJob = async (job: Job) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/job/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      mutate("/api/jobs");
      toast.success("Job Deleted");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed To Delete Job");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      {userRole === "CANDIDATE" ? (
        <>
          <div className="flex flex-col lg:flex-row gap-x-4">
            <CompanyTitleSearchForm
              companySearchString={companySearchString}
              setCompanySearchString={setCompanySearchString}
            />
            <JobTitleSearchForm
              titleSearchString={titleSearchString}
              setTitleSearchString={setTitleSearchString}
            />
          </div>
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
      ) : userRole === "CLIENT" ? (
        <section className="flex flex-col items-center justify-center min-h-screen">
          <FaTools className="text-6xl text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            We&rsquo;re Building Something Great!
          </h2>
          <p className="text-center text-gray-500">
            This page is currently in development. We can&rsquo;t wait to share
            it with you! Please check back soon for updates.
          </p>
        </section>
      ) : null}
    </div>
  );
}

export default Track;
