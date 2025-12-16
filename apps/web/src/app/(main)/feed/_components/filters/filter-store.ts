import { create } from "zustand/react";

type FilterStore = {
  filteredColors: string[];
  setFilteredColors: (colors: string[]) => void;
  filteredColorOnly: boolean;
  setFilteredColorOnly: (only: boolean) => void;

  filteredMaterials: string[];
  setFilteredMaterials: (materials: string[]) => void;
  filteredMaterialOnly: boolean;
  setFilteredMaterialOnly: (only: boolean) => void;

  filteredSizes: string[];
  setFilteredSizes: (sizes: string[]) => void;
  filteredSizeOnly: boolean;
  setFilteredSizeOnly: (only: boolean) => void;

  filteredHashtags: string[];
  setFilteredHashtags: (hashtags: string[]) => void;
  filteredHashtagOnly: boolean;
  setFilteredHashtagOnly: (only: boolean) => void;
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filteredColors: [],
  setFilteredColors: (colors: string[]) => set({ filteredColors: colors }),
  filteredColorOnly: false,
  setFilteredColorOnly: (only: boolean) => set({ filteredColorOnly: only }),

  filteredMaterials: [],
  setFilteredMaterials: (materials: string[]) => set({ filteredMaterials: materials }),
  filteredMaterialOnly: false,
  setFilteredMaterialOnly: (only: boolean) => set({ filteredMaterialOnly: only }),

  filteredSizes: [],
  setFilteredSizes: (sizes: string[]) => set({ filteredSizes: sizes }),
  filteredSizeOnly: false,
  setFilteredSizeOnly: (only: boolean) => set({ filteredSizeOnly: only }),

  filteredHashtags: [],
  setFilteredHashtags: (hashtags: string[]) => set({ filteredHashtags: hashtags }),
  filteredHashtagOnly: false,
  setFilteredHashtagOnly: (only: boolean) => set({ filteredHashtagOnly: only }),
}));
