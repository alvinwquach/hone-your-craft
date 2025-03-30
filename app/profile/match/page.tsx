import JobMatchCard from "@/app/components/profile/match/JobMatchCard";
import InfiniteScrollClient from "@/app/components/ui/InfiniteScrollClient";
import { getUserJobPostingsWithSkillMatch } from "../../actions/getUserJobPostingsWithSkillMatch";

export default async function Match() {
  const initialData = await getUserJobPostingsWithSkillMatch(1);

  if (initialData.jobs.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)] flex items-center">
        <p className="text-center text-gray-400 py-8">No job matches found</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)] flex items-center">
      <div className="gap-6">
        {initialData.currentPage === 1 && initialData.totalPages === 1 ? (
          initialData.jobs.map((job) => <JobMatchCard key={job.id} job={job} />)
        ) : (
          <InfiniteScrollClient
            initialJobs={initialData.jobs}
            initialPage={initialData.currentPage}
            totalPages={initialData.totalPages}
          />
        )}
      </div>
    </div>
  );
}
