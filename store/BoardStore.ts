import { create } from "zustand";
import { getJobsGroupedByColumn } from "@/app/lib/getJobsGroupedByColumn";
import axios from "axios";
import { ApplicationStatus, Job } from "@prisma/client";
import deleteJob from "@/app/lib/deleteJob";

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
  updateJobStatus: (job: Job, columnId: ApplicationStatus) => void;
  addJob: (job: Job, columnId: ApplicationStatus) => void;
  deleteJob: (jobIndex: number, job: Job, id: ApplicationStatus) => void;
}

// Create a Zustand store for managing board state
export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<ApplicationStatus, Column>(),
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
  addJob: async (job: Job, columnId: ApplicationStatus) => {
    try {
      // Make a POST request to add the new job
      const response = await axios.post(`/api/job/${job.id}`, job);

      // If the request was successful, update the board state
      if (response.status === 201) {
        // Get the created job from the response data
        const createdJob = response.data.job;

        // Clone the existing columns map
        const newColumns = new Map(get().board.columns);

        // Retrieve the column with the specified ID
        const column = newColumns.get(columnId);
        if (column) {
          column.jobs.unshift(createdJob); // Add the job at the beginning of the array
        }

        // Update the board state with the new job added
        set((state) => ({
          board: {
            ...state.board,
            columns: newColumns,
          },
        }));
      }
      // Log the column ID for debugging
      console.log(columnId);
    } catch (error) {
      // Log and rethrow any errors that occur during the process
      console.error("Error adding job:", error);
      throw error;
    }
  },
  deleteJob: async (jobIndex: number, job: Job, id: ApplicationStatus) => {
    try {
      // Delete the job by id
      await deleteJob(job.id);

      console.log("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }

    // Update the board state to reflect deletion
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
  },
}));
