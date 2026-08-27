import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FormPermission {
  formId: string;
  userIds: string[];
}

interface PermissionsStore {
  permissions: FormPermission[];
  setPermissions: (formId: string, userIds: string[]) => void;
  getUserIds: (formId: string) => string[];
}

export const usePermissionsStore = create<PermissionsStore>()(
  persist(
    (set, get) => ({
      permissions: [],
      setPermissions: (formId, userIds) =>
        set((s) => ({
          permissions: [
            ...s.permissions.filter((p) => p.formId !== formId),
            { formId, userIds },
          ],
        })),
      getUserIds: (formId) =>
        get().permissions.find((p) => p.formId === formId)?.userIds ?? [],
    }),
    { name: "permissions-store" },
  ),
);
