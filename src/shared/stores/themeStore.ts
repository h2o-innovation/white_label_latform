import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  mode: "light" | "dark";
  setMode: (mode: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "light",
      setMode: (mode) => set({ mode }),
    }),
    { name: "theme-store" },
  ),
);
