import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import type { User } from "../infrastructure/usersStore";
import { useAppServices } from "../../../shared/application/AppServicesContext";
import { UserFormModal } from "./UserFormModal";

export function UsersPage() {
  const { users: usersService } = useAppServices();
  const { users, addUser, updateUser, removeUser } = usersService;

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [viewTarget, setViewTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      { accessorKey: "nombre", header: "Nome" },
      { accessorKey: "apellido", header: "Sobrenome" },
      { accessorKey: "telefono", header: "Telefone" },
      { accessorKey: "correo", header: "E-mail" },
      {
        accessorKey: "createdAt",
        header: "Criado em",
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString("pt-BR"),
      },
    ],
    [],
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4">Usuários</Typography>
          <Typography color="text.secondary">
            {users.length}{" "}
            {users.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Novo usuário
        </Button>
      </Stack>

      {users.length === 0 && (
        <Alert severity="info">
          Nenhum usuário cadastrado. Clique em "Novo usuário" para começar.
        </Alert>
      )}

      <Paper sx={{ overflow: "hidden" }}>
        <MaterialReactTable
          columns={columns}
          data={users}
          enableColumnFilters
          enableRowActions
          positionActionsColumn="last"
          getRowId={(row) => row.id}
          renderRowActions={({ row }) => (
            <Stack direction="row">
              <Button
                size="small"
                aria-label="Visualizar"
                onClick={() => setViewTarget(row.original)}
              >
                <VisibilityOutlined />
              </Button>
              <Button
                size="small"
                aria-label="Editar"
                onClick={() => setEditTarget(row.original)}
              >
                <EditOutlined />
              </Button>
              <Button
                color="error"
                size="small"
                aria-label="Excluir"
                onClick={() => setDeleteTarget(row.original)}
              >
                <DeleteOutline />
              </Button>
            </Stack>
          )}
          muiTablePaperProps={{ elevation: 0 }}
          muiTableContainerProps={{ sx: { maxHeight: 560 } }}
        />
      </Paper>

      <UserFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(data) => addUser(data)}
      />

      <UserFormModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        editTarget={editTarget}
        onSubmit={(data) => editTarget && updateUser(editTarget.id, data)}
      />

      <UserFormModal
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        editTarget={viewTarget}
        viewOnly
        onSubmit={() => {}}
      />

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>Excluir usuário?</DialogTitle>
        <DialogContent>Esta ação não pode ser desfeita.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) removeUser(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
