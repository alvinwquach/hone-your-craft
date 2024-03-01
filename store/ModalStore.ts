import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  openModal: (category: TypedColumn) => void;
  closeModal: () => void;
  selectedCategory: TypedColumn | null;
}

// Create a Zustand store for managing modal state
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  openModal: (category) => set({ isOpen: true, selectedCategory: category }),
  closeModal: () => set({ isOpen: false }),
  selectedCategory: null,
}));
