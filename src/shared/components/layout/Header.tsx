import { Box, Button, Toolbar, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { useLocation } from "react-router-dom";
import { useModalStore } from "../../stores/modalStore";

const titles: Record<string, string> = {
  "/clients": "Clientes",
  "/forms": "Formulários",
  "/forms/new": "Novo Formulário",
  "/settings": "Configurações",
};

export function Header() {
  const location = useLocation();
  const openModal = useModalStore((state) => state.openModal);
  const isClientsPage = location.pathname === "/clients";
  return (
    <Box
      sx={{
        borderBottom: "1px solid #e5ebe7",
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Toolbar sx={{ minHeight: 72, width: "100%" }}>
        <Box sx={{ flex: 1 }} />
        <Typography variant="h5" color="text.primary">
          {titles[location.pathname] ?? "Cadastro Local"}
        </Typography>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          {isClientsPage && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openModal}
            >
              Novo Cadastro
            </Button>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
}
