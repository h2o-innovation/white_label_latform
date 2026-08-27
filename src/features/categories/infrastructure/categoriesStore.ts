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
  updateGroup: (id: string, name: string, formIds: string[]) => void;
}

export const useCategoriesStore = create<CategoriesStore>()(
  persist(
    (set) => ({
      groups: [],
      addGroup: (name, formIds) =>
        set((s) => ({
          groups: [...s.groups, { id: crypto.randomUUID(), name, formIds }],
        })),
      updateGroup: (id, name, formIds) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, name, formIds } : g)),
        })),
    }),
    { name: "categories-store" },
  ),
);
