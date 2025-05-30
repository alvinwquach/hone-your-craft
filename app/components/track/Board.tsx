"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import { ApplicationStatus } from "@prisma/client";
import Column from "./Column";

interface ColumnType {
  id: ApplicationStatus;
  jobs: Job[];
  onDeleteJob: (job: Job) => void;
}

interface BoardType {
  columns: ColumnType[];
}

function Board({ userJobs, onDeleteJob }: any) {
  const [board, setBoard] = useState(userJobs);
  const [showConfetti, setShowConfetti] = useState(false);

  const addJobToBoard = async (newJobData: Job) => {
    try {
      const response = await fetch(`/api/job/${newJobData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJobData),
      });

      if (!response.ok) {
        throw new Error("Failed to add job");
      }
      const data = await response.json();

      // Update the board state to include the new job
      setBoard((prevBoard: BoardType) => {
        // Map through the current columns in the board
        const updatedColumns = prevBoard.columns.map((column) => {
          // Check if the current column matches the new job's status
          if (column.id === data.job.status) {
            return {
              ...column,
              // Add the new job to the top of the jobs array
              jobs: [data.job, ...column.jobs],
            };
          }
          // Return the column unchanged if it doesn't match
          return column;
        });
        // Return the updated board with modified columns
        return { ...prevBoard, columns: updatedColumns };
      });
    } catch (error) {
      // Log any error that occurs during the job addition
      console.error("Error adding job:", error);
      // Show an error message to the user
      toast.error("Failed To Add Job");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/job/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      // Update the board state to remove the deleted job
      setBoard((prevBoard: BoardType) => {
        // Map through the current columns in the board
        const updatedColumns = prevBoard.columns.map((column) => {
          return {
            ...column,
            // Filter out the job that matches the deleted job's ID
            jobs: column.jobs.filter((job) => job.id !== jobId),
          };
        });
        // Return the updated board with modified columns
        return { ...prevBoard, columns: updatedColumns };
      });

      // Show a success message to the user
      toast.success("Job Deleted Successfully");
    } catch (error) {
      // Log any error that occurs during the job deletion
      console.error("Error deleting job:", error);
      // Show an error message to the user
      toast.error("Failed To Delete Job");
    }
  };

  useEffect(() => {
    setBoard(userJobs);
  }, [userJobs]);

  // Check if userJobs array is empty
  const isEmptyBoard = Object.values(userJobs).every(
    (jobsArray: any) => jobsArray.length === 0
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
          const response = await fetch(`/api/job/${jobMoved.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: finishCol.id,
              company: jobMoved.company,
              title: jobMoved.title,
              postUrl: jobMoved.postUrl,
              description: jobMoved.description,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update job status");
          }

          mutate("/api/jobs");

          switch (finishCol.id) {
            case "OFFER":
              setShowConfetti(true);
              setTimeout(() => {
                setShowConfetti(false);
              }, 5000);
              toast.success("Congratulations!");
              break;
            case "REJECTED":
              toast.error("Better luck next time!");
              break;
            default:
              toast.success("Job Status Updated");
              break;
          }
        } catch (error) {
          console.error("Error updating job:", error);
        }
        setBoard({
          ...board,
          columns: newColumns,
        });
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
            onJobAdded={addJobToBoard}
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
            className="grid grid-cols-1 md:grid-cols-5 gap-2 mx-auto justify-center mt-4  md:w-full"
          >
            {board.columns?.map((column: ColumnType, index: number) => (
              <Column
                key={column.id}
                id={column.id}
                jobs={column.jobs}
                index={index}
                onDeleteJob={handleDeleteJob}
                onJobAdded={addJobToBoard}
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
