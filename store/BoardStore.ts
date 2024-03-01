import { create } from "zustand";
import { getJobsGroupedByColumn } from "@/app/lib/getJobsGroupedByColumn";
import axios from "axios";

export interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  newJobInput: {
    company: string;
    title: string;
    postUrl: string;
    description: string;
  };
  setNewJobInput: (input: Partial<BoardState["newJobInput"]>) => void;
  titleSearchString: string;
  setTitleSearchString: (searchString: string) => void;
  updateJobStatus: (job: Job, columnId: TypedColumn) => void;
  deleteJob: (jobIndex: number, job: Job, id: TypedColumn) => void;
}

// Create a Zustand store for managing board state
export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    // Fetch the board data grouped by columns
    const board = await getJobsGroupedByColumn();
    // Set the board state with fetched data
    set({ board });
  },
  // Default new job input fields
  newJobInput: {
    company: "",
    title: "",
    postUrl: "",
    description: "",
  },
  // Update new job input with partial input
  setNewJobInput: (input) =>
    set((state) => ({
      newJobInput: {
        ...state.newJobInput,
        ...input,
      },
    })),
  // Default title search string
  titleSearchString: "",
  // Update title search search string
  setTitleSearchString: (titleSearchString) => set({ titleSearchString }),
  // Set the entire board state
  setBoardState: (board) => set({ board }),
  updateJobStatus: async (job, columnId) => {
    try {
      // Make a PUT request to update the job status
      const response = await axios.put(`/api/job/${job.id}`, {
        status: columnId,
      });

      // If the update was successful, return the updated job
      return response.data;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  },
  deleteJob: async (jobIndex: number, job: Job, id: TypedColumn) => {
    try {
      // Make a DELETE request to delete the job
      await axios.delete(`/api/job/${job.id}`);

      // If successful, update the state to reflect deletion
      const newColumns = new Map(get().board.columns);
      // Remove the job from the specified column
      newColumns.get(id)?.jobs.splice(jobIndex, 1);
      // Update the board state
      set((state) => ({
        board: {
          ...state.board,
          columns: newColumns,
        },
      }));

      console.log("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  },
  // updateJobStatus: async (job, columnId) => {
  //   try {
  //     // Make a PUT request to update the job status
  //     const response = await fetch(`/api/job/${job.id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         // Update the status field with the provided column ID
  //         status: columnId,
  //       }),
  //     });

  //     // Check if the request was successful (status code 200-299)
  //     if (!response.ok) {
  //       // If not successful, throw an error with the response status text
  //       throw new Error(`Failed to update job: ${response.statusText}`);
  //     }

  //     // If the update was successful, return the updated job
  //     const updatedJob = await response.json();
  //     return updatedJob;
  //   } catch (error) {
  //     console.error("Error updating job:", error);
  //     throw error;
  //   }
  // },

  // deleteJob: async (jobIndex: number, job: Job, id: TypedColumn) => {
  //   try {
  //     // Make a DELETE request to delete the job
  //     const response = await fetch(`/api/job/${job.id}`, {
  //       method: "DELETE",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     // Check if the request was successful
  //     if (!response.ok) {
  //       throw new Error(`Failed to delete job: ${response.statusText}`);
  //     }

  //     // If successful, update the state to reflect deletion
  //     const newColumns = new Map(get().board.columns);
  //     // Remove the job from the specified column
  //     newColumns.get(id)?.jobs.splice(jobIndex, 1);
  //     // Update the board state
  //     set({ board: { columns: newColumns } });

  //     console.log("Job deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting job:", error);
  //     throw error;
  //   }
  // },
}));
