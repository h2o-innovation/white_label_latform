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
import { defaultLabel, type ComponentType } from "../infrastructure/formBuilderStore";
import { useAppServices } from "../../../shared/application/AppServicesContext";
import type { FormTemplate } from "../application/formTemplates";
import { ComponentPalette } from "./components/ComponentPalette";
import { FormCanvas } from "./components/FormCanvas";
import { FlowPanel } from "./components/FlowPanel";
import { PropertyEditor } from "./components/PropertyEditor";
import { FormAssistantPanel } from "./components/FormAssistantPanel";

export function CreateFormPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const isEdit = !!categoryId;

  const { forms, formBuilder } = useAppServices();
  const { addCategory, updateCategory } = forms;
  const existingCategory = forms.categories.find((c) => c.id === categoryId);
  const { setComponent, selectedComponentId, steps, reset, loadSteps, insertSteps } = formBuilder;

  useEffect(() => {
    setFormName(existingCategory?.name ?? "");
    if (isEdit && existingCategory?.steps?.length) {
      loadSteps(existingCategory.steps);
    } else {
      reset();
    }
  }, [categoryId, existingCategory?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const [namingOpen, setNamingOpen] = useState(false);
  const [formName, setFormName] = useState(existingCategory?.name ?? "");
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);
  const [draggingTemplate, setDraggingTemplate] = useState<FormTemplate | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const handleSaveClick = () => {
    if (isEdit) {
      setFormName(existingCategory?.name ?? "");
      setNamingOpen(true);
    } else {
      setNamingOpen(true);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.source === "palette") {
      setDraggingType(event.active.data.current.componentType);
    }
    if (event.active.data.current?.source === "template") {
      setDraggingTemplate(event.active.data.current.template);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingType(null);
    setDraggingTemplate(null);
    const { active, over } = event;
    if (!over) return;
    const src = active.data.current;
    const dst = over.data.current;
    if (src?.source === "palette" && dst?.target === "column") {
      setComponent(dst.rowId, dst.columnId, src.componentType);
    }
    if (
      src?.source === "template" &&
      (dst?.target === "canvas" || dst?.target === "column")
    ) {
      insertSteps(src.template.steps);
    }
  };

  const handleConfirm = () => {
    if (!formName.trim()) return;
    if (isEdit) {
      updateCategory(categoryId!, formName.trim(), steps);
    } else {
      addCategory(formName.trim(), steps);
    }
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
        <Button
          variant={assistantOpen ? "outlined" : "text"}
          onClick={() => setAssistantOpen((open) => !open)}
        >
          ✨ Assistente
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
        {assistantOpen ? (
          <FormAssistantPanel onClose={() => setAssistantOpen(false)} />
        ) : selectedComponentId ? (
          <PropertyEditor />
        ) : (
          <FlowPanel />
        )}
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
        {draggingTemplate && (
          <Chip label={draggingTemplate.name} size="small" color="primary" sx={{ cursor: "grabbing" }} />
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
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
}
