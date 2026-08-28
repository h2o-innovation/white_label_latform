import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import ViewColumnOutlined from "@mui/icons-material/ViewColumnOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import type {
  FormColumn,
  FormComponent,
  FormRow,
  SelectOption,
} from "../../infrastructure/formBuilderStore";
import { useFormBuilderStore } from "../../infrastructure/formBuilderStore";
import { useFormsStore } from "../../infrastructure/formsStore";

function ComponentPreview({ component }: { component: FormComponent }) {
  switch (component.type) {
    case "text":
    case "email":
    case "phone":
      return (
        <TextField
          size="small"
          fullWidth
          disabled
          label={component.label}
          placeholder={component.placeholder || undefined}
        />
      );
    case "number":
      return (
        <TextField
          size="small"
          fullWidth
          disabled
          type="number"
          label={component.label}
        />
      );
    case "date":
      return (
        <TextField
          size="small"
          fullWidth
          disabled
          type="date"
          label={component.label}
          InputLabelProps={{ shrink: true }}
        />
      );
    case "select":
    case "multiselect":
      return (
        <FormControl fullWidth size="small" disabled>
          <InputLabel>{component.label}</InputLabel>
          <Select label={component.label} value="">
            {component.options.map((o) => (
              <MenuItem key={o.id} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "image":
      return (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "text.disabled",
            borderRadius: 1,
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          {component.url ? (
            <Box
              component="img"
              src={component.url}
              alt={component.label}
              sx={{
                width: "100%",
                maxHeight: 120,
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Box sx={{ p: 2 }}>
              <ImageOutlined sx={{ color: "text.disabled", fontSize: 32 }} />
              <Typography
                variant="caption"
                display="block"
                color="text.disabled"
              >
                {component.label}
              </Typography>
            </Box>
          )}
        </Box>
      );
    case "button":
      return (
        <Button variant="contained" size="small" disabled>
          {component.label}
        </Button>
      );
    default:
      return null;
  }
}

interface ColumnZoneProps {
  column: FormColumn;
  rowId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ColumnZone({ column, rowId, isSelected, onSelect }: ColumnZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
    data: { target: "column", rowId, columnId: column.id },
  });
  const updateComponent = useFormBuilderStore((s) => s.updateComponent);
  const removeComponent = useFormBuilderStore((s) => s.removeComponent);
  const [editOpen, setEditOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftOptions, setDraftOptions] = useState<SelectOption[]>([]);
  const [draftDataSourceFormId, setDraftDataSourceFormId] = useState("");
  const [draftDataSourceFieldId, setDraftDataSourceFieldId] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [addOptionOpen, setAddOptionOpen] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionFormId, setNewOptionFormId] = useState("");
  const [newOptionFieldId, setNewOptionFieldId] = useState("");

  const allForms = useFormsStore((s) => s.categories.filter((c) => !c.route));
  const dataSourceFormSteps =
    allForms.find((f) => f.id === draftDataSourceFormId)?.steps ?? [];
  const dataSourceFields = dataSourceFormSteps.flatMap((step) =>
    step.rows.flatMap((row) =>
      row.columns
        .map((c) => c.component)
        .filter(
          (c): c is FormComponent =>
            c !== null && c.type !== "image" && c.type !== "button",
        ),
    ),
  );
  const linkedFormSteps =
    allForms.find((f) => f.id === newOptionFormId)?.steps ?? [];
  const linkedFormFields = linkedFormSteps.flatMap((step) =>
    step.rows.flatMap((row) =>
      row.columns
        .map((c) => c.component)
        .filter(
          (c): c is FormComponent =>
            c !== null && c.type !== "image" && c.type !== "button",
        ),
    ),
  );

  const isSelect =
    column.component?.type === "select" ||
    column.component?.type === "multiselect";

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftLabel(column.component!.label);
    setDraftOptions([...(column.component!.options ?? [])]);
    setDraftDataSourceFormId(column.component!.dataSourceFormId ?? "");
    setDraftDataSourceFieldId(column.component!.dataSourceFieldId ?? "");
    setDraftUrl(column.component!.url ?? "");
    setEditOpen(true);
  };

  const handleSave = () => {
    if (column.component)
      updateComponent(column.component.id, {
        label: draftLabel,
        options: draftOptions,
        dataSourceFormId: draftDataSourceFormId || undefined,
        dataSourceFieldId: draftDataSourceFieldId || undefined,
        url: draftUrl || undefined,
      });
    setEditOpen(false);
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim() && !newOptionFieldId) return;
    const label =
      newOptionLabel.trim() ||
      linkedFormFields.find((f) => f.id === newOptionFieldId)?.label ||
      "Opção";
    setDraftOptions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label,
        value: newOptionFieldId
          ? `${newOptionFormId}.${newOptionFieldId}`
          : label.toLowerCase().replace(/\s+/g, "_"),
        linkedFormId: newOptionFormId || undefined,
        linkedFieldId: newOptionFieldId || undefined,
      },
    ]);
    setNewOptionLabel("");
    setNewOptionFormId("");
    setNewOptionFieldId("");
    setAddOptionOpen(false);
  };
  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: 1,
        minHeight: 80,
        borderRadius: 1,
        p: 0.5,
        position: "relative",
        border: "2px dashed",
        borderColor: isOver
          ? "primary.main"
          : column.component
            ? "transparent"
            : "divider",
        bgcolor: isOver ? "primary.50" : "transparent",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      {column.component ? (
        <Box
          onClick={() => onSelect(column.component!.id)}
          sx={{
            p: 0.5,
            borderRadius: 1,
            cursor: "pointer",
            position: "relative",
            outline: isSelected ? "2px solid" : "none",
            outlineColor: "primary.main",
            "&:hover .col-actions": { opacity: 1 },
          }}
        >
          <ComponentPreview component={column.component} />
          <Box
            className="col-actions"
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              opacity: 0,
              transition: "opacity 0.15s",
            }}
          >
            <IconButton size="small" onClick={openEdit}>
              <MoreVertOutlined fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            minHeight: 76,
          }}
        >
          <Typography variant="caption" color="text.disabled">
            Solte aqui
          </Typography>
        </Box>
      )}

      {/* Field edit modal */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar campo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nome do campo"
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSelect) handleSave();
            }}
            sx={{ mt: 1 }}
          />
          {column.component?.type === "image" && (
            <TextField
              fullWidth
              size="small"
              label="URL da imagem"
              placeholder="https://..."
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {isSelect && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Opções
              </Typography>

              {/* Data source section */}
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>Fonte de dados (formulário)</InputLabel>
                <Select
                  label="Fonte de dados (formulário)"
                  value={draftDataSourceFormId}
                  onChange={(e) => {
                    setDraftDataSourceFormId(e.target.value as string);
                    setDraftDataSourceFieldId("");
                  }}
                >
                  <MenuItem value="">
                    <em>Nenhum — opções manuais</em>
                  </MenuItem>
                  {allForms.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {draftDataSourceFormId && (
                <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                  <InputLabel>Campo do formulário</InputLabel>
                  <Select
                    label="Campo do formulário"
                    value={draftDataSourceFieldId}
                    onChange={(e) =>
                      setDraftDataSourceFieldId(e.target.value as string)
                    }
                  >
                    <MenuItem value="">
                      <em>Selecione um campo</em>
                    </MenuItem>
                    {dataSourceFields.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Manual options — only shown when no data source is configured */}
              {!draftDataSourceFormId && (
                <>
                  <List dense disablePadding>
                    {draftOptions.map((opt) => (
                      <ListItem
                        key={opt.id}
                        disableGutters
                        secondaryAction={
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() =>
                              setDraftOptions((p) =>
                                p.filter((o) => o.id !== opt.id),
                              )
                            }
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={opt.label} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    size="small"
                    startIcon={<AddOutlined />}
                    onClick={() => {
                      setNewOptionLabel("");
                      setAddOptionOpen(true);
                    }}
                    sx={{ mt: 0.5 }}
                  >
                    Adicionar opção
                  </Button>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            color="error"
            size="small"
            onClick={() => {
              if (column.component) removeComponent(rowId, column.id);
              setEditOpen(false);
            }}
          >
            Remover campo
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addOptionOpen}
        onClose={() => setAddOptionOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nova opção</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nome da opção"
            value={newOptionLabel}
            onChange={(e) => setNewOptionLabel(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Vincular a formulário</InputLabel>
            <Select
              label="Vincular a formulário"
              value={newOptionFormId}
              onChange={(e) => {
                setNewOptionFormId(e.target.value as string);
                setNewOptionFieldId("");
              }}
            >
              <MenuItem value="">
                <em>Nenhum</em>
              </MenuItem>
              {allForms.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {newOptionFormId && (
            <FormControl fullWidth size="small">
              <InputLabel>Campo do formulário</InputLabel>
              <Select
                label="Campo do formulário"
                value={newOptionFieldId}
                onChange={(e) => {
                  const fieldId = e.target.value as string;
                  setNewOptionFieldId(fieldId);
                  if (!newOptionLabel) {
                    const field = linkedFormFields.find(
                      (f) => f.id === fieldId,
                    );
                    if (field) setNewOptionLabel(field.label);
                  }
                }}
              >
                <MenuItem value="">
                  <em>Selecione um campo</em>
                </MenuItem>
                {linkedFormFields.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setAddOptionOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddOption}
            disabled={!newOptionLabel.trim() && !newOptionFieldId}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface RowCardProps {
  row: FormRow;
}

function RowCard({ row }: RowCardProps) {
  const selectedComponentId = useFormBuilderStore((s) => s.selectedComponentId);
  const setSelectedComponent = useFormBuilderStore(
    (s) => s.setSelectedComponent,
  );
  const addColumn = useFormBuilderStore((s) => s.addColumn);
  const removeRow = useFormBuilderStore((s) => s.removeRow);
  const removeColumn = useFormBuilderStore((s) => s.removeColumn);

  const activeStepId = useFormBuilderStore((s) => s.activeStepId);

  return (
    <Box
      sx={{
        mb: 1.5,
        p: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        position: "relative",
        "&:hover .row-actions": { opacity: 1 },
      }}
    >
      <Box
        className="row-actions"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: 0,
          transition: "opacity 0.15s",
          display: "flex",
          gap: 0.5,
          zIndex: 1,
        }}
      >
        <Tooltip title="Remover linha">
          <IconButton
            size="small"
            color="error"
            onClick={() => removeRow(activeStepId, row.id)}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
        {row.columns.map((col) => (
          <Box key={col.id} sx={{ flex: 1, position: "relative" }}>
            {row.columns.length > 1 && (
              <Box
                className="row-actions"
                sx={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  opacity: 0,
                  transition: "opacity 0.15s",
                  zIndex: 2,
                }}
              >
                <Tooltip title="Remover coluna">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeColumn(row.id, col.id)}
                    sx={{ bgcolor: "background.paper", width: 18, height: 18 }}
                  >
                    <DeleteOutline sx={{ fontSize: 12 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            <ColumnZone
              column={col}
              rowId={row.id}
              isSelected={col.component?.id === selectedComponentId}
              onSelect={setSelectedComponent}
            />
          </Box>
        ))}
        {row.columns.length < 3 && (
          <Tooltip title="Adicionar coluna">
            <IconButton
              size="small"
              onClick={() => addColumn(row.id)}
              sx={{ alignSelf: "center" }}
            >
              <ViewColumnOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export function FormCanvas() {
  const steps = useFormBuilderStore((s) => s.steps);
  const activeStepId = useFormBuilderStore((s) => s.activeStepId);
  const setActiveStep = useFormBuilderStore((s) => s.setActiveStep);
  const addRow = useFormBuilderStore((s) => s.addRow);
  const setSelectedComponent = useFormBuilderStore(
    (s) => s.setSelectedComponent,
  );

  const activeStep = steps.find((s) => s.id === activeStepId);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedComponent(null);
      }}
    >
      {/* Step tabs */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          px: 2,
          pt: 2,
          pb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          overflowX: "auto",
        }}
      >
        {steps.map((step) => (
          <Button
            key={step.id}
            size="small"
            variant={step.id === activeStepId ? "contained" : "outlined"}
            onClick={() => setActiveStep(step.id)}
            sx={{ whiteSpace: "nowrap", textTransform: "none" }}
          >
            {step.name}
          </Button>
        ))}
      </Box>

      {/* Canvas area */}
      <Box
        sx={{ flex: 1, overflowY: "auto", p: 2 }}
        onClick={() => setSelectedComponent(null)}
      >
        {activeStep?.rows.map((row) => (
          <RowCard key={row.id} row={row} />
        ))}
        <Button
          size="small"
          startIcon={<AddOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            addRow(activeStepId);
          }}
          sx={{ mt: 1 }}
        >
          Adicionar linha
        </Button>
      </Box>
    </Box>
  );
}
