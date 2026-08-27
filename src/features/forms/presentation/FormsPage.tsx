import { Box, ButtonBase, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const categories = ["Clientes", "Ventas", "Crédito", "Granos"];

export function FormsPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, p: 1 }}>
      {categories.map((name) => (
        <Paper
          key={name}
          component={ButtonBase}
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
            {name}
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
