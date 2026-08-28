import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import type { FormCategory } from "../../forms/infrastructure/formsStore";
import type { User } from "../../users/infrastructure/usersStore";
import { useAppServices } from "../../../shared/application/AppServicesContext";

export function CategoryDetailPage() {
  const { groupId = "" } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { categories, forms: formsService, users, permissions } = useAppServices();
  const group = categories.groups.find((g) => g.id === groupId);
  const allForms = formsService.categories;
  const allUsers = users.users;
  const getUserIds = permissions.getUserIds;
  const setPermissions = permissions.setPermissions;

  const [permTarget, setPermTarget] = useState<FormCategory | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const openPermissions = (form: FormCategory) => {
    const currentIds = getUserIds(form.id);
    setSelectedUsers(allUsers.filter((u) => currentIds.includes(u.id)));
    setPermTarget(form);
  };

  const handleSave = () => {
    if (!permTarget) return;
    setPermissions(
      permTarget.id,
      selectedUsers.map((u) => u.id),
    );
    setPermTarget(null);
  };

  if (!group)
    return <Alert severity="warning">Categoria não encontrada.</Alert>;

  const forms = allForms.filter((f) => group.formIds.includes(f.id));

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {forms.length} {forms.length === 1 ? "formulário" : "formulários"}
      </Typography>
      {forms.length === 0 ? (
        <Alert severity="info">Nenhum formulário nesta categoria.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <List disablePadding>
            {forms.map((form, index) => {
              const assignedCount = getUserIds(form.id).length;
              return (
                <>
                  {index > 0 && <Divider key={`div-${form.id}`} />}
                  <ListItem
                    key={form.id}
                    sx={{ py: 1.5, px: 2 }}
                    secondaryAction={
                      <Tooltip title="Gerenciar permissões">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => openPermissions(form)}
                        >
                          <EditOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(form.route ?? `/forms/${form.id}`)
                          }
                        >
                          <Typography fontWeight={500}>{form.name}</Typography>
                          {assignedCount > 0 && (
                            <Chip
                              size="small"
                              label={`${assignedCount} usuário${assignedCount !== 1 ? "s" : ""}`}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                </>
              );
            })}
          </List>
        </Paper>
      )}

      <Dialog
        open={permTarget !== null}
        onClose={() => setPermTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Permissões — {permTarget?.name}</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={allUsers}
            getOptionLabel={(u) => `${u.nombre} ${u.apellido}`}
            value={selectedUsers}
            onChange={(_, v) => setSelectedUsers(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Usuários com acesso"
                placeholder="Buscar usuário..."
                sx={{ mt: 1 }}
              />
            )}
            noOptionsText="Nenhum usuário cadastrado"
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setPermTarget(null)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
