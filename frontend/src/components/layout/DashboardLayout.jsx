import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser } from "../../store/slices/authSlice";
import { getMe } from "../../services/authService";

import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Divider,
    Button,
    Fade,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import Badge from "@mui/material/Badge";
import { selectCartCount, clearCart } from "../../store/cartSlice";

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { user, token } = useSelector((state) => state.auth);
    const cartCount = useSelector(selectCartCount);

    // Jab tak user load na ho, tab tak null check rakhein taaki wrong role na dikhe
    useEffect(() => {
        if (token && !user) {
            getMe()
                .then((res) => {
                    if (res.data?.data) {
                        dispatch(setUser(res.data.data));
                    }
                })
                .catch((err) => {
                    console.error("DashboardLayout profile sync error", err);
                });
        }
    }, [token, user, dispatch]);

    const role = user?.role || (user === null ? "" : "CUSTOMER");

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        dispatch(clearCart());
        dispatch(logout());
        navigate("/login");
    };

    // Role-based navigation items
    const navItems = [
        {
            label: "Dashboard",
            path: "/",
            icon: <DashboardRoundedIcon />,
            allowed: true, // Everyone can see dashboard
        },
        {
            label: "Shop Products",
            path: "/shop",
            icon: <StorefrontRoundedIcon />,
            allowed: role === "CUSTOMER",
        },
        {
            label: "Shopping Cart",
            path: "/cart",
            icon: (
                <Badge badgeContent={cartCount} color="primary">
                    <ShoppingCartRoundedIcon />
                </Badge>
            ),
            allowed: role === "CUSTOMER",
        },
        {
            label: "My Orders",
            path: "/orders",
            icon: <ReceiptLongRoundedIcon />,
            allowed: role === "CUSTOMER",
        },
        {
            label: "Manage Orders",
            path: "/manage/orders",
            icon: <ReceiptLongRoundedIcon />,
            allowed: role === "ADMIN" || role === "STAFF",
        },
        {
            label: "Restock Requests",
            path: "/restock-requests",
            icon: <NotificationsActiveRoundedIcon />,
            allowed: role === "ADMIN" || role === "STAFF",
        },
        {
            label: "Products",
            path: "/products",
            icon: <Inventory2RoundedIcon />,
            allowed: role === "ADMIN" || role === "STAFF",
        },
        {
            label: "Stock Movements",
            path: "/inventory-history",
            icon: <HistoryRoundedIcon />,
            allowed: role === "ADMIN" || role === "STAFF",
        },
        {
            label: "Categories",
            path: "/categories",
            icon: <CategoryRoundedIcon />,
            allowed: role === "ADMIN",
        },
        {
            label: "Suppliers",
            path: "/suppliers",
            icon: <LocalShippingRoundedIcon />,
            allowed: role === "ADMIN",
        },
    ];

    const drawerContent = (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#FFFFFF" }}>
            {/* Brand Logo Header */}
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        backgroundColor: "primary.main",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)",
                    }}
                >
                    <InventoryRoundedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                        EzeiaERP
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        Inventory Suite
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, borderColor: "divider" }} />

            {/* Navigation List */}
            <Box sx={{ flex: 1, px: 2, py: 2 }}>
                <Typography
                    variant="caption"
                    sx={{
                        px: 1.5,
                        pb: 1,
                        display: "block",
                        color: "text.secondary",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                    }}
                >
                    Main Menu
                </Typography>
                <List disablePadding>
                    {navItems
                        .filter((item) => item.allowed)
                        .map((item) => {
                            const isSelected = location.pathname === item.path;
                            return (
                                <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
                                    <ListItemButton
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobile) setMobileOpen(false);
                                        }}
                                        sx={{
                                            borderRadius: 2.5,
                                            py: 1.2,
                                            px: 2,
                                            backgroundColor: isSelected ? "rgba(79, 70, 229, 0.08)" : "transparent",
                                            color: isSelected ? "primary.main" : "text.secondary",
                                            fontWeight: isSelected ? 700 : 500,
                                            "&:hover": {
                                                backgroundColor: isSelected
                                                    ? "rgba(79, 70, 229, 0.12)"
                                                    : "rgba(0, 0, 0, 0.03)",
                                                color: isSelected ? "primary.main" : "text.primary",
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 38,
                                                color: isSelected ? "primary.main" : "text.secondary",
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: "0.92rem",
                                                fontWeight: isSelected ? 700 : 500,
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                </List>
            </Box>

            {/* User Profile & Logout Bottom Card */}
            <Box sx={{ p: 2, m: 2, borderRadius: 3, backgroundColor: "background.default", border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 38,
                            height: 38,
                            bgcolor: role === "ADMIN" ? "secondary.main" : "primary.main",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                        }}
                    >
                        {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                    </Avatar>
                    <Box sx={{ overflow: "hidden", flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, noWrap: true, color: "text.primary" }}>
                            {user?.name || "Administrator"}
                        </Typography>
                        {role ? (
                            <Chip
                                label={role}
                                size="small"
                                color={role === "ADMIN" ? "secondary" : "primary"}
                                sx={{
                                    height: 20,
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    px: 0.5,
                                }}
                            />
                        ) : null}
                    </Box>
                </Box>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={handleLogout}
                    sx={{
                        borderColor: "divider",
                        color: "text.secondary",
                        py: 0.7,
                        "&:hover": {
                            borderColor: "error.main",
                            color: "error.main",
                            backgroundColor: "error.light",
                        },
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
            {/* Top Navigation Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                }}
            >
                <Toolbar sx={{ justifyContent: "space-between", minHeight: 64 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: "none" } }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                            {navItems.find((n) => n.path === location.pathname)?.label || "Overview"}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Chip
                            label={user?.name ? `${user.name} (${user.role || "Admin"})` : "Admin"}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: "divider", fontWeight: 500, display: { xs: "none", sm: "flex" } }}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar Navigation Drawer */}
            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", md: "none" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH, border: "none" },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Permanent Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", md: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: DRAWER_WIDTH,
                            borderRight: "1px solid",
                            borderColor: "divider",
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3, md: 3.5 },
                    width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minWidth: 0,
                    mt: { xs: "56px", sm: "64px" },
                    maxWidth: "100%",
                }}
            >
                <Box>{children || <Outlet />}</Box>
            </Box>
        </Box>
    );
}
