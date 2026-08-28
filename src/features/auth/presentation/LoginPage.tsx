import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";
import { useAppServices } from "../../../shared/application/AppServicesContext";
import logo from "../../../assets/logo.png";
import logoDark from "../../../assets/logo_dark.png";
import { APP_VERSION } from "../../../shared/constants/appInfo";

export function LoginPage() {
  const navigate = useNavigate();
  const { auth, users, theme } = useAppServices();
  const login = auth.login;
  const mode = theme.mode;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = login(identifier.trim(), password, users.users);
    if (ok) {
      navigate("/", { replace: true });
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 2 }}>
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Box
              component="img"
              src={mode === "dark" ? logoDark : logo}
              alt="Logo"
              sx={{ maxHeight: 64, objectFit: "contain" }}
            />
            <Typography variant="h6" fontWeight={700}>
              Entrar na plataforma
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Versão {APP_VERSION}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ width: "100%" }}>
                {error}
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Usuário ou e-mail"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlined />
                          ) : (
                            <VisibilityOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!identifier || !password}
                >
                  Entrar
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
