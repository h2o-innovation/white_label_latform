import { useState } from "react";
import {
  Box,
  Button,
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
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import type { FormCategory } from "../infrastructure/formsStore";
import { useAppServices } from "../../../shared/application/AppServicesContext";

export function FormsPage() {
  const { forms, auth, permissions, formEntries } = useAppServices();
  const { categories: allCategories, renameCategory, removeCategory } = forms;
  const currentUser = auth.currentUser;
  const getUserIds = permissions.getUserIds;
  const allEntries = formEntries.entries;
  const navigate = useNavigate();
  const [editTarget, setEditTarget] = useState<FormCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormCategory | null>(null);
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
            onClick={() => navigate(cat.route ?? `/forms/${cat.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(cat.route ?? `/forms/${cat.id}`);
              }
            }}
            role="button"
            tabIndex={0}
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
            <Typography
              variant="subtitle1"
              fontWeight={600}
              title={cat.name}
              sx={{
                width: "100%",
                px: 1.5,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {cat.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(allEntries[cat.id] ?? []).length}{" "}
              {(allEntries[cat.id] ?? []).length === 1 ? "entrada" : "entradas"}
            </Typography>
            {isAdmin && (
              <Box
                className="edit-btn"
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  opacity: 0,
                  transition: "opacity 0.15s",
                  display: "flex",
                  gap: 0.5,
                }}
              >
                <IconButton size="small" onClick={(e) => openEdit(e, cat)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(cat);
                  }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Paper>
        ))}
        {isAdmin && (
          <Paper
            onClick={() => navigate("/forms/new")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate("/forms/new");
              }
            }}
            role="button"
            tabIndex={0}
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

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>Excluir formulário?</DialogTitle>
        <DialogContent>
          O formulário "<strong>{deleteTarget?.name}</strong>" e todas as suas
          entradas serão removidos permanentemente.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) removeCategory(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
