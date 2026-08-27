import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from "@mui/material";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import logo from "../../../assets/logo.png";
import { NavLink, useLocation } from "react-router-dom";

const drawerWidth = 240;

export function Sidebar() {
  const location = useLocation();
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
      <Toolbar sx={{ px: 3, justifyContent: "center" }}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ maxWidth: "80%", maxHeight: 56, objectFit: "contain" }}
        />
      </Toolbar>
      <List sx={{ px: 1.5, pt: 2 }}>
        <ListItemButton
          component={NavLink}
          to="/forms"
          selected={location.pathname.startsWith("/forms")}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon>
            <AssignmentOutlined />
          </ListItemIcon>
          <ListItemText primary="Formulários" />
        </ListItemButton>
        <ListItemButton
          component={NavLink}
          to="/categories"
          selected={location.pathname === "/categories"}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon>
            <CategoryOutlined />
          </ListItemIcon>
          <ListItemText primary="Categorias" />
        </ListItemButton>
        <ListItemButton
          component={NavLink}
          to="/users"
          selected={location.pathname === "/users"}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemIcon>
            <PeopleAltOutlined />
          </ListItemIcon>
          <ListItemText primary="Usuários" />
        </ListItemButton>
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
