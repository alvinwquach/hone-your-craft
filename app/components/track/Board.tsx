"use client";

import { useState } from "react";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import Column from "./Column";
import { mutate } from "swr";
import axios from "axios";
import Confetti from "react-confetti";
import { ApplicationStatus } from "@prisma/client";
import { toast } from "react-toastify";

interface ColumnType {
  id: ApplicationStatus;
  jobs: Job[];
  onDeleteJob: (job: Job) => void;
}

function Board({ userJobs, onDeleteJob }: any) {
  const [board, setBoard] = useState(userJobs);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if userJobs array is empty
  const isEmptyBoard = Object.values(userJobs).every(
    (jobsArray: any) => jobsArray?.length === 0
  );

  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    // If there's no destination, return early
    if (!destination) return;

    // If the type is column, reorder the columns
    if (type === "column") {
      // Create a copy of the columns array
      const newColumns = [...board.columns];
      // Remove the item from the source index
      const [removed] = newColumns.splice(source.index, 1);
      // Insert the removed item at the destination index
      newColumns.splice(destination.index, 0, removed);

      // Update the board state with the new columns
      setBoard({
        ...board,
        columns: newColumns,
      });
    } else {
      // Otherwise, handle job movement between columns
      const startCol = board.columns[source.droppableId];
      const finishCol = board.columns[destination.droppableId];

      // Check if startCol and finishCol exist
      if (!startCol || !finishCol) return;

      // Check if the drag and drop is within the same column and index
      if (source.index === destination.index && startCol === finishCol) return;

      // Create a copy of the jobs array in the start column
      const newJobs = [...startCol.jobs];
      // Remove the job being moved from the start column
      const [jobMoved] = newJobs.splice(source.index, 1);

      // If the job is moved to the "OFFER" column, show confetti
      if (finishCol.id === "OFFER") {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
        toast.success("Congratulations!");
      }

      if (finishCol.id === "REJECTED") {
        toast.success("Better luck next time!");
      }

      // If the job is moved within the same column
      if (startCol.id === finishCol.id) {
        // Insert the job at the destination index
        newJobs.splice(destination.index, 0, jobMoved);
        // Create a new column object with updated jobs
        const newCol = {
          ...startCol,
          jobs: newJobs,
        };
        // Create a copy of the columns array
        const newColumns = [...board.columns];
        // Update the column at the source droppableId index
        const droppableIdNum = parseInt(source.droppableId);
        newColumns[droppableIdNum] = newCol;
        // Update the board state with the new columns
        setBoard({
          ...board,
          columns: newColumns,
        });
      } else {
        // If the job is moved to a different column
        // Create a copy of the jobs array in the finish column
        const finishJobs = [...finishCol.jobs];
        // Insert the job at the destination index in the finish column
        finishJobs.splice(destination.index, 0, jobMoved);
        // Create a copy of the columns array
        const newColumns = [...board.columns];
        // Update the start column with the updated jobs
        newColumns[
          board.columns.findIndex((col: ColumnType) => col.id === startCol.id)
        ] = {
          ...startCol,
          jobs: newJobs,
        };
        // Update the finish column with the updated jobs
        newColumns[
          board.columns.findIndex((col: ColumnType) => col.id === finishCol.id)
        ] = {
          ...finishCol,
          jobs: finishJobs,
        };
        try {
          await axios.put(`/api/job/${jobMoved.id}`, {
            status: finishCol.id,
          });
          mutate("/api/jobs");
        } catch (error) {
          console.error("Error updating job:", error);
        }

        setBoard({
          ...board,
          columns: newColumns,
        });
        // Update the board state with the new columns
      }
    }
  };

  if (isEmptyBoard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mx-auto justify-center mt-4">
        {Object.keys(userJobs).map((status: string, index: number) => (
          <Column
            key={status}
            id={status as ApplicationStatus}
            jobs={[]}
            index={index}
            onDeleteJob={onDeleteJob}
          />
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      {showConfetti && <Confetti />}

      <Droppable droppableId="board" type="column" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 md:grid-cols-5 gap-5 mx-auto justify-center mt-4"
          >
            {board.columns.map((column: ColumnType, index: number) => (
              <Column
                key={column.id}
                id={column.id}
                jobs={column.jobs}
                index={index}
                onDeleteJob={onDeleteJob}
              />
            ))}
            {/* Render the placeholder for dropped items */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default Board;
