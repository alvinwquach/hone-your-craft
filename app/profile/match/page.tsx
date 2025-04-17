"use server";

import JobMatchCard from "@/app/components/profile/match/JobMatchCard";
import InfiniteScrollClient from "@/app/components/ui/InfiniteScrollClient";
import { JobMatchCardSkeleton } from "@/app/components/ui/InfiniteScrollClient";
import { getUserJobPostingsWithSkillMatch } from "../../actions/getUserJobPostingsWithSkillMatch";

export default async function JobMatches() {
  const initialData = await getUserJobPostingsWithSkillMatch(1);

  if (!initialData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <JobMatchCardSkeleton key={`null-skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (initialData.jobs.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 mt-6">
        No job matches found
      </p>
    );
  }

  return (
    <div className="mt-6">
      {initialData.currentPage === 1 && initialData.totalPages === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialData.jobs.slice(0, 9).map((job) => (
            <JobMatchCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <InfiniteScrollClient
          initialJobs={initialData.jobs.slice(0, 9)}
          initialPage={initialData.currentPage}
          totalPages={initialData.totalPages}
        />
      )}
    </div>
  );
}
