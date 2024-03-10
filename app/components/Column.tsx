import { useBoardStore } from "@/store/BoardStore";
import { useModalStore } from "@/store/ModalStore";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import { HiPlusCircle } from "react-icons/hi";
import JobCard from "./JobCard";

type ColumnProps = {
  id: ApplicationStatus;
  jobs: Job[];
  index: number;
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

function Column({ id, jobs, index }: ColumnProps) {
  // Get the search string from the board store
  const [titleSearchString] = useBoardStore((state) => [
    state.titleSearchString,
  ]);
  // Get the function to open the modal from the modal store
  const openModal = useModalStore((state) => state.openModal);

  const handleOpenModal = () => {
    openModal(id);
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
                  snapshot.isDraggingOver ? "bg-zinc-600" : "bg-black"
                }`}
              >
                <h2 className="flex justify-between semibold text-base p-2">
                  {iDToColumnText[id]}
                  {/* Display the count of jobs in the column */}
                  <span className="text-black bg-gray-200 text-sm font-normal rounded-full px-2 py-1">
                    {!titleSearchString
                      ? jobs.length // Display total job count if no search string
                      : jobs.filter((job) =>
                          job.title.includes(titleSearchString)
                        ).length}
                    {/* Display filtered job count if there's a search string */}
                  </span>
                </h2>
                <div className="flex justify-center">
                  <button
                    className="py-1 px-2 my-2 bg-zinc-800 hover:bg-zinc-700 w-full text-center rounded-lg"
                    onClick={handleOpenModal}
                  >
                    <HiPlusCircle className="h-10 w-10 text-gray-400 inline-block" />
                  </button>
                </div>
                <div className="mt-4">
                  {jobs.map((job, index) => {
                    // Filter jobs based on the search string
                    if (
                      titleSearchString &&
                      !job.title.toLowerCase().includes(titleSearchString)
                    ) {
                      return null; // Skip rendering if job doesn't match search
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
