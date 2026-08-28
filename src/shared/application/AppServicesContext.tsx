import { createContext, useContext } from "react";
import type { useAuthStore } from "../stores/authStore";
import type { useModalStore } from "../stores/modalStore";
import type { useThemeStore } from "../stores/themeStore";
import type { useClientsStore } from "../../features/clients/infrastructure/clientsStore";
import type { useCategoriesStore } from "../../features/categories/infrastructure/categoriesStore";
import type { usePermissionsStore } from "../../features/categories/infrastructure/permissionsStore";
import type { useFormsStore } from "../../features/forms/infrastructure/formsStore";
import type { useFormEntriesStore } from "../../features/forms/infrastructure/formEntriesStore";
import type { useFormBuilderStore } from "../../features/forms/infrastructure/formBuilderStore";
import type { useUsersStore } from "../../features/users/infrastructure/usersStore";

export interface AppServices {
  auth: ReturnType<typeof useAuthStore.getState>;
  modal: ReturnType<typeof useModalStore.getState>;
  theme: ReturnType<typeof useThemeStore.getState>;
  clients: ReturnType<typeof useClientsStore.getState>;
  categories: ReturnType<typeof useCategoriesStore.getState>;
  permissions: ReturnType<typeof usePermissionsStore.getState>;
  forms: ReturnType<typeof useFormsStore.getState>;
  formEntries: ReturnType<typeof useFormEntriesStore.getState>;
  formBuilder: ReturnType<typeof useFormBuilderStore.getState>;
  users: ReturnType<typeof useUsersStore.getState>;
}

export const AppServicesContext = createContext<AppServices | null>(null);

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);
  if (!services) {
    throw new Error("useAppServices must be used inside AppServicesProvider");
  }
  return services;
}
