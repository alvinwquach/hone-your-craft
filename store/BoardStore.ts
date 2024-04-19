import { create } from "zustand";

export interface BoardState {
  titleSearchString: string;
  companySearchString: string;
  setTitleSearchString: (searchString: string) => void;
  setCompanySearchString: (searchString: string) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  titleSearchString: "",
  companySearchString: "",
  setTitleSearchString: (titleSearchString) => set({ titleSearchString }),
  setCompanySearchString: (companySearchString) => set({ companySearchString }),
}));
