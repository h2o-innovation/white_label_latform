import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useFormsStore } from "../infrastructure/formsStore";
import {
  useFormEntriesStore,
  type FormEntry,
} from "../infrastructure/formEntriesStore";
import type {
  FormComponent,
  FormStep,
} from "../infrastructure/formBuilderStore";
import { FormEntryModal } from "./components/FormEntryModal";

function getAllFields(steps: FormStep[]): FormComponent[] {
  return steps.flatMap((step) =>
    step.rows.flatMap((row) =>
      row.columns
        .map((c) => c.component)
        .filter(
          (c): c is FormComponent =>
            c !== null && c.type !== "image" && c.type !== "button",
        ),
    ),
  );
}

export function FormEntriesPage() {
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const category = useFormsStore((s) =>
    s.categories.find((c) => c.id === categoryId),
  );
  const entries = useFormEntriesStore((s) => s.entries[categoryId] ?? []);
  const addEntry = useFormEntriesStore((s) => s.addEntry);
  const updateEntry = useFormEntriesStore((s) => s.updateEntry);
  const deleteEntry = useFormEntriesStore((s) => s.deleteEntry);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FormEntry | null>(null);
  const [viewTarget, setViewTarget] = useState<FormEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormEntry | null>(null);

  const steps: FormStep[] = (category?.steps ?? []) as FormStep[];
  const fields = useMemo(() => getAllFields(steps), [steps]);

  const columns = useMemo<MRT_ColumnDef<FormEntry>[]>(
    () => [
      ...fields.map((f) => ({
        accessorFn: (row: FormEntry) => row.data[f.id] ?? "",
        id: f.id,
        header: f.label,
      })),
      {
        accessorKey: "createdAt",
        header: "Criado em",
        Cell: ({ cell }: { cell: { getValue: () => unknown } }) =>
          new Date(cell.getValue() as string).toLocaleDateString("pt-BR"),
      },
    ],
    [fields],
  );

  if (!category)
    return <Alert severity="warning">Formulário não encontrado.</Alert>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4">{category.name}</Typography>
          <Typography color="text.secondary">
            {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Nova entrada
        </Button>
      </Stack>

      {fields.length === 0 && (
        <Alert severity="info">
          Nenhum campo definido. Os dados serão registrados apenas com data de
          criação.
        </Alert>
      )}

      {entries.length === 0 && (
        <Alert severity="info">
          Nenhuma entrada ainda. Clique em "Nova entrada" para começar.
        </Alert>
      )}

      <Paper sx={{ overflow: "hidden" }}>
        <MaterialReactTable
          columns={columns}
          data={entries}
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

      <FormEntryModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        steps={steps}
        onSubmit={(data) => addEntry(categoryId, data)}
      />

      <FormEntryModal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        steps={steps}
        initialData={editTarget?.data}
        onSubmit={(data) =>
          editTarget && updateEntry(categoryId, editTarget.id, data)
        }
      />

      <FormEntryModal
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        steps={steps}
        initialData={viewTarget?.data}
        viewOnly
        onSubmit={() => {}}
      />

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
      >
        <DialogTitle>Excluir entrada?</DialogTitle>
        <DialogContent>Esta ação não pode ser desfeita.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) deleteEntry(categoryId, deleteTarget.id);
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
