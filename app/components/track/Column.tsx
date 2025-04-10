import { useState } from "react";
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
  const openAddJobModal = () => {
    setIsAddJobModalOpen(true);
  };

  const hasNoTrackedJobs = jobs.length === 0;

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
                className={`p-2 rounded-2xl shadow-md ${
                  hasNoTrackedJobs
                    ? "min-h-[60px]"
                    : "min-h-[calc(100vh-250px)]"
                } ${
                  snapshot.isDraggingOver ? "bg-gray-800" : "bg-gray-900"
                } transition-all duration-300`}
              >
                <h2 className="flex justify-between items-center text-white font-semibold text-lg p-2 bg-black rounded-t-2xl">
                  {iDToColumnText[id]}
                  <span className="bg-gray-500 text-white text-sm font-normal rounded-full px-2 py-1">
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
                <div className="flex justify-center mt-4">
                  <button
                    onClick={openAddJobModal}
                    className="group relative py-2 px-4 mb-2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 hover:bg-gradient-to-br hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 w-full max-w-xs text-center rounded-lg text-white transition-all duration-300"
                  >
                    <HiPlusCircle className="h-10 w-10 inline-block text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                {!hasNoTrackedJobs && (
                  <div className="overflow-y-auto overflow-x-hidden h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
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
                {isAddJobModalOpen && (
                  <AddJobModal
                    isOpen={isAddJobModalOpen}
                    closeModal={() => setIsAddJobModalOpen(false)}
                    selectedCategory={id}
                    onJobAdded={onJobAdded}
                  />
                )}
                {/* Placeholder for dropped job cards */}
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