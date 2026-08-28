import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
import { useAppServices } from "../../../../shared/application/AppServicesContext";
import { requestDashboardInsight, type DashboardAssistantResult } from "../../application/dashboardAssistant";

const suggestions = [
  "Faça um resumo da operação",
  "Quais formulários tiveram mais entradas?",
  "O que precisa da minha atenção?",
  "Compare minhas categorias",
];

interface Props { onClose: () => void }

export function DashboardAssistantPanel({ onClose }: Props) {
  const navigate = useNavigate();
  const { forms, categories, users, clients, formEntries } = useAppServices();
  const [prompt, setPrompt] = useState("");
  const [conversation, setConversation] = useState<{ prompt: string; result?: DashboardAssistantResult }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (value = prompt) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setPrompt("");
    setError("");
    setConversation((current) => [...current, { prompt: trimmed }]);
    setLoading(true);
    try {
      const result = await requestDashboardInsight(trimmed, {
        forms: forms.categories.map(({ id, name, steps }) => ({ id, name, steps })),
        categories: categories.groups,
        users: users.users.map(({ id, nombre, apellido, createdAt }) => ({ id, nombre, apellido, createdAt })),
        clients: clients.clients.map(({ id, createdAt }) => ({ id, createdAt })),
        entries: formEntries.entries,
      });
      setConversation((current) => current.map((item, index) => index === current.length - 1 ? { ...item, result } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível obter uma análise.");
    } finally {
      setLoading(false);
    }
  };

  const runAction = (action: DashboardAssistantResult["actions"][number]) => {
    if (action.action === "open_form" && action.targetId) navigate(`/forms/${action.targetId}`);
    if (action.action === "open_category" && action.targetId) navigate(`/categories/${action.targetId}`);
    if (action.action === "open_users") navigate("/users");
    if (action.action === "open_clients") navigate("/clients");
    if (action.action === "open_forms") navigate("/forms");
    if (action.action === "open_categories") navigate("/categories");
  };

  return (
    <Box sx={{ position: "fixed", right: { xs: 12, sm: 24 }, bottom: { xs: 12, sm: 24 }, width: { xs: "calc(100vw - 24px)", sm: 390 }, height: { xs: "min(680px, calc(100vh - 24px))", sm: 650 }, zIndex: 1200, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3, boxShadow: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AutoAwesomeRounded color="primary" />
          <Box><Typography variant="subtitle1" fontWeight={800}>Proteus IA</Typography><Typography variant="caption" color="text.secondary">Seu analista de operação</Typography></Box>
        </Stack>
        <IconButton size="small" onClick={onClose} aria-label="Fechar assistente"><CloseRounded /></IconButton>
      </Stack>
      <Divider />

      <Stack spacing={1.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {conversation.length === 0 && <Box sx={{ py: 1 }}><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Pergunte sobre os dados do seu workspace. Vou analisar apenas as informações disponíveis e sugerir próximos passos.</Typography><Stack spacing={1}>{suggestions.map((suggestion) => <Button key={suggestion} variant="outlined" color="inherit" onClick={() => handleSend(suggestion)} sx={{ justifyContent: "space-between", textTransform: "none", borderColor: "divider" }} endIcon={<ArrowForwardRounded fontSize="small" />}>{suggestion}</Button>)}</Stack></Box>}
        {error && <Alert severity="error">{error}</Alert>}
        {conversation.map((item, index) => <Box key={`${item.prompt}-${index}`}>
          <Paper variant="outlined" sx={{ p: 1.25, bgcolor: "action.hover", mb: 1.25 }}><Typography variant="body2" fontWeight={600}>{item.prompt}</Typography></Paper>
          {item.result && <Stack spacing={1.25}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{item.result.answer}</Typography>
            {item.result.insights.length > 0 && <Stack direction="row" flexWrap="wrap" gap={1}>{item.result.insights.map((insight) => <Paper key={`${insight.title}-${insight.value}`} variant="outlined" sx={{ p: 1.25, minWidth: 115, flex: "1 1 115px" }}><Typography variant="caption" color="text.secondary" noWrap>{insight.title}</Typography><Typography variant="h6" fontWeight={800}>{insight.value}</Typography><Typography variant="caption" color="text.secondary">{insight.detail}</Typography></Paper>)}</Stack>}
            {item.result.actions.filter((action) => action.action !== "none").map((action) => <Button key={`${action.action}-${action.label}`} size="small" variant="outlined" endIcon={<ArrowForwardRounded />} onClick={() => runAction(action)}>{action.label}</Button>)}
          </Stack>}
        </Box>)}
        {loading && <Stack direction="row" spacing={1} alignItems="center"><AutoAwesomeRounded color="primary" fontSize="small" /><Typography variant="caption" color="text.secondary">Analisando seus dados...</Typography></Stack>}
      </Stack>

      <Box component="form" onSubmit={(event) => { event.preventDefault(); void handleSend(); }} sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <TextField fullWidth multiline minRows={2} maxRows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Pergunte sobre sua operação..." label="Mensagem" InputProps={{ endAdornment: <Button type="submit" size="small" variant="contained" disabled={!prompt.trim() || loading}>Enviar</Button> }} />
      </Box>
    </Box>
  );
}
