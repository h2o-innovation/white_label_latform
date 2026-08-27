import { Box, Button, Toolbar, Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { useLocation, useMatch } from "react-router-dom";
import { useModalStore } from "../../stores/modalStore";
import { useFormsStore } from "../../../features/forms/infrastructure/formsStore";

const titles: Record<string, string> = {
  "/clients": "Clientes",
  "/categories": "Categorias",
  "/forms": "Formulários",
  "/forms/new": "Novo Formulário",
  "/settings": "Configurações",
};

export function Header() {
  const location = useLocation();
  const formsMatch = useMatch("/forms/:categoryId");
  const categories = useFormsStore((s) => s.categories);
  const openModal = useModalStore((state) => state.openModal);
  const isClientsPage = location.pathname === "/clients";

  const title = formsMatch
    ? (categories.find((c) => c.id === formsMatch.params.categoryId)?.name ??
      "Formulário")
    : (titles[location.pathname] ?? "Cadastro Local");
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
          {title}
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
