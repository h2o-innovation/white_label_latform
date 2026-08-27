import { Box, Stack, Typography } from "@mui/material";

export function FormsPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Typography variant="h5" color="text.secondary">
          Nenhum formulário ainda
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Os formulários da plataforma aparecerão aqui.
        </Typography>
      </Stack>
    </Box>
  );
}
