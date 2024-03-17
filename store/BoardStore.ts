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
  editJob: (jobId: string, updatedJobData: Partial<Job>) => void; // Add this line
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
  editJob: async (jobId, updatedJobData) => {
    try {
      const response = await axios.put(`/api/job/${jobId}`, updatedJobData); // Make PUT request to update job
      if (response.status === 200) {
        // If update successful, update job details in board state
        const updatedJob = response.data.job;
        const newColumns = new Map(get().board.columns);
        newColumns.forEach((column) => {
          const index = column.jobs.findIndex((job) => job.id === jobId);
          if (index !== -1) {
            column.jobs[index] = updatedJob;
          }
        });
        set((state) => ({
          board: {
            ...state.board,
            columns: newColumns,
          },
        }));
        console.log("Job updated successfully");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
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
  // deleteJob: async (jobIndex: number, job: Job, id: ApplicationStatus) => {
  //   try {
  //     // Make a DELETE request to delete the job
  //     await axios.delete(`/api/job/${job.id}`);

  //     // If successful, update the state to reflect deletion
  //     const newColumns = new Map(get().board.columns);
  //     // Remove the job from the specified column
  //     newColumns.get(id)?.jobs.splice(jobIndex, 1);
  //     // Update the board state
  //     set((state) => ({
  //       board: {
  //         ...state.board,
  //         columns: newColumns,
  //       },
  //     }));

  //     console.log("Job deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting job:", error);
  //     throw error;
  //   }
  // },
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
