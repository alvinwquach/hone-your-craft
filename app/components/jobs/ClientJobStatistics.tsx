import { Skeleton } from "../profile/ui/Skeleton";

interface ClientJobStatisticsProps {
  postedJobsCount: number;
  draftJobsCount: number;
}

export function ClientJobStatisticsSkeleton() {
  return (
    <div className="w-full lg:w-1/4">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
        <Skeleton className="h-6 w-1/4 mb-4 bg-zinc-700" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3 bg-zinc-700" />
            <Skeleton className="h-5 w-10 bg-zinc-700" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3 bg-zinc-700" />
            <Skeleton className="h-5 w-10 bg-zinc-700" />
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
      <div className="p-6 rounded-lg shadow-lg border border-zinc-700">
        <div className="text-xl font-semibold mb-4 text-blue-500">My Jobs</div>
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
  );
}
