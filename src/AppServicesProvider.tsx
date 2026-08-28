import type { PropsWithChildren } from "react";
import { AppServicesContext } from "./shared/application/AppServicesContext";
import { useAuthStore } from "./shared/stores/authStore";
import { useModalStore } from "./shared/stores/modalStore";
import { useThemeStore } from "./shared/stores/themeStore";
import { useClientsStore } from "./features/clients/infrastructure/clientsStore";
import { useCategoriesStore } from "./features/categories/infrastructure/categoriesStore";
import { usePermissionsStore } from "./features/categories/infrastructure/permissionsStore";
import { useFormsStore } from "./features/forms/infrastructure/formsStore";
import { useFormEntriesStore } from "./features/forms/infrastructure/formEntriesStore";
import { useFormBuilderStore } from "./features/forms/infrastructure/formBuilderStore";
import { useUsersStore } from "./features/users/infrastructure/usersStore";

/** Composition root: infrastructure implementations are wired here once. */
export function AppServicesProvider({ children }: PropsWithChildren) {
  const services = {
    auth: useAuthStore(),
    modal: useModalStore(),
    theme: useThemeStore(),
    clients: useClientsStore(),
    categories: useCategoriesStore(),
    permissions: usePermissionsStore(),
    forms: useFormsStore(),
    formEntries: useFormEntriesStore(),
    formBuilder: useFormBuilderStore(),
    users: useUsersStore(),
  };

  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}
