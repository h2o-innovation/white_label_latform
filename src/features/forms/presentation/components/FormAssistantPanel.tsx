import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAppServices } from "../../../../shared/application/AppServicesContext";
import {
  formPlanToSteps,
  requestFormPlan,
  type FormPlan,
} from "../../application/formAssistant";

interface FormAssistantPanelProps {
  onClose: () => void;
}

export function FormAssistantPanel({ onClose }: FormAssistantPanelProps) {
  const { formBuilder } = useAppServices();
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [plan, setPlan] = useState<FormPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError("");
    setMessages((current) => [...current, trimmed]);
    setPrompt("");
    try {
      const nextPlan = await requestFormPlan(trimmed, formBuilder.steps);
      setPlan(nextPlan);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível gerar o formulário.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!plan) return;
    formBuilder.insertSteps(formPlanToSteps(plan));
    setPlan(null);
    setMessages((current) => [...current, "Plano aplicado ao formulário."]);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 24 },
        bottom: { xs: 12, sm: 24 },
        width: { xs: "calc(100vw - 24px)", sm: 360 },
        height: { xs: "min(560px, calc(100vh - 24px))", sm: 560 },
        zIndex: 1200,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: 8,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography color="primary" aria-hidden="true">✨</Typography>
          <Typography variant="subtitle1" fontWeight={700}>Assistente de formulário</Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} aria-label="Fechar assistente">
          ×
        </IconButton>
      </Stack>
      <Divider />

      <Stack spacing={1.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {error && <Alert severity="error">{error}</Alert>}
        {messages.length === 0 && (
          <Alert severity="info">
            Descreva o formulário que você quer criar. Exemplo: “Crie um formulário de cliente com nome, CPF, e-mail e telefone”.
          </Alert>
        )}
        {messages.map((message, index) => (
          <Paper key={`${message}-${index}`} variant="outlined" sx={{ p: 1.25 }}>
            <Typography variant="body2">{message}</Typography>
          </Paper>
        ))}
        {plan && (
          <Paper variant="outlined" sx={{ p: 1.5, borderColor: "primary.main" }}>
            <Typography variant="subtitle2" fontWeight={700}>{plan.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              Revise o plano antes de aplicar ao canvas.
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1.5 }}>
              {plan.steps.map((step) => (
                <Box key={step.name}>
                  <Typography variant="body2" fontWeight={600}>{step.name}</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                    {step.fields.map((field) => (
                      <Chip
                        key={`${step.name}-${field.label}`}
                        size="small"
                        label={`${field.label}${field.required ? " *" : ""}`}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
            <Button fullWidth variant="contained" onClick={handleApply} sx={{ mt: 2 }}>
              Aplicar ao formulário
            </Button>
          </Paper>
        )}
      </Stack>

      <Box component="form" onSubmit={(event) => { event.preventDefault(); handleGenerate(); }} sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={loading ? "Gerando formulário..." : "Descreva o formulário..."}
          label="Prompt"
          InputProps={{
            endAdornment: (
              <Button
                type="submit"
                size="small"
                variant="contained"
                disabled={!prompt.trim() || loading}
              >
                Enviar
              </Button>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
