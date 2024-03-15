"use client";

import { useEffect } from "react";
import { useBoardStore } from "@/store/BoardStore";
import { DragDropContext, DropResult, Droppable } from "@hello-pangea/dnd";
import Column from "./Column";

function Board() {
  const [board, getBoard, setBoardState, updateJobStatus] = useBoardStore(
    (state) => [
      state.board,
      state.getBoard,
      state.setBoardState,
      state.updateJobStatus,
    ]
  );

  useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleOnDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (type === "column") {
      // Convert the columns map to an array of key-value pairs
      const entries = Array.from(board.columns.entries());
      // Remove the column being dragged from its original position
      const [removed] = entries.splice(source.index, 1);
      // Insert the removed column at the new destination index
      entries.splice(destination.index, 0, removed);
      // Convert the rearranged array back to a Map
      const rearrangedColumns = new Map(entries);
      // Update the board state with the rearranged columns
      setBoardState({
        ...board,
        columns: rearrangedColumns,
      });
    }
    // Convert the columns Map to an array
    const columns = Array.from(board.columns);
    // Get the index of the starting column based on the source droppableId
    const startColIndex = columns[Number(source.droppableId)];
    // Get the index of the finished column based on the destination droppableId
    const finishColIndex = columns[Number(destination.droppableId)];
    /* Create a starting column object
     Get the ID of the starting column from the first element of startColIndex
     Get the jobs array of the starting column from the second element of StartColIndex, and access its 'jobs' property */
    const startCol: Column = {
      id: startColIndex[0],
      jobs: startColIndex[1].jobs,
    };
    /* Create a finished column object
     Get the ID of the starting column from the first element of startColIndex
    Get the jobs array of the starting column from the second element of StartColIndex, and access its 'jobs' property */
    const finishCol: Column = {
      id: finishColIndex[0],
      jobs: finishColIndex[1].jobs,
    };

    // If there's no start or finish column, return
    if (!startCol || !finishCol) return;

    // If the source and destination are the same and the columns are the same, return
    if (source.index === destination.index && startCol === finishCol) return;

    // Extract the job being moved from the starting column
    const newJobs = startCol.jobs;

    // Remove the job at the index specified by the source from the newJobs array
    const [jobMoved] = newJobs.splice(source.index, 1);

    // If the drag is within the same column */
    if (startCol.id === finishCol.id) {
      // Insert the job into the new position within the same column
      newJobs.splice(destination.index, 0, jobMoved);
      // Create a new column object with the updated jobs
      const newCol = {
        id: startCol.id,
        jobs: newJobs,
      };
      // Update the columns map with the modified column
      const newColumns = new Map(board.columns);

      newColumns.set(startCol.id, newCol);
      // Update the board state with the modified columns
      setBoardState({ ...board, columns: newColumns });
    } else {
      /* If the drag moves the job to another column 
      Clone the jobs array of the finishing column and insert the moved job */
      const finishJobs = Array.from(finishCol.jobs);

      // Insert the moved job into the cloned array at the specified destination index
      finishJobs.splice(destination.index, 0, jobMoved);

      // Clone the columns map and update the starting column with the modified jobs
      const newColumns = new Map(board.columns);
      const newCol = {
        id: startCol.id,
        jobs: newJobs,
      };

      // Create a new entry in the newColumns map with the starting column ID as the key and the newCol object as the value
      newColumns.set(startCol.id, newCol);

      // Update the finished column with the modified jobs and update the job status
      newColumns.set(finishCol.id, {
        id: finishCol.id,
        jobs: finishJobs,
      });
      // Update the job status in the database
      updateJobStatus(jobMoved, finishCol.id);
      // Update the board state with the modified columns
      setBoardState({ ...board, columns: newColumns });
    }
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="board" type="column" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 md:grid-cols-5 gap-5 mx-auto justify-center"
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} jobs={column.jobs} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default Board;
