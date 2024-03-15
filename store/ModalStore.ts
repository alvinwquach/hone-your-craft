import { ApplicationStatus } from "@prisma/client";
import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  openModal: (category: ApplicationStatus) => void;
  openEditModal: (category: ApplicationStatus, job: Job) => void; // New action for opening edit modal
  closeModal: () => void;
  selectedCategory: ApplicationStatus | null;
  selectedJob: Job | null;
}

// Create a Zustand store for managing modal state
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openModal: (category) => set({ isOpen: true, selectedCategory: category }),
  openEditModal: (category, job) =>
    set({ isOpen: true, selectedCategory: category, selectedJob: job }),

  closeModal: () => set({ isOpen: false }),
  selectedCategory: null,
  selectedJob: null,
}));
