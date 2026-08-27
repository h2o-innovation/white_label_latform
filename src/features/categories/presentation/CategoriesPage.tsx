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
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCategoriesStore } from "../infrastructure/categoriesStore";
import {
  useFormsStore,
  type FormCategory,
} from "../../forms/infrastructure/formsStore";

export function CategoriesPage() {
  const groups = useCategoriesStore((s) => s.groups);
  const addGroup = useCategoriesStore((s) => s.addGroup);
  const allForms = useFormsStore((s) => s.categories.filter((c) => !c.route));

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedForms, setSelectedForms] = useState<FormCategory[]>([]);

  const handleSave = () => {
    if (!name.trim()) return;
    addGroup(
      name.trim(),
      selectedForms.map((f) => f.id),
    );
    setName("");
    setSelectedForms([]);
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
            sx={{
              ...blockSx,
              bgcolor: "grey.100",
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {group.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.formIds.length}{" "}
              {group.formIds.length === 1 ? "formulário" : "formulários"}
            </Typography>
          </Paper>
        ))}
        <Paper
          component={ButtonBase}
          onClick={() => setOpen(true)}
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
        <DialogTitle>Nova categoria</DialogTitle>
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
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
