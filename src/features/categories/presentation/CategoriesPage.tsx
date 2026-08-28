import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import type { FormCategory } from "../../forms/infrastructure/formsStore";
import { useAppServices } from "../../../shared/application/AppServicesContext";

export function CategoriesPage() {
  const { categories, forms } = useAppServices();
  const { groups, addGroup, updateGroup, removeGroup } = categories;
  const navigate = useNavigate();
  const allForms = forms.categories.filter((c) => !c.route);

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(typeof groups)[0] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<(typeof groups)[0] | null>(
    null,
  );
  const [name, setName] = useState("");
  const [selectedForms, setSelectedForms] = useState<FormCategory[]>([]);

  const openCreate = () => {
    setEditTarget(null);
    setName("");
    setSelectedForms([]);
    setOpen(true);
  };

  const openEdit = (e: React.MouseEvent, group: (typeof groups)[0]) => {
    e.stopPropagation();
    setEditTarget(group);
    setName(group.name);
    setSelectedForms(allForms.filter((f) => group.formIds.includes(f.id)));
    setOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const formIds = selectedForms.map((f) => f.id);
    if (editTarget) updateGroup(editTarget.id, name.trim(), formIds);
    else addGroup(name.trim(), formIds);
    setOpen(false);
  };

  const blockSx = {
    width: 160,
    height: 160,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    border: "1px solid",
    borderColor: "divider",
  } as const;

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 1 }}>
        {groups.map((group) => (
          <Paper
            key={group.id}
            component={ButtonBase}
            onClick={() => navigate(`/categories/${group.id}`)}
            sx={{
              ...blockSx,
              bgcolor: "background.paper",
              position: "relative",
              "&:hover": { bgcolor: "action.hover" },
              "&:hover .edit-btn": { opacity: 1 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {group.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.formIds.length}{" "}
              {group.formIds.length === 1 ? "formulário" : "formulários"}
            </Typography>
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
              <IconButton size="small" onClick={(e) => openEdit(e, group)}>
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(group);
                }}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
        <Paper
          component={ButtonBase}
          onClick={() => openCreate()}
          sx={{
            ...blockSx,
            bgcolor: "primary.main",
            border: "none",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <AddIcon sx={{ fontSize: 40, color: "white" }} />
        </Paper>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editTarget ? "Editar categoria" : "Nova categoria"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Nome da categoria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <Autocomplete
              multiple
              options={allForms}
              getOptionLabel={(o) => o.name}
              value={selectedForms}
              onChange={(_, v) => setSelectedForms(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Formulários"
                  placeholder="Buscar formulário..."
                />
              )}
              noOptionsText="Nenhum formulário encontrado"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            {editTarget ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>Excluir categoria?</DialogTitle>
        <DialogContent>
          A categoria "<strong>{deleteTarget?.name}</strong>" será removida
          permanentemente.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) removeGroup(deleteTarget.id);
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
