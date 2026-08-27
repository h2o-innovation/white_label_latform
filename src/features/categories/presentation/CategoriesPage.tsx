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
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import { useCategoriesStore } from "../infrastructure/categoriesStore";
import {
  useFormsStore,
  type FormCategory,
} from "../../forms/infrastructure/formsStore";

export function CategoriesPage() {
  const groups = useCategoriesStore((s) => s.groups);
  const addGroup = useCategoriesStore((s) => s.addGroup);
  const updateGroup = useCategoriesStore((s) => s.updateGroup);
  const navigate = useNavigate();
  const allForms = useFormsStore((s) => s.categories.filter((c) => !c.route));

  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<(typeof groups)[0] | null>(null);
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
    borderColor: "grey.200",
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
              bgcolor: "grey.100",
              position: "relative",
              "&:hover": { bgcolor: "grey.200" },
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
            <IconButton
              className="edit-btn"
              size="small"
              onClick={(e) => openEdit(e, group)}
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
    </>
  );
}
