import { Box } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useAppServices } from "../../application/AppServicesContext";

export function AppLayout() {
  const { auth: { currentUser } } = useAppServices();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Header />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
