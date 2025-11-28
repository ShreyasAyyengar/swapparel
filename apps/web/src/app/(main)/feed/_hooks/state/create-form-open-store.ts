import { create } from "zustand/react";

type CreateFormOpenStore = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useCreateFormOpenStore = create<CreateFormOpenStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));
