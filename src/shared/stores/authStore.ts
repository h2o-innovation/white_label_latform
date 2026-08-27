import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../../features/users/infrastructure/usersStore";

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  role: "admin" | "user";
}

interface AuthStore {
  currentUser: AuthUser | null;
  login: (identifier: string, password: string, users: User[]) => boolean;
  logout: () => void;
}

const ADMIN = { identifier: "admin", password: "admin" };

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (identifier, password, users) => {
        if (identifier === ADMIN.identifier && password === ADMIN.password) {
          set({
            currentUser: {
              id: "admin",
              nombre: "Admin",
              correo: "admin",
              role: "admin",
            },
          });
          return true;
        }
        const user = users.find(
          (u) => u.correo === identifier && u.password === password,
        );
        if (user) {
          set({
            currentUser: {
              id: user.id,
              nombre: user.nombre,
              correo: user.correo,
              role: "user",
            },
          });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
    }),
    { name: "auth-store" },
  ),
);
