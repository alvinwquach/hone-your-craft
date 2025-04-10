import JobMatchCard from "@/app/components/profile/match/JobMatchCard";
import ProfileNavigation from "@/app/components/profile/ui/ProfileNavigation";
import InfiniteScrollClient, {
  JobMatchCardSkeleton,
} from "@/app/components/ui/InfiniteScrollClient";
import { getUserJobPostingsWithSkillMatch } from "../../actions/getUserJobPostingsWithSkillMatch";

export default async function Match() {
  const initialData = await getUserJobPostingsWithSkillMatch(1);

  if (!initialData) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)] flex items-center">
        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <JobMatchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (initialData.jobs.length === 0) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 min-h-[calc(100vh-4rem)] flex items-center">
        <p className="text-center text-gray-400 py-8">No job matches found</p>
      </div>
    );
  }

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
        <ProfileNavigation />
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
