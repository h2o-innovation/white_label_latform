import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import { NavLink, useLocation } from "react-router-dom";
import { useFormsStore } from "../../../features/forms/infrastructure/formsStore";

const drawerWidth = 240;

export function Sidebar() {
  const location = useLocation();
  const categories = useFormsStore((state) => state.categories);
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #e5ebe7",
        },
      }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Box>
          <Typography
            variant="h6"
            color="primary.dark"
            sx={{ lineHeight: 1.1 }}
          >
            Cadastro
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestão local
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1.5, pt: 2 }}>
        <ListItemButton
          component={NavLink}
          to="/forms"
          selected={location.pathname === "/forms"}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon>
            <AssignmentOutlined />
          </ListItemIcon>
          <ListItemText primary="Formulários" />
        </ListItemButton>
        {categories.map((cat) => (
          <ListItemButton
            key={cat.id}
            component={NavLink}
            to={cat.route ?? `/forms/${cat.id}`}
            selected={location.pathname === (cat.route ?? `/forms/${cat.id}`)}
            sx={{ borderRadius: 2, mb: 0.5, pl: 4 }}
          >
            <ListItemText
              primary={cat.name}
              primaryTypographyProps={{ variant: "body2" }}
            />
          </ListItemButton>
        ))}
        <ListItemButton
          component={NavLink}
          to="/settings"
          selected={location.pathname === "/settings"}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <SettingsOutlined />
          </ListItemIcon>
          <ListItemText primary="Configurações" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
