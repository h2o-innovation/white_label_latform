import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import type {
  FormComponent,
  FormStep,
} from "../../infrastructure/formBuilderStore";
import type { EntryData } from "../../infrastructure/formEntriesStore";

function DynamicField({
  component,
  register,
  control,
  disabled,
}: {
  component: FormComponent;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  disabled: boolean;
}) {
  switch (component.type) {
    case "text":
    case "email":
    case "phone":
      return (
        <TextField
          fullWidth
          size="small"
          disabled={disabled}
          label={component.label}
          placeholder={component.placeholder || undefined}
          {...register(component.id)}
        />
      );
    case "number":
      return (
        <TextField
          fullWidth
          size="small"
          type="number"
          disabled={disabled}
          label={component.label}
          {...register(component.id)}
        />
      );
    case "date":
      return (
        <TextField
          fullWidth
          size="small"
          type="date"
          disabled={disabled}
          label={component.label}
          InputLabelProps={{ shrink: true }}
          {...register(component.id)}
        />
      );
    case "select":
      return (
        <Controller
          name={component.id}
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormControl fullWidth size="small" disabled={disabled}>
              <InputLabel>{component.label}</InputLabel>
              <Select {...field} label={component.label}>
                {component.options.map((o) => (
                  <MenuItem key={o.id} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      );
    case "multiselect":
      return (
        <Controller
          name={component.id}
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <FormControl fullWidth size="small" disabled={disabled}>
              <InputLabel>{component.label}</InputLabel>
              <Select {...field} multiple label={component.label}>
                {component.options.map((o) => (
                  <MenuItem key={o.id} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      );
    default:
      return null;
  }
}

function StepFields({
  step,
  register,
  control,
  disabled,
}: {
  step: FormStep;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  disabled: boolean;
}) {
  const rows = step.rows
    .map((row) => ({
      id: row.id,
      fields: row.columns
        .map((c) => c.component)
        .filter(
          (c): c is FormComponent =>
            c !== null && c.type !== "image" && c.type !== "button",
        ),
    }))
    .filter((r) => r.fields.length > 0);

  if (rows.length === 0)
    return (
      <Typography color="text.secondary" variant="body2">
        Nenhum campo neste passo.
      </Typography>
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {rows.map((row) => (
        <Box key={row.id} sx={{ display: "flex", gap: 2 }}>
          {row.fields.map((f) => (
            <Box key={f.id} sx={{ flex: 1 }}>
              <DynamicField
                component={f}
                register={register}
                control={control}
                disabled={disabled}
              />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

interface FormEntryModalProps {
  open: boolean;
  onClose: () => void;
  steps: FormStep[];
  onSubmit: (data: EntryData) => void;
  initialData?: EntryData;
  viewOnly?: boolean;
}

export function FormEntryModal({
  open,
  onClose,
  steps,
  onSubmit,
  initialData,
  viewOnly = false,
}: FormEntryModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { register, handleSubmit, control, reset } = useForm<EntryData>({
    defaultValues: initialData ?? {},
  });

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      reset(initialData ?? {});
    }
  }, [open, initialData, reset]);

  const activeStep = steps[currentStep] ?? steps[0];
  const showStepper = steps.length > 1;

  const onFormSubmit = (data: EntryData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {viewOnly
          ? "Visualizar entrada"
          : initialData
            ? "Editar entrada"
            : "Nova entrada"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {showStepper && (
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
            {steps.map((s) => (
              <Step key={s.id}>
                <StepLabel>{s.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        {activeStep && (
          <StepFields
            step={activeStep}
            register={register}
            control={control}
            disabled={viewOnly}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {viewOnly ? (
          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep((s) => s - 1)}>
                Voltar
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Próximo
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit(onFormSubmit)}>
                Salvar
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
