import { create } from "zustand";

export interface BoardState {
  titleSearchString: string;
  setTitleSearchString: (searchString: string) => void;
}

// Create a Zustand store for managing board state
export const useBoardStore = create<BoardState>((set, get) => ({
  titleSearchString: "",
  // Update title search search string
  setTitleSearchString: (titleSearchString) => set({ titleSearchString }),
}));
