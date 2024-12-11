interface ClientJobStatisticsProps {
  postedJobsCount: number;
  draftJobsCount: number;
}

function ClientJobStatistics({
  postedJobsCount,
  draftJobsCount,
}: ClientJobStatisticsProps) {
  return (
    <div className="w-full lg:w-1/4">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-700">
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

export default ClientJobStatistics;
