import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormGroup {
  id: string;
  name: string;
  formIds: string[];
}

interface CategoriesStore {
  groups: FormGroup[];
  addGroup: (name: string, formIds: string[]) => void;
}

export const useCategoriesStore = create<CategoriesStore>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (name, formIds) =>
        set((s) => ({
          groups: [...s.groups, { id: crypto.randomUUID(), name, formIds }],
        })),
    }),
    { name: "categories-store" },
  ),
);
