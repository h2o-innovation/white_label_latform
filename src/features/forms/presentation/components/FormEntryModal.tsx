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
  Stack,
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
import type {
  EntryData,
  FormEntry,
} from "../../infrastructure/formEntriesStore";
import { useAppServices } from "../../../../shared/application/AppServicesContext";

type ResolvedOption = { id: string; label: string; value: string; imageUrl?: string };

function OptionContent({ option }: { option: ResolvedOption }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      {option.imageUrl ? (
        <Box
          component="img"
          src={option.imageUrl}
          alt=""
          sx={{ width: 32, height: 32, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "action.hover", flexShrink: 0 }} />
      )}
      <Typography variant="body2" noWrap>{option.label}</Typography>
    </Box>
  );
}

function DynamicField({
  component,
  register,
  control,
  disabled,
  resolvedOptions,
}: {
  component: FormComponent;
  register: ReturnType<typeof useForm>["register"];
  control: ReturnType<typeof useForm>["control"];
  disabled: boolean;
  resolvedOptions: ResolvedOption[];
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
                {resolvedOptions.map((o) => (
                  <MenuItem key={o.id} value={o.value}>
                    <OptionContent option={o} />
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
                {resolvedOptions.map((o) => (
                  <MenuItem key={o.id} value={o.value}>
                    <OptionContent option={o} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      );
    default:
      if (component.type === "image") {
        return (
          <Controller
            name={component.id}
            control={control}
            defaultValue={component.url ?? ""}
            render={({ field }) => (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {!disabled && (
                  <TextField
                    fullWidth
                    size="small"
                    label={`URL — ${component.label}`}
                    placeholder="https://..."
                    {...field}
                  />
                )}
                {field.value ? (
                  <Box
                    sx={{
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      component="img"
                      src={field.value as string}
                      alt={component.label}
                      sx={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      {component.label}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          />
        );
      }
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
  const { formEntries } = useAppServices();
  const allEntries = formEntries.entries;

  const resolveOptions = (comp: FormComponent): ResolvedOption[] => {
    if (comp.dataSourceFormId && comp.dataSourceFieldId) {
      const entries: FormEntry[] = allEntries[comp.dataSourceFormId] ?? [];
      const seen = new Set<string>();
      return entries
        .map((entry) => {
          const value = String(entry.data[comp.dataSourceFieldId!] ?? "").trim();
          const label = String(entry.data[comp.dataSourceLabelFieldId ?? comp.dataSourceFieldId!] ?? value).trim() || value;
          const imageUrl = comp.dataSourceImageFieldId
            ? String(entry.data[comp.dataSourceImageFieldId] ?? "").trim()
            : undefined;
          return { id: value, label, value, imageUrl };
        })
        .filter((option) => option.value && !seen.has(option.value) && seen.add(option.value));
    }
    return comp.options;
  };
  const rows = step.rows
    .map((row) => ({
      id: row.id,
      fields: row.columns
        .map((c) => c.component)
        .filter((c): c is FormComponent => c !== null && c.type !== "button"),
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
                resolvedOptions={resolveOptions(f)}
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
        {viewOnly ? (
          <Stack spacing={3} divider={<Divider />}>
            {steps.map((s) => (
              <StepFields
                key={s.id}
                step={s}
                register={register}
                control={control}
                disabled
              />
            ))}
          </Stack>
        ) : (
          <>
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
                disabled={false}
              />
            )}
          </>
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
