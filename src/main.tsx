import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createAppTheme } from "./theme";
import { useThemeStore } from "./shared/stores/themeStore";
import "./index.css";
import App from "./App.tsx";

function ThemedApp() {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>,
);
