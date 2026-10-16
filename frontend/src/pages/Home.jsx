import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getMe } from "../services/authService";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";
import { toList } from "../utils/toList";
import DashboardLayout from "../components/layout/DashboardLayout";

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
} from "@mui/material";

import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

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
                // 1. Fetch current logged-in user profile & sync to Redux
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
            subtitle: `${stats.activeProducts} active in catalog`,
            icon: <Inventory2RoundedIcon />,
            color: "primary.main",
            bgColor: "rgba(79, 70, 229, 0.08)",
            trend: "+Active",
        },
        {
            title: "Low Stock Alerts",
            value: stats.lowStockCount,
            subtitle: stats.lowStockCount > 0 ? "Requires restock" : "All stocks healthy",
            icon: <WarningAmberRoundedIcon />,
            color: stats.lowStockCount > 0 ? "error.main" : "success.main",
            bgColor: stats.lowStockCount > 0 ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
            badge: stats.lowStockCount > 0 ? "Critical" : "Good",
        },
        {
            title: "Categories",
            value: stats.totalCategories,
            subtitle: "Organized taxonomy",
            icon: <CategoryRoundedIcon />,
            color: "secondary.main",
            bgColor: "rgba(245, 158, 11, 0.08)",
            trend: "Catalog",
        },
        {
            title: "Suppliers",
            value: stats.totalSuppliers,
            subtitle: "Verified partners",
            icon: <LocalShippingRoundedIcon />,
            color: "info.main",
            bgColor: "rgba(59, 130, 246, 0.08)",
            trend: "Network",
        },
    ];

    return (
        <DashboardLayout>
            <Box sx={{ mb: 4 }}>
                {/* Greeting Header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                            Welcome back, {user?.name || "Yashashvini"} 👋
                        </Typography>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                            Here is what is happening across your inventory and operations today.
                        </Typography>
                    </Box>

                    {isAdmin && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddRoundedIcon />}
                            onClick={() => navigate("/products")}
                            sx={{ px: 2.5, py: 1.2, fontWeight: 700 }}
                        >
                            Manage Products
                        </Button>
                    )}
                </Box>

                {/* NexaERP Style Alert Banner */}
                {stats.lowStockCount > 0 && canAccessInventory && (
                    <Alert
                        severity="warning"
                        variant="standard"
                        sx={{
                            mb: 3.5,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "warning.light",
                            backgroundColor: "warning.light",
                            alignItems: "center",
                            "& .MuiAlert-icon": { color: "warning.dark" },
                        }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => navigate("/products")}
                                sx={{ fontWeight: 700, textTransform: "none" }}
                            >
                                Review Stock →
                            </Button>
                        }
                    >
                        <AlertTitle sx={{ fontWeight: 700, mb: 0.2 }}>
                            {stats.lowStockCount} items require your attention
                        </AlertTitle>
                        Stock levels for some items are at or below reorder threshold. Please replenish to prevent stockouts.
                    </Alert>
                )}

                {/* KPI Cards Grid */}
                {canAccessInventory ? (
                    <Grid container spacing={2.5} sx={{ mb: 4 }}>
                        {statCards.map((card, index) => (
                            <Grid item xs={12} sm={6} lg={3} key={index}>
                                <Card sx={{ height: "100%", p: 0.5 }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2.5,
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
                                                    sx={{ fontSize: "0.72rem", height: 22 }}
                                                />
                                            )}
                                        </Box>

                                        {loading ? (
                                            <>
                                                <Skeleton variant="text" width="60%" height={40} />
                                                <Skeleton variant="text" width="40%" height={20} />
                                            </>
                                        ) : (
                                            <>
                                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                                    {card.title}
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", my: 0.5 }}>
                                                    {card.value}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                                    {card.subtitle}
                                                </Typography>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Customer Portal
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            You are logged in as a registered customer. Administrative inventory controls are restricted to staff and admins.
                        </Typography>
                    </Paper>
                )}

                {/* Materio Style Progress & Quick Overview Cards */}
                {canAccessInventory && (
                    <Grid container spacing={2.5}>
                        {/* Stock Health & Inventory Quality Card */}
                        <Grid item xs={12} md={7}>
                            <Card sx={{ height: "100%", p: 1 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                Inventory Health & Stock Ratio
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                Percentage of items meeting safe stock levels
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<TrendingUpRoundedIcon sx={{ fontSize: 16 }} />}
                                            label={`${stats.stockHealthPct}% Healthy`}
                                            color={stats.stockHealthPct > 80 ? "success" : "warning"}
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </Box>

                                    <Box sx={{ my: 3 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                                Safe Stock Level
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                {stats.stockHealthPct}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={stats.stockHealthPct}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: "rgba(0,0,0,0.06)",
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: 5,
                                                    backgroundColor: stats.stockHealthPct > 80 ? "success.main" : "warning.main",
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Grid container spacing={2} sx={{ pt: 1 }}>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Active Items
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                {stats.activeProducts}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Low Stock
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "error.main" }}>
                                                {stats.lowStockCount}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Categories
                                            </Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                                                {stats.totalCategories}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Quick Navigation Card */}
                        <Grid item xs={12} md={5}>
                            <Card sx={{ height: "100%", p: 1 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        Quick Navigation
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5 }}>
                                        Jump directly to key inventory operations
                                    </Typography>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            fullWidth
                                            endIcon={<ArrowForwardRoundedIcon />}
                                            onClick={() => navigate("/products")}
                                            sx={{
                                                justifyContent: "space-between",
                                                py: 1.2,
                                                px: 2,
                                                borderColor: "divider",
                                                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Inventory2RoundedIcon color="primary" />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    View All Products
                                                </Typography>
                                            </Box>
                                        </Button>

                                        {isAdmin && (
                                            <>
                                                <Button
                                                    variant="outlined"
                                                    color="inherit"
                                                    fullWidth
                                                    endIcon={<ArrowForwardRoundedIcon />}
                                                    onClick={() => navigate("/categories")}
                                                    sx={{
                                                        justifyContent: "space-between",
                                                        py: 1.2,
                                                        px: 2,
                                                        borderColor: "divider",
                                                        "&:hover": { borderColor: "secondary.main", color: "secondary.main" },
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <CategoryRoundedIcon color="secondary" />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Manage Categories
                                                        </Typography>
                                                    </Box>
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="inherit"
                                                    fullWidth
                                                    endIcon={<ArrowForwardRoundedIcon />}
                                                    onClick={() => navigate("/suppliers")}
                                                    sx={{
                                                        justifyContent: "space-between",
                                                        py: 1.2,
                                                        px: 2,
                                                        borderColor: "divider",
                                                        "&:hover": { borderColor: "info.main", color: "info.main" },
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <LocalShippingRoundedIcon color="info" />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Manage Suppliers
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
        </DashboardLayout>
    );
}