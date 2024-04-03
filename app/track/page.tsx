"use client";

import { useBoardStore } from "@/store/BoardStore";
import JobTitleSearchForm from "../components/track/JobTitleSearchForm";
import Board from "../components/track/Board";
import useSWR from "swr";

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
  } = useSWR<UserJobs>("/api/jobs", fetcher);

  const loadingUserJobs = !userJobs || userJobsLoading;
  if (error) return <div>Error loading user&apos;s jobs</div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <JobTitleSearchForm
        titleSearchString={titleSearchString}
        setTitleSearchString={setTitleSearchString}
      />
      {loadingUserJobs ? (
        <div>
          <Board userJobs={[]} />
        </div>
      ) : (
        <Board userJobs={userJobs} />
      )}
    </div>
  );
}

export default Track;
