import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormCategory {
  id: string;
  name: string;
  route?: string;
}

interface FormsStore {
  categories: FormCategory[];
  addCategory: (name: string) => void;
}

export const useFormsStore = create<FormsStore>()(
  persist(
    (set) => ({
      categories: [{ id: "clientes", name: "Clientes", route: "/clients" }],
      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: name.toLowerCase().replace(/\s+/g, "-"), name },
          ],
        })),
    }),
    { name: "forms-store" },
  ),
);
