import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#198754",
        dark: "#11613b",
        light: "#dff4e8",
        contrastText: "#ffffff",
      },
      secondary: { main: "#6c757d" },
      background:
        mode === "light"
          ? { default: "#f6f8f7", paper: "#ffffff" }
          : { default: "#121212", paper: "#1e1e1e" },
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    },
  });

export const theme = createAppTheme("light");
