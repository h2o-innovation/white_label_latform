import { Box, ButtonBase, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useFormsStore } from "../infrastructure/formsStore";

export function FormsPage() {
  const categories = useFormsStore((state) => state.categories);
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 1 }}>
      {categories.map((cat) => (
        <Paper
          key={cat.id}
          component={ButtonBase}
          onClick={() => navigate(cat.route ?? `/forms/${cat.id}`)}
          sx={{
            width: 160,
            height: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            bgcolor: "grey.100",
            border: "1px solid",
            borderColor: "grey.200",
            "&:hover": { bgcolor: "grey.200" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {cat.name}
          </Typography>
        </Paper>
      ))}
      <Paper
        component={ButtonBase}
        onClick={() => navigate("/forms/new")}
        sx={{
          width: 160,
          height: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 3,
          bgcolor: "primary.main",
          border: "none",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <AddIcon sx={{ fontSize: 40, color: "white" }} />
      </Paper>
    </Box>
  );
}
