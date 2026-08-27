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
}

export const useFormsStore = create<FormsStore>()(
  persist(
    (set) => ({
      categories: [{ id: "clientes", name: "Clientes", route: "/clients" }],
      addCategory: (name, steps) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: name.toLowerCase().replace(/\s+/g, "-"), name, steps },
          ],
        })),
    }),
    { name: "forms-store" },
  ),
);
