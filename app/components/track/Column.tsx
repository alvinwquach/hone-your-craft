import { useBoardStore } from "@/store/BoardStore";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import { useState } from "react";
import { HiPlusCircle } from "react-icons/hi";
import AddJobModal from "./AddJobModal";
import JobCard from "./JobCard";

type ColumnProps = {
  id: ApplicationStatus;
  jobs: Job[];
  index: number;
  onDeleteJob: (job: Job) => void;
};
// A mapping of column IDs to their corresponding display text
export const iDToColumnText: {
  [key in ApplicationStatus]: string;
} = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  OFFER: "Offer",
};

function Column({ id, jobs, index, onDeleteJob }: ColumnProps) {
  // Get the search string from the board store
  const [titleSearchString, companySearchString] = useBoardStore((state) => [
    state.titleSearchString,
    state.companySearchString,
  ]);

  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  const openAddJobModal = () => {
    setIsAddJobModalOpen(true);
  };

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
                className={`p-2 rounded-2xl shadow-sm ${
                  snapshot.isDraggingOver ? "bg-gray-900" : "bg-gray-800"
                }`}
              >
                <h2 className="flex justify-between semibold text-base p-2">
                  {iDToColumnText[id]}
                  {/* Display the count of jobs in the column */}
                  <span className="text-black bg-gray-200 text-sm font-normal rounded-full px-2 py-1">
                    {!titleSearchString && !companySearchString
                      ? jobs.length // Display total job count if no search strings
                      : jobs.filter(
                          (job) =>
                            job.title
                              .toLowerCase()
                              .includes(titleSearchString.toLowerCase()) ||
                            job.company
                              .toLowerCase()
                              .includes(companySearchString.toLowerCase())
                        ).length}
                    {/* Display filtered job count if there's any search string */}
                  </span>
                </h2>
                <div className="flex justify-center">
                  <button
                    className="py-1 px-2 my-2 bg-gray-700 hover:bg-gray-600 w-full text-center rounded-lg"
                    onClick={openAddJobModal}
                  >
                    <HiPlusCircle className="h-10 w-10 text-gray-400 inline-block" />
                  </button>
                  {isAddJobModalOpen && (
                    <AddJobModal
                      isOpen={isAddJobModalOpen}
                      closeModal={() => setIsAddJobModalOpen(false)}
                      selectedCategory={id}
                    />
                  )}
                </div>
                <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {jobs.map((job, index) => {
                    if (
                      (titleSearchString &&
                        !job.title.toLowerCase().includes(titleSearchString)) ||
                      (companySearchString &&
                        !job.company
                          .toLowerCase()
                          .includes(companySearchString))
                    ) {
                      return null;
                    }

                    return (
                      <Draggable
                        draggableId={job.id}
                        index={index}
                        key={job.id}
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
