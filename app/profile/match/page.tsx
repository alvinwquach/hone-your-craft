import { Suspense } from "react";
import InfiniteScrollClient, {
  JobMatchCardSkeleton,
} from "@/app/components/ui/InfiniteScrollClient";

interface JobMatchesSkeletonProps {
  jobCount?: number;
}

function JobMatchesSkeleton({ jobCount = 9 }: JobMatchesSkeletonProps) {
  return (
    <section className="flex-1 ml-16 md:ml-16 max-w-screen-2xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: jobCount }).map((_, i) => (
          <JobMatchCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    </section>
  );
}

export default function JobMatches() {
  return (
    <Suspense fallback={<JobMatchesSkeleton jobCount={9} />}>
      <InfiniteScrollClient />
    </Suspense>
  );
}
