import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  createdAt: string;
}

export type UserFormData = Omit<User, "id" | "createdAt">;

interface UsersStore {
  users: User[];
  addUser: (data: UserFormData) => void;
  updateUser: (id: string, data: UserFormData) => void;
  removeUser: (id: string) => void;
}

export const useUsersStore = create<UsersStore>()(
  persist(
    (set) => ({
      users: [],
      addUser: (data) =>
        set((s) => ({
          users: [
            ...s.users,
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateUser: (id, data) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),
      removeUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),
    }),
    { name: "users-store" },
  ),
);
