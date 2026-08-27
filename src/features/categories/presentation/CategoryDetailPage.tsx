import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { useCategoriesStore } from "../infrastructure/categoriesStore";
import { useFormsStore } from "../../forms/infrastructure/formsStore";

export function CategoryDetailPage() {
  const { groupId = "" } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const group = useCategoriesStore((s) =>
    s.groups.find((g) => g.id === groupId),
  );
  const allForms = useFormsStore((s) => s.categories);

  if (!group)
    return <Alert severity="warning">Categoria não encontrada.</Alert>;

  const forms = allForms.filter((f) => group.formIds.includes(f.id));

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {forms.length} {forms.length === 1 ? "formulário" : "formulários"}
      </Typography>
      {forms.length === 0 ? (
        <Alert severity="info">Nenhum formulário nesta categoria.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <List disablePadding>
            {forms.map((form, index) => (
              <>
                {index > 0 && <Divider key={`div-${form.id}`} />}
                <ListItemButton
                  key={form.id}
                  onClick={() => navigate(form.route ?? `/forms/${form.id}`)}
                  sx={{ py: 1.5, px: 2 }}
                >
                  <ListItemText
                    primary={form.name}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <ChevronRightOutlined sx={{ color: "text.disabled" }} />
                </ListItemButton>
              </>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}
