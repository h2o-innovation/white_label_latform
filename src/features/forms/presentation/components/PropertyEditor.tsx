import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import type { FormComponent } from "../../infrastructure/formBuilderStore";
import { useAppServices } from "../../../../shared/application/AppServicesContext";

export function PropertyEditor() {
  const { formBuilder } = useAppServices();
  const { steps, selectedComponentId, updateComponent, removeComponent, setSelectedComponent } = formBuilder;

  // Find the component and its row/column context
  let found: {
    component: FormComponent | null;
    rowId: string;
    columnId: string;
  } | null = null;
  for (const step of steps) {
    for (const row of step.rows) {
      for (const col of row.columns) {
        if (col.component?.id === selectedComponentId) {
          found = { component: col.component, rowId: row.id, columnId: col.id };
        }
      }
    }
  }

  if (!found || !found.component) return null;
  const { component, rowId, columnId } = found;

  const hasOptions =
    component.type === "select" || component.type === "multiselect";

  const addOption = () =>
    updateComponent(component.id, {
      options: [
        ...component.options,
        {
          id: crypto.randomUUID(),
          label: "Opção",
          value: `option_${component.options.length + 1}`,
        },
      ],
    });

  const updateOption = (optId: string, label: string) =>
    updateComponent(component.id, {
      options: component.options.map((o) =>
        o.id === optId
          ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") }
          : o,
      ),
    });

  const removeOption = (optId: string) =>
    updateComponent(component.id, {
      options: component.options.filter((o) => o.id !== optId),
    });

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        bgcolor: "background.paper",
        borderLeft: "1px solid",
        borderColor: "divider",
        overflowY: "auto",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          Propriedades
        </Typography>
        <IconButton size="small" onClick={() => setSelectedComponent(null)}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        size="small"
        label="Rótulo"
        value={component.label}
        onChange={(e) =>
          updateComponent(component.id, { label: e.target.value })
        }
        sx={{ mb: 2 }}
      />

      {component.type !== "image" && component.type !== "button" && (
        <TextField
          fullWidth
          size="small"
          label="Placeholder"
          value={component.placeholder}
          onChange={(e) =>
            updateComponent(component.id, { placeholder: e.target.value })
          }
          sx={{ mb: 2 }}
        />
      )}

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={component.required}
            onChange={(e) =>
              updateComponent(component.id, { required: e.target.checked })
            }
          />
        }
        label={<Typography variant="body2">Obrigatório</Typography>}
        sx={{ mb: 2 }}
      />

      {hasOptions && (
        <>
          <Divider sx={{ mb: 1.5 }} />
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mb: 1 }}
          >
            Opções
          </Typography>
          {component.options.map((opt) => (
            <Box key={opt.id} sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
              <TextField
                size="small"
                fullWidth
                value={opt.label}
                onChange={(e) => updateOption(opt.id, e.target.value)}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeOption(opt.id)}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddOutlined />}
            onClick={addOption}
            sx={{ mt: 0.5 }}
          >
            Adicionar opção
          </Button>
        </>
      )}

      <Divider sx={{ my: 2 }} />
      <Button
        fullWidth
        size="small"
        color="error"
        variant="outlined"
        startIcon={<DeleteOutline />}
        onClick={() => {
          removeComponent(rowId, columnId);
          setSelectedComponent(null);
        }}
      >
        Remover campo
      </Button>
    </Box>
  );
}
