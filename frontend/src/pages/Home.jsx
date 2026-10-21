import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getMe } from "../services/authService";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";
import { toList } from "../utils/toList";

import { clearCart } from "../store/cartSlice";
import LowStockAlert from "../components/LowStockAlert";

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Alert,
    AlertTitle,
    Chip,
    Button,
    LinearProgress,
    Skeleton,
    Paper,
    CircularProgress,
} from "@mui/material";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

export default function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        activeProducts: 0,
        totalCategories: 0,
        totalSuppliers: 0,
        stockHealthPct: 100,
    });

    useEffect(() => {
        let isMounted = true;

        async function fetchDashboardData() {
            try {
                const userRes = await getMe();
                const currentUser = userRes.data.data;
                dispatch(setUser(currentUser));

                const canAccessInventory = currentUser.role === "ADMIN" || currentUser.role === "STAFF";
                const isAdmin = currentUser.role === "ADMIN";

                let productsList = [];
                let categoriesList = [];
                let suppliersList = [];

                if (canAccessInventory) {
                    try {
                        const pRes = await getProducts({ limit: 100 });
                        productsList = pRes.data?.data?.content || [];
                    } catch (e) {
                        console.error("Products load error", e);
                    }
                }

                if (isAdmin) {
                    try {
                        const [cRes, sRes] = await Promise.allSettled([getCategories(), getSuppliers()]);
                        if (cRes.status === "fulfilled") categoriesList = toList(cRes.value);
                        if (sRes.status === "fulfilled") suppliersList = toList(sRes.value);
                    } catch (e) {
                        console.error("Categories/Suppliers load error", e);
                    }
                }

                if (isMounted) {
                    const totalP = productsList.length;
                    const lowStockP = productsList.filter((p) => p.lowStock || p.stock <= p.reorderLevel).length;
                    const activeP = productsList.filter((p) => p.status === "ACTIVE").length;
                    const healthPct = totalP > 0 ? Math.round(((totalP - lowStockP) / totalP) * 100) : 100;

                    setStats({
                        totalProducts: totalP,
                        lowStockCount: lowStockP,
                        activeProducts: activeP,
                        totalCategories: categoriesList.length,
                        totalSuppliers: suppliersList.length,
                        stockHealthPct: healthPct,
                    });
                }
            } catch (err) {
                console.error("Dashboard profile load error", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchDashboardData();

        return () => {
            isMounted = false;
        };
    }, [dispatch]);

    const role = user?.role || "CUSTOMER";
    const isAdmin = role === "ADMIN";
    const canAccessInventory = role === "ADMIN" || role === "STAFF";

    const statCards = [
        {
            title: "Total Products",
            value: stats.totalProducts,
            subtitle: `${stats.activeProducts} active items`,
            icon: <Inventory2RoundedIcon fontSize="small" />,
            color: "primary.main",
            bgColor: "rgba(67, 56, 202, 0.08)",
        },
        {
            title: "Low Stock Alerts",
            value: stats.lowStockCount,
            subtitle: stats.lowStockCount > 0 ? "Requires restocking" : "All stocks safe",
            icon: <WarningAmberRoundedIcon fontSize="small" />,
            color: stats.lowStockCount > 0 ? "error.main" : "success.main",
            bgColor: stats.lowStockCount > 0 ? "rgba(220, 38, 38, 0.08)" : "rgba(5, 150, 105, 0.08)",
            badge: stats.lowStockCount > 0 ? "Critical" : "Good",
        },
        {
            title: "Categories",
            value: stats.totalCategories,
            subtitle: "Organized groups",
            icon: <CategoryRoundedIcon fontSize="small" />,
            color: "secondary.main",
            bgColor: "rgba(217, 119, 6, 0.08)",
        },
        {
            title: "Suppliers",
            value: stats.totalSuppliers,
            subtitle: "Active partners",
            icon: <LocalShippingRoundedIcon fontSize="small" />,
            color: "info.main",
            bgColor: "rgba(37, 99, 235, 0.08)",
        },
    ];

    return (
        <Box sx={{ pb: 3 }}>
            {/* Low-Stock and Restock-Request Banner */}
            <LowStockAlert />

            {/* Elegant Header (Calm, Not Loud) */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 0.3 }}>
                        Welcome, {user?.name || "Yashashvini"} 👋
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        Overview of catalog items, suppliers, and inventory health.
                    </Typography>
                </Box>

                {isAdmin && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                        onClick={() => navigate("/products")}
                        sx={{ px: 2, py: 0.8, fontWeight: 600, fontSize: "0.82rem" }}
                    >
                        Manage Products
                    </Button>
                )}
            </Box>

            {/* Alert Banner */}
            {stats.lowStockCount > 0 && canAccessInventory && (
                <Alert
                    severity="warning"
                    variant="standard"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "warning.light",
                        backgroundColor: "warning.light",
                        alignItems: "center",
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => navigate("/products")}
                            sx={{ fontWeight: 600, textTransform: "none", fontSize: "0.8rem" }}
                        >
                            Review Stock →
                        </Button>
                    }
                >
                    <AlertTitle sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.2 }}>
                        {stats.lowStockCount} items require attention
                    </AlertTitle>
                    Stock level is at or below reorder threshold. Replenish soon to avoid stockouts.
                </Alert>
            )}

            {/* KPI Cards Grid */}
            {canAccessInventory ? (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {statCards.map((card, index) => (
                        <Grid item xs={12} sm={6} lg={3} key={index}>
                            <Card sx={{ height: "100%" }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                backgroundColor: card.bgColor,
                                                color: card.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                        {card.badge && (
                                            <Chip
                                                label={card.badge}
                                                size="small"
                                                color={stats.lowStockCount > 0 ? "error" : "success"}
                                                sx={{ fontSize: "0.68rem", height: 20, fontWeight: 600 }}
                                            />
                                        )}
                                    </Box>

                                    {loading ? (
                                        <>
                                            <Skeleton variant="text" width="60%" height={32} />
                                            <Skeleton variant="text" width="40%" height={16} />
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", fontWeight: 500 }}>
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", my: 0.3 }}>
                                                {card.value}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                                                {card.subtitle}
                                            </Typography>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : loading ? (
                <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Customer Portal
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                        Welcome to our online store! Browse our catalog, manage your shopping cart, and view your orders.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ShoppingBagRoundedIcon />}
                            onClick={() => navigate("/shop")}
                            sx={{ fontWeight: 600 }}
                        >
                            Explore Shop
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<ShoppingCartRoundedIcon />}
                            onClick={() => navigate("/cart")}
                            sx={{ fontWeight: 600 }}
                        >
                            View Cart
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<ReceiptLongRoundedIcon />}
                            onClick={() => navigate("/orders")}
                            sx={{ fontWeight: 600 }}
                        >
                            My Orders
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Stock Health & Quick Links (Zero Collision) */}
            {canAccessInventory && (
                <Grid container spacing={2}>
                    {/* Stock Health Card */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 3,
                                        flexWrap: "nowrap",
                                        mb: 2,
                                    }}
                                >
                                    <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary", mb: 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            Inventory Health & Stock Ratio
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            Safe stock threshold tracking
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 15 }} />}
                                        label={`${stats.stockHealthPct}% Healthy`}
                                        color={stats.stockHealthPct > 80 ? "success" : "warning"}
                                        size="small"
                                        sx={{ fontWeight: 600, height: 26, px: 1, flexShrink: 0 }}
                                    />
                                </Box>

                                <Box sx={{ my: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                            Safe Stock Level
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {stats.stockHealthPct}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={stats.stockHealthPct}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: "rgba(0,0,0,0.04)",
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 4,
                                                backgroundColor: stats.stockHealthPct > 80 ? "success.main" : "warning.main",
                                            },
                                        }}
                                    />
                                </Box>

                                <Grid container spacing={2} sx={{ pt: 1 }}>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                            Active Items
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {stats.activeProducts}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                            Low Stock
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "error.main" }}>
                                            {stats.lowStockCount}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                            Categories
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                                            {stats.totalCategories}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Quick Navigation Card */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.2 }}>
                                    Quick Shortcuts
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem", mb: 2 }}>
                                    Jump directly to key operations
                                </Typography>

                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        fullWidth
                                        size="small"
                                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => navigate("/manage/orders")}
                                        sx={{
                                            justifyContent: "space-between",
                                            py: 0.9,
                                            px: 1.5,
                                            borderColor: "divider",
                                            "&:hover": { borderColor: "primary.main", color: "primary.main" },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                            <ReceiptLongRoundedIcon color="primary" sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                Manage Orders
                                            </Typography>
                                        </Box>
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        fullWidth
                                        size="small"
                                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => navigate("/restock-requests")}
                                        sx={{
                                            justifyContent: "space-between",
                                            py: 0.9,
                                            px: 1.5,
                                            borderColor: "divider",
                                            "&:hover": { borderColor: "warning.main", color: "warning.main" },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                            <NotificationsActiveRoundedIcon color="warning" sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                Restock Requests
                                            </Typography>
                                        </Box>
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        fullWidth
                                        size="small"
                                        endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                        onClick={() => navigate("/products")}
                                        sx={{
                                            justifyContent: "space-between",
                                            py: 0.9,
                                            px: 1.5,
                                            borderColor: "divider",
                                            "&:hover": { borderColor: "primary.main", color: "primary.main" },
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                            <Inventory2RoundedIcon color="primary" sx={{ fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                View Catalog
                                            </Typography>
                                        </Box>
                                    </Button>

                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                fullWidth
                                                size="small"
                                                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => navigate("/inventory-history")}
                                                sx={{
                                                    justifyContent: "space-between",
                                                    py: 0.9,
                                                    px: 1.5,
                                                    borderColor: "divider",
                                                    "&:hover": { borderColor: "success.main", color: "success.main" },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <TrendingUpRoundedIcon color="success" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                        Stock Movements & Audit
                                                    </Typography>
                                                </Box>
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                fullWidth
                                                size="small"
                                                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => navigate("/categories")}
                                                sx={{
                                                    justifyContent: "space-between",
                                                    py: 0.9,
                                                    px: 1.5,
                                                    borderColor: "divider",
                                                    "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <CategoryRoundedIcon color="secondary" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                        Categories
                                                    </Typography>
                                                </Box>
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                fullWidth
                                                size="small"
                                                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => navigate("/suppliers")}
                                                sx={{
                                                    justifyContent: "space-between",
                                                    py: 0.9,
                                                    px: 1.5,
                                                    borderColor: "divider",
                                                    "&:hover": { borderColor: "info.main", color: "info.main" },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                                                    <LocalShippingRoundedIcon color="info" sx={{ fontSize: 18 }} />
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                                                        Suppliers
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}