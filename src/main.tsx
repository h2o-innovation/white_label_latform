import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createAppTheme } from "./theme";
import { useAppServices } from "./shared/application/AppServicesContext";
import "./index.css";
import App from "./App.tsx";
import { AppServicesProvider } from "./AppServicesProvider";

function ThemedApp() {
  const { theme: themeService } = useAppServices();
  const mode = themeService.mode;
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
    <AppServicesProvider>
      <ThemedApp />
    </AppServicesProvider>
  </StrictMode>,
);
