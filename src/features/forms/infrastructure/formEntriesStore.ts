import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EntryData = Record<string, string | string[]>;

export interface FormEntry {
  id: string;
  createdAt: string;
  data: EntryData;
}

interface FormEntriesStore {
  entries: Record<string, FormEntry[]>;
  addEntry: (categoryId: string, data: EntryData) => void;
  updateEntry: (categoryId: string, entryId: string, data: EntryData) => void;
  deleteEntry: (categoryId: string, entryId: string) => void;
}

export const useFormEntriesStore = create<FormEntriesStore>()(
  persist(
    (set) => ({
      entries: {},
      addEntry: (categoryId, data) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [categoryId]: [
              ...(s.entries[categoryId] ?? []),
              {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                data,
              },
            ],
          },
        })),
      updateEntry: (categoryId, entryId, data) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [categoryId]: (s.entries[categoryId] ?? []).map((e) =>
              e.id === entryId ? { ...e, data } : e,
            ),
          },
        })),
      deleteEntry: (categoryId, entryId) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [categoryId]: (s.entries[categoryId] ?? []).filter(
              (e) => e.id !== entryId,
            ),
          },
        })),
    }),
    { name: "form-entries-store" },
  ),
);
