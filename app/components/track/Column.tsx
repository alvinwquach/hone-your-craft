import { useEffect, useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import { useBoardStore } from "@/store/BoardStore";
import AddJobModal from "./AddJobModal";
import JobCard from "./JobCard";

type ColumnProps = {
  id: ApplicationStatus;
  jobs: Job[];
  index: number;
  onDeleteJob: (jobId: string) => Promise<void>;
  onJobAdded: (job: Job) => void;
};

export const iDToColumnText: {
  [key in ApplicationStatus]: string;
} = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
};

function Column({ id, jobs, index, onDeleteJob, onJobAdded }: ColumnProps) {
  const [titleSearchString, companySearchString] = useBoardStore((state) => [
    state.titleSearchString,
    state.companySearchString,
  ]);

  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const openAddJobModal = () => {
    setIsAddJobModalOpen(true);
  };

  const hasNoTrackedJobs = jobs.length === 0;

  const SkeletonLoader = () => (
    <div className="p-2">
      <div className="flex justify-center mt-4">
        <div className="h-14 w-full rounded border border-zinc-700 animate-pulse" />
      </div>
      {jobs.length > 0 && (
        <div className="space-y-2 mt-2 max-h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {[...Array(jobs.length)].map((_, i) => (
            <div
              key={i}
              className="relative from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl shadow-xl transition-all duration-300 transform backdrop-blur-sm bg-opacity-80 hover:bg-opacity-100 active:scale-[0.995] p-4"
            >
              <div className="h-2 w-3/4 mb-2 bg-zinc-700 rounded animate-pulse" />
              <div className="h-2 w-2/4 mb-3 bg-zinc-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Draggable draggableId={id} index={index} key={id}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Droppable droppableId={index.toString()} type="card">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-2 rounded-2xl shadow-lg border border-zinc-700 ${
                  snapshot.isDraggingOver ? "bg-neutral-800" : "bg-neutral-900"
                } transition-all duration-300`}
              >
                <h2 className="flex justify-between items-center text-white font-semibold text-lg p-2 rounded-t-2xl border-zinc-700">
                  {iDToColumnText[id]}
                  <span className="border border-zinc-700 text-white text-sm font-normal rounded-full px-2 py-1">
                    {!titleSearchString && !companySearchString
                      ? jobs.length
                      : jobs.filter(
                          (job) =>
                            job.title
                              .toLowerCase()
                              .includes(titleSearchString.toLowerCase()) ||
                            job.company
                              .toLowerCase()
                              .includes(companySearchString.toLowerCase())
                        ).length}
                  </span>
                </h2>
                {isLoading && jobs.length > 0 ? (
                  <SkeletonLoader />
                ) : (
                  <>
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={openAddJobModal}
                        className="group relative py-2 px-4 mb-2 bg-white text-black border border-zinc-700 hover:from-zinc-800 hover:via-zinc-700 hover:to-zinc-800 w-full max-w-lg  transition-all duration-300 rounded-lg shadow-lg active:scale-95"
                      >
                        <HiPlusCircle className="text-black h-10 w-10 inline-block  group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    {!hasNoTrackedJobs && (
                      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {jobs.map((job, index) => {
                          if (
                            (titleSearchString &&
                              !job.title
                                .toLowerCase()
                                .includes(titleSearchString)) ||
                            (companySearchString &&
                              !job.company
                                .toLowerCase()
                                .includes(companySearchString))
                          ) {
                            return null;
                          }
                          return (
                            <Draggable
                              key={job.id}
                              index={index}
                              draggableId={job.id}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <JobCard
                                    job={job}
                                    index={index}
                                    id={id}
                                    innerRef={provided.innerRef}
                                    draggableProps={provided.draggableProps}
                                    draghandleProps={provided.dragHandleProps}
                                    onDeleteJob={onDeleteJob}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                {isAddJobModalOpen && (
                  <AddJobModal
                    isOpen={isAddJobModalOpen}
                    closeModal={() => setIsAddJobModalOpen(false)}
                    selectedCategory={id}
                    onJobAdded={onJobAdded}
                  />
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
