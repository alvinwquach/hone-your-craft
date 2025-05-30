import { Skeleton } from "../profile/ui/Skeleton";

interface ClientJobStatisticsProps {
  postedJobsCount: number;
  draftJobsCount: number;
}

export function ClientJobStatisticsSkeleton() {
  return (
    <div className="w-full lg:w-1/4">
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientJobStatistics({
  postedJobsCount,
  draftJobsCount,
}: ClientJobStatisticsProps) {
  return (
    <div className="w-full lg:w-1/4">
      <div className="p-6 rounded-lg shadow-lg bg-neutral-900 border border-zinc-700">
        <div className="text-xl font-semibold mb-4 text-white">My Jobs</div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg text-white">
            <span>Posted Jobs</span>
            <span>{postedJobsCount}</span>
          </div>
          <div className="flex justify-between items-center text-lg text-gray-200">
            <span>Drafts</span>
            <span>{draftJobsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
