import { Box, Typography } from "@mui/material";

export function CreateFormPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Typography variant="h5" color="text.secondary">
        Novo formulário
      </Typography>
    </Box>
  );
}
