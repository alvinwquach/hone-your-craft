import { create } from "zustand";
import { getJobsGroupedByColumn } from "@/app/lib/getJobsGroupedByColumn";
import { ApplicationStatus } from "@prisma/client";

export interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;

  titleSearchString: string;
  setTitleSearchString: (searchString: string) => void;
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
  titleSearchString: "",
  // Update title search search string
  setTitleSearchString: (titleSearchString) => set({ titleSearchString }),
  // Set the entire board state
  setBoardState: (board) => set({ board }),
}));
