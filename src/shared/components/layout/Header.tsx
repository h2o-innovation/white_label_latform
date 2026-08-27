import {
  Box,
  Button,
  Chip,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { useModalStore } from "../../stores/modalStore";
import { useFormsStore } from "../../../features/forms/infrastructure/formsStore";
import { useCategoriesStore } from "../../../features/categories/infrastructure/categoriesStore";
import { useAuthStore } from "../../stores/authStore";

const titles: Record<string, string> = {
  "/clients": "Clientes",
  "/categories": "Categorias",
  "/forms": "Formulários",
  "/forms/new": "Novo Formulário",
  "/forms/edit": "Editar Formulário",
  "/users": "Usuários",
  "/settings": "Configurações",
};

export function Header() {
  const location = useLocation();
  const formsMatch = useMatch("/forms/:categoryId");
  const formsEditMatch = useMatch("/forms/edit/:categoryId");
  const categoriesMatch = useMatch("/categories/:groupId");
  const formCategories = useFormsStore((s) => s.categories);
  const groups = useCategoriesStore((s) => s.groups);
  const openModal = useModalStore((state) => state.openModal);
  const isClientsPage = location.pathname === "/clients";
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const editedForm = formCategories.find(
    (c) => c.id === formsEditMatch?.params.categoryId,
  );

  const title = formsEditMatch
    ? `Editando: ${editedForm?.name ?? "Formulário"}`
    : formsMatch
      ? (formCategories.find((c) => c.id === formsMatch.params.categoryId)
          ?.name ?? "Formulário")
      : categoriesMatch
        ? (groups.find((g) => g.id === categoriesMatch.params.groupId)?.name ??
          "Categoria")
        : (titles[location.pathname] ?? "Cadastro Local");
  return (
    <Box
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: "100%",
      }}
    >
      <Toolbar sx={{ minHeight: 72, width: "100%" }}>
        <Box sx={{ flex: 1 }} />
        <Typography variant="h5" color="text.primary">
          {title}
        </Typography>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isClientsPage && (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openModal}
            >
              Novo Cadastro
            </Button>
          )}
          {currentUser && (
            <>
              <Chip
                label={currentUser.nombre}
                size="small"
                variant="outlined"
              />
              <Tooltip title="Sair">
                <IconButton size="small" onClick={handleLogout}>
                  <LogoutOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
}
