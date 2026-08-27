import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './shared/components/layout/AppLayout'
import { ClientsPage } from './features/clients/presentation/ClientsPage'
import { SettingsPage } from './features/settings/presentation/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/clients" replace /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
