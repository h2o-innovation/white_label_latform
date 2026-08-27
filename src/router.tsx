import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { CategoriesPage } from "./features/categories/presentation/CategoriesPage";
import { CategoryDetailPage } from "./features/categories/presentation/CategoryDetailPage";
import { ClientsPage } from "./features/clients/presentation/ClientsPage";
import { UsersPage } from "./features/users/presentation/UsersPage";
import { CreateFormPage } from "./features/forms/presentation/CreateFormPage";
import { FormEntriesPage } from "./features/forms/presentation/FormEntriesPage";
import { FormsPage } from "./features/forms/presentation/FormsPage";
import { SettingsPage } from "./features/settings/presentation/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/forms" replace /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "categories/:groupId", element: <CategoryDetailPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "forms", element: <FormsPage /> },
      { path: "forms/new", element: <CreateFormPage /> },
      { path: "forms/:categoryId", element: <FormEntriesPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
