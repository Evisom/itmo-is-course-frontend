"use client";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { username, authenticated, logout, loading } = useAuth();
  const router = useRouter();
  if (!authenticated || loading) return;

  return (
    <AppBar color="primary">
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flexGrow: 0,
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuBookIcon
              sx={{ mr: 1, display: "flex", alignItems: "center" }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              BOOBOOK
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button sx={{ my: 2, color: "white", display: "block" }}>
              история бронирований
            </Button>
            <Button
              sx={{ my: 2, color: "white", display: "block" }}
              onClick={() => router.push("/staff")}
            >
              управление библиотекой
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1">{username}</Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={logout}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
