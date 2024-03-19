import { ApplicationStatus } from "@prisma/client";
import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  openModal: (category: ApplicationStatus) => void;
  closeModal: () => void;
  selectedCategory: ApplicationStatus | null;
  selectedJob: Job | null;
}

// Create a Zustand store for managing modal state
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openModal: (category) => set({ isOpen: true, selectedCategory: category }),
  closeModal: () => set({ isOpen: false }),
  selectedCategory: null,
  selectedJob: null,
}));
