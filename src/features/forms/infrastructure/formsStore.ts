import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormStep } from "./formBuilderStore";

export interface FormCategory {
  id: string;
  name: string;
  route?: string;
  steps?: FormStep[];
}

interface FormsStore {
  categories: FormCategory[];
  addCategory: (name: string, steps?: FormStep[]) => void;
  renameCategory: (id: string, name: string) => void;
  updateCategory: (id: string, name: string, steps: FormStep[]) => void;
  removeCategory: (id: string) => void;
}

export const useFormsStore = create<FormsStore>()(
  persist(
    (set) => ({
      categories: [],
      addCategory: (name, steps) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: name.toLowerCase().replace(/\s+/g, "-"), name, steps },
          ],
        })),
      renameCategory: (id, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name } : c,
          ),
        })),
      updateCategory: (id, name, steps) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, name, steps } : c,
          ),
        })),
      removeCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
    }),
    { name: "forms-store-v2" },
  ),
);
