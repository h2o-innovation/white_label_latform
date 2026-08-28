import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import { useNavigate } from "react-router-dom";
import { useAppServices } from "../../../shared/application/AppServicesContext";
import proteusIcon from "../../../assets/proteus.png";
import { DashboardAssistantPanel } from "./components/DashboardAssistantPanel";

const chartColors = ["#168a5b", "#2d6cdf", "#e5a72e", "#9c5de5", "#ed6a5a"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        flex: "1 1 190px",
        minWidth: 0,
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}18`, color, width: 42, height: 42 }}>
            {icon}
          </Avatar>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
          {detail}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ActivityChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${94 - (value / max) * 74}`)
    .join(" ");
  const area = `0,94 ${points} 100,94`;

  return (
    <Box sx={{ position: "relative", height: 190, mt: 2 }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="150" role="img" aria-label="Atividade de entradas nos últimos seis meses">
        {[20, 45, 70, 94].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" opacity="0.1" />
        ))}
        <polygon points={area} fill="#168a5b" opacity="0.12" />
        <polyline points={points} fill="none" stroke="#168a5b" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {values.map((value, index) => (
          <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={94 - (value / max) * 74} r="1.8" fill="#168a5b" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <Stack direction="row" justifyContent="space-between" sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        {values.map((_, index) => (
          <Typography key={index} variant="caption" color="text.secondary">
            {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(new Date().getFullYear(), new Date().getMonth() - 5 + index, 1))}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { auth, clients, categories, forms, users, formEntries } = useAppServices();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const currentUser = auth.currentUser;

  const allEntries = Object.values(formEntries.entries).flat();
  const recentEntries = [...allEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const activeForms = forms.categories.filter((form) => form.steps?.length).length;

  const activityValues = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, offset) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + offset, 1);
      return allEntries.filter((entry) => {
        const date = new Date(entry.createdAt);
        return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
      }).length;
    });
  }, [allEntries]);

  const formRanking = useMemo(() => forms.categories
    .map((form) => ({ ...form, total: (formEntries.entries[form.id] ?? []).length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5), [forms.categories, formEntries.entries]);
  const highestFormTotal = Math.max(...formRanking.map((form) => form.total), 1);

  const categoryRanking = categories.groups
    .map((group) => ({ ...group, total: group.formIds.length }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  const maxCategoryTotal = Math.max(...categoryRanking.map((group) => group.total), 1);

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto" }}>
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 2.5, md: 4 },
          mb: 3,
          color: "white",
          background: "linear-gradient(120deg, #106c4a 0%, #168a5b 48%, #2d6cdf 150%)",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""', position: "absolute", width: 260, height: 260, borderRadius: "50%",
            right: -70, top: -130, bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} sx={{ position: "relative", zIndex: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.5 }}>VISÃO GERAL</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>Olá, {currentUser?.nombre ?? "usuário"}!</Typography>
            <Typography sx={{ mt: 1, opacity: 0.82 }}>Acompanhe o desempenho da sua operação em um só lugar.</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => navigate("/forms/new")} sx={{ bgcolor: "white", color: "#106c4a", boxShadow: "none", "&:hover": { bgcolor: "#f0f7f4" } }}>
            Novo formulário
          </Button>
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mb: 3 }}>
        <MetricCard label="Formulários" value={forms.categories.length} detail={`${activeForms} com estrutura publicada`} icon={<AssignmentOutlined />} color="#168a5b" onClick={() => navigate("/forms")} />
        <MetricCard label="Entradas" value={allEntries.length} detail="Registros coletados nos formulários" icon={<TrendingUpRounded />} color="#2d6cdf" onClick={() => navigate("/forms")} />
        <MetricCard label="Categorias" value={categories.groups.length} detail="Organização do seu workspace" icon={<CategoryOutlined />} color="#e5a72e" onClick={() => navigate("/categories")} />
        <MetricCard label="Usuários" value={users.users.length} detail="Pessoas com acesso à plataforma" icon={<PeopleAltOutlined />} color="#9c5de5" onClick={() => navigate("/users")} />
        <MetricCard label="Clientes" value={clients.clients.length} detail="Cadastros na base local" icon={<GroupsOutlined />} color="#ed6a5a" onClick={() => navigate("/clients")} />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.45fr 1fr" }, gap: 2, mb: 3 }}>
        <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box><Typography variant="h6" fontWeight={750}>Atividade de entradas</Typography><Typography variant="body2" color="text.secondary">Volume de registros nos últimos seis meses</Typography></Box>
              <Chip icon={<TrendingUpRounded />} label={`${allEntries.length} total`} size="small" color="success" variant="outlined" />
            </Stack>
            <ActivityChart values={activityValues} />
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={750}>Formulários mais ativos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Por número de entradas</Typography>
            {formRanking.length === 0 ? <Typography color="text.secondary" sx={{ py: 4 }}>Crie seu primeiro formulário para acompanhar os dados.</Typography> : formRanking.map((form, index) => (
              <Box key={form.id} sx={{ mb: index === formRanking.length - 1 ? 0 : 1.7, cursor: "pointer" }} onClick={() => navigate(`/forms/${form.id}`)}>
                <Stack direction="row" justifyContent="space-between" gap={1} sx={{ mb: 0.5 }}>
                  <Tooltip title={form.name}><Typography variant="body2" noWrap fontWeight={600}>{form.name}</Typography></Tooltip>
                  <Typography variant="body2" fontWeight={700}>{form.total}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={(form.total / highestFormTotal) * 100} sx={{ height: 7, borderRadius: 4, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: chartColors[index], borderRadius: 4 } }} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.35fr" }, gap: 2 }}>
        <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h6" fontWeight={750}>Categorias</Typography><Typography variant="body2" color="text.secondary">Formulários por categoria</Typography></Box><CategoryOutlined color="action" /></Stack>
            <Stack spacing={1.7} sx={{ mt: 2.5 }}>
              {categoryRanking.length === 0 ? <Typography color="text.secondary">Nenhuma categoria criada ainda.</Typography> : categoryRanking.map((group, index) => (
                <Box key={group.id}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={600} noWrap>{group.name}</Typography><Typography variant="body2" color="text.secondary">{group.total}</Typography></Stack><LinearProgress variant="determinate" value={(group.total / maxCategoryTotal) * 100} sx={{ mt: 0.7, height: 6, borderRadius: 3, "& .MuiLinearProgress-bar": { bgcolor: chartColors[index], borderRadius: 3 } }} /></Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
          <CardContent sx={{ p: 2.5, pb: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h6" fontWeight={750}>Atividade recente</Typography><Typography variant="body2" color="text.secondary">Últimos registros adicionados</Typography></Box><Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => navigate("/forms")}>Ver tudo</Button></Stack>
            {recentEntries.length === 0 ? <Typography color="text.secondary" sx={{ py: 3 }}>As novas entradas aparecerão aqui.</Typography> : <List disablePadding sx={{ mt: 1 }}>{recentEntries.map((entry, index) => { const form = forms.categories.find((item) => item.id === Object.keys(formEntries.entries).find((id) => formEntries.entries[id]?.some((candidate) => candidate.id === entry.id))); return <Box key={entry.id}><ListItem disableGutters><ListItemAvatar><Avatar sx={{ bgcolor: `${chartColors[index % chartColors.length]}18`, color: chartColors[index % chartColors.length] }}><AssignmentOutlined fontSize="small" /></Avatar></ListItemAvatar><ListItemText primary={form?.name ?? "Formulário"} secondary={`Registro adicionado em ${formatDate(entry.createdAt)}`} /><Typography variant="caption" color="text.secondary">#{entry.id.slice(0, 5)}</Typography></ListItem>{index < recentEntries.length - 1 && <Divider component="li" />}</Box> })}</List>}
          </CardContent>
        </Card>
      </Box>

      {!assistantOpen && <Tooltip title="Abrir Proteus IA"><IconButton onClick={() => setAssistantOpen(true)} aria-label="Abrir Proteus IA" sx={{ position: "fixed", right: { xs: 16, sm: 24 }, bottom: { xs: 16, sm: 24 }, zIndex: 1200, width: 64, height: 64, bgcolor: "primary.main", border: "3px solid", borderColor: "background.paper", boxShadow: 4, overflow: "hidden", "&:hover": { bgcolor: "primary.dark" } }}><Box component="img" src={proteusIcon} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /></IconButton></Tooltip>}
      {assistantOpen && <DashboardAssistantPanel onClose={() => setAssistantOpen(false)} />}
    </Box>
  );
}
