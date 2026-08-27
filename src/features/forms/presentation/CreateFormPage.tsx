import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormsStore } from "../infrastructure/formsStore";
import {
  useFormBuilderStore,
  defaultLabel,
  type ComponentType,
} from "../infrastructure/formBuilderStore";
import { ComponentPalette } from "./components/ComponentPalette";
import { FormCanvas } from "./components/FormCanvas";
import { FlowPanel } from "./components/FlowPanel";
import { PropertyEditor } from "./components/PropertyEditor";

export function CreateFormPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const isEdit = !!categoryId;

  const addCategory = useFormsStore((s) => s.addCategory);
  const updateCategory = useFormsStore((s) => s.updateCategory);
  const existingCategory = useFormsStore((s) =>
    s.categories.find((c) => c.id === categoryId),
  );

  const setComponent = useFormBuilderStore((s) => s.setComponent);
  const selectedComponentId = useFormBuilderStore((s) => s.selectedComponentId);
  const steps = useFormBuilderStore((s) => s.steps);
  const reset = useFormBuilderStore((s) => s.reset);
  const loadSteps = useFormBuilderStore((s) => s.loadSteps);

  useEffect(() => {
    if (isEdit && existingCategory?.steps?.length) {
      loadSteps(existingCategory.steps);
    } else {
      reset();
    }
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [namingOpen, setNamingOpen] = useState(false);
  const [formName, setFormName] = useState(existingCategory?.name ?? "");
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);

  const handleSaveClick = () => {
    if (isEdit) {
      updateCategory(categoryId!, existingCategory?.name ?? "", steps);
      navigate("/forms");
    } else {
      setNamingOpen(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.source === "palette") {
      setDraggingType(event.active.data.current.componentType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingType(null);
    const { active, over } = event;
    if (!over) return;
    const src = active.data.current;
    const dst = over.data.current;
    if (src?.source === "palette" && dst?.target === "column") {
      setComponent(dst.rowId, dst.columnId, src.componentType);
    }
  };

  const handleConfirm = () => {
    if (!formName.trim()) return;
    addCategory(formName.trim(), steps);
    setNamingOpen(false);
    navigate("/forms");
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Action bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Button color="inherit" onClick={() => navigate("/forms")}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={isEdit ? handleSaveClick : () => setNamingOpen(true)}
        >
          Salvar formulário
        </Button>
      </Box>

      {/* 3-panel builder */}
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 140px)",
          overflow: "hidden",
        }}
      >
        <ComponentPalette />
        <FormCanvas />
        {selectedComponentId ? <PropertyEditor /> : <FlowPanel />}
      </Box>

      {/* Drag ghost */}
      <DragOverlay>
        {draggingType && (
          <Chip
            label={defaultLabel[draggingType]}
            size="small"
            color="primary"
            sx={{ cursor: "grabbing" }}
          />
        )}
      </DragOverlay>

      {/* Naming dialog */}
      <Dialog
        open={namingOpen}
        onClose={() => setNamingOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nome do formulário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nome do formulário"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setNamingOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!formName.trim()}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
}
