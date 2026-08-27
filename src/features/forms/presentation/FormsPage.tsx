import { useState } from "react";
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import { useFormsStore, type FormCategory } from "../infrastructure/formsStore";
import { useAuthStore } from "../../../shared/stores/authStore";
import { usePermissionsStore } from "../../categories/infrastructure/permissionsStore";

export function FormsPage() {
  const allCategories = useFormsStore((state) => state.categories);
  const renameCategory = useFormsStore((s) => s.renameCategory);
  const currentUser = useAuthStore((s) => s.currentUser);
  const getUserIds = usePermissionsStore((s) => s.getUserIds);
  const navigate = useNavigate();
  const [editTarget, setEditTarget] = useState<FormCategory | null>(null);
  const [draftName, setDraftName] = useState("");

  const isAdmin = currentUser?.role === "admin";
  const categories = isAdmin
    ? allCategories
    : allCategories.filter((cat) =>
        getUserIds(cat.id).includes(currentUser?.id ?? ""),
      );

  const openEdit = (e: React.MouseEvent, cat: FormCategory) => {
    e.stopPropagation();
    navigate(`/forms/edit/${cat.id}`);
  };

  const handleSave = () => {
    if (editTarget && draftName.trim())
      renameCategory(editTarget.id, draftName.trim());
    setEditTarget(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 1 }}>
        {categories.map((cat) => (
          <Paper
            key={cat.id}
            component={ButtonBase}
            onClick={() => navigate(cat.route ?? `/forms/${cat.id}`)}
            sx={{
              width: 160,
              height: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
              "&:hover": { bgcolor: "action.hover" },
              "&:hover .edit-btn": { opacity: 1 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {cat.name}
            </Typography>
            {isAdmin && (
              <IconButton
                className="edit-btn"
                size="small"
                onClick={(e) => openEdit(e, cat)}
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ))}
        {isAdmin && (
          <Paper
            component={ButtonBase}
            onClick={() => navigate("/forms/new")}
            sx={{
              width: 160,
              height: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: "primary.main",
              border: "none",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            <AddIcon sx={{ fontSize: 40, color: "white" }} />
          </Paper>
        )}
      </Box>

      <Dialog
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar formulário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome do formulário"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setEditTarget(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!draftName.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
