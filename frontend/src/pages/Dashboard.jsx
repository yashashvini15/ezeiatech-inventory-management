import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { getDashboardStats } from "../services/dashboardService";
import LowStockAlert from "../components/LowStockAlert";

import {
    Box,
    Grid,
    Card,
    Typography,
    Alert,
    Skeleton,
    IconButton,
    Tooltip,
    Stack,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    LinearProgress,
} from "@mui/material";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

// Order Status Pipeline Colors & Labels
const PIPELINE_CONFIG = {
    PLACED: { color: "#3B82F6", label: "Placed", lightBg: "rgba(59, 130, 246, 0.1)" },
    CONFIRMED: { color: "#06B6D4", label: "Confirmed", lightBg: "rgba(6, 182, 212, 0.1)" },
    PACKED: { color: "#8B5CF6", label: "Packed", lightBg: "rgba(139, 92, 246, 0.1)" },
    SHIPPED: { color: "#F59E0B", label: "Shipped", lightBg: "rgba(245, 158, 11, 0.1)" },
    DELIVERED: { color: "#10B981", label: "Delivered", lightBg: "rgba(16, 185, 129, 0.1)" },
    CANCELLED: { color: "#EF4444", label: "Cancelled", lightBg: "rgba(239, 68, 68, 0.1)" },
};

function formatMonth(monthStr) {
    if (!monthStr || typeof monthStr !== "string") return monthStr;
    const parts = monthStr.split("-");
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mName = monthNames[month - 1] || parts[1];
    return `${mName} '${year.slice(-2)}`;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;
    const isAdmin = role === "ADMIN";

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cancelledRef = useRef(false);

    const loadStats = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError("");

        try {
            const res = await getDashboardStats();
            if (cancelledRef.current) return;
            setStats(res.data?.data || null);
        } catch (err) {
            if (!cancelledRef.current) {
                setError(err.response?.data?.message || "Failed to load dashboard metrics.");
            }
        } finally {
            if (!cancelledRef.current && !silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        cancelledRef.current = false;
        loadStats();
        return () => {
            cancelledRef.current = true;
        };
    }, [loadStats]);

    // Top Cards: 7 for Admin, 6 for Staff
    const cards = [
        {
            title: "Total Products",
            value: (stats?.totalProducts ?? 0).toLocaleString("en-IN"),
            subtitle: "In active catalog",
            icon: <Inventory2RoundedIcon sx={{ fontSize: 22 }} />,
            color: "#6366F1",
            bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.04) 100%)",
            onClick: () => navigate("/products"),
        },
        {
            title: "Total Customers",
            value: (stats?.totalCustomers ?? 0).toLocaleString("en-IN"),
            subtitle: "Registered buyers",
            icon: <PeopleRoundedIcon sx={{ fontSize: 22 }} />,
            color: "#0EA5E9",
            bg: "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.04) 100%)",
            onClick: () => navigate("/customers"),
        },
        {
            title: "Total Orders",
            value: (stats?.totalOrders ?? 0).toLocaleString("en-IN"),
            subtitle: "All-time placed",
            icon: <ShoppingBagRoundedIcon sx={{ fontSize: 22 }} />,
            color: "#8B5CF6",
            bg: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 100%)",
            onClick: () => navigate("/manage/orders"),
        },
        ...(isAdmin
            ? [
                  {
                      title: "Total Revenue",
                      value: `₹${Number(stats?.totalSales ?? 0).toLocaleString("en-IN")}`,
                      subtitle: "Gross realized earnings",
                      icon: <CurrencyRupeeRoundedIcon sx={{ fontSize: 22 }} />,
                      color: "#10B981",
                      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.04) 100%)",
                      onClick: () => navigate("/reports"),
                  },
              ]
            : []),
        {
            title: "Low Stock Alert",
            value: (stats?.lowStockProducts ?? 0).toLocaleString("en-IN"),
            subtitle: (stats?.lowStockProducts ?? 0) > 0 ? "Requires restock" : "Safe stock levels",
            icon: <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />,
            color: (stats?.lowStockProducts ?? 0) > 0 ? "#EF4444" : "#10B981",
            bg: (stats?.lowStockProducts ?? 0) > 0 ? "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%)" : "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
            onClick: () => navigate("/products?lowStock=true"),
        },
        {
            title: "Pending Orders",
            value: (stats?.pendingOrders ?? 0).toLocaleString("en-IN"),
            subtitle: "Awaiting fulfillment",
            icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 22 }} />,
            color: "#F59E0B",
            bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)",
            onClick: () => navigate("/manage/orders?status=PLACED"),
        },
        {
            title: "Delivered Orders",
            value: (stats?.deliveredOrders ?? 0).toLocaleString("en-IN"),
            subtitle: "Completed successfully",
            icon: <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />,
            color: "#10B981",
            bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)",
            onClick: () => navigate("/manage/orders?status=DELIVERED"),
        },
    ];

    // ==========================================
    // 1. Sales Analytics Wave Area Chart (Admin Only)
    // ==========================================
    const rawSalesMonth = stats?.salesByMonth || [];
    const salesCategories = rawSalesMonth.map((item) => formatMonth(item.month));
    const salesValues = rawSalesMonth.map((item) => item.sales ?? 0);

    const salesAreaOptions = {
        chart: {
            type: "area",
            height: 290,
            toolbar: { show: false },
            sparkline: { enabled: false },
            fontFamily: "Inter, Roboto, sans-serif",
            zoom: { enabled: false },
        },
        stroke: {
            curve: "smooth",
            width: 3.5,
            colors: ["#7C3AED"],
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                shadeIntensity: 0.5,
                opacityFrom: 0.35,
                opacityTo: 0.02,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: "#8B5CF6", opacity: 0.4 },
                    { offset: 100, color: "#8B5CF6", opacity: 0.0 },
                ],
            },
        },
        markers: {
            size: 0,
            colors: ["#FFFFFF"],
            strokeColors: "#7C3AED",
            strokeWidth: 3,
            hover: { size: 6 },
        },
        grid: {
            borderColor: "rgba(226, 232, 240, 0.6)",
            strokeDashArray: 5,
            yaxis: { lines: { show: true } },
            xaxis: { lines: { show: false } },
            padding: { top: 10, right: 10, bottom: 0, left: 10 },
        },
        xaxis: {
            categories: salesCategories,
            labels: {
                style: {
                    colors: "#94A3B8",
                    fontSize: "11px",
                    fontWeight: 600,
                },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#94A3B8",
                    fontSize: "11px",
                    fontWeight: 600,
                },
                formatter: (val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`,
            },
        },
        tooltip: {
            theme: "light",
            custom: function ({ series, seriesIndex, dataPointIndex }) {
                const val = series[seriesIndex][dataPointIndex];
                const dateLabel = salesCategories[dataPointIndex];
                return `
                    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 10px 14px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                        <div style="font-size: 11px; color: #64748B; font-weight: 600; margin-bottom: 2px;">${dateLabel}</div>
                        <div style="font-size: 14px; color: #7C3AED; font-weight: 800;">₹${Number(val).toLocaleString("en-IN")}</div>
                        <div style="font-size: 10px; color: #10B981; font-weight: 600; margin-top: 2px;">Monthly Revenue</div>
                    </div>
                `;
            },
        },
    };

    const salesAreaSeries = [{ name: "Sales", data: salesValues }];

    // ==========================================
    // 2. Orders Radial Multi-Bar / Donut Chart
    // ==========================================
    const rawOrdersStatus = stats?.ordersByStatus || [];
    const totalOrderCount = rawOrdersStatus.reduce((acc, curr) => acc + (curr.count || 0), 0);

    // Filter statuses for Radial/Donut breakdown
    const donutLabels = rawOrdersStatus.map((item) => PIPELINE_CONFIG[item.status]?.label || item.status);
    const donutSeries = rawOrdersStatus.map((item) => item.count || 0);
    const donutColors = rawOrdersStatus.map((item) => PIPELINE_CONFIG[item.status]?.color || "#6366F1");

    const radialDonutOptions = {
        chart: {
            type: "donut",
            fontFamily: "Inter, Roboto, sans-serif",
            animations: { enabled: true, speed: 700 },
        },
        colors: donutColors,
        labels: donutLabels,
        stroke: { width: 3, colors: ["#FFFFFF"] },
        dataLabels: { enabled: false },
        legend: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: "72%",
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#94A3B8",
                            offsetY: -6,
                        },
                        value: {
                            show: true,
                            fontSize: "24px",
                            fontWeight: 800,
                            color: "#1E293B",
                            offsetY: 4,
                            formatter: () => totalOrderCount.toString(),
                        },
                        total: {
                            show: true,
                            label: "Total Orders",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#94A3B8",
                            formatter: () => totalOrderCount.toString(),
                        },
                    },
                },
            },
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `${val} orders (${totalOrderCount > 0 ? Math.round((val / totalOrderCount) * 100) : 0}%)`,
            },
        },
    };

    // ==========================================
    // 3. Top-Selling Products list
    // ==========================================
    const topProducts = stats?.topProducts || [];
    const maxQty = Math.max(...topProducts.map((p) => p.quantity || 0), 1);

    return (
        <Box sx={{ pb: 4 }}>
            {/* Low-Stock Alert Banner */}
            <LowStockAlert />

            {/* Header / Welcome Bar */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 3,
                }}
            >
                <Box>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Overview & Analytics
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mt: 0.2 }}>
                        Welcome Back, {user?.name || (isAdmin ? "Admin" : "Staff Member")} 👋
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.86rem" }}>
                        Real-time operations, fulfillment lifecycle, and financial performance metrics.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Refresh All Data">
                        <IconButton
                            onClick={() => loadStats(false)}
                            disabled={loading}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#FFFFFF",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.02)" },
                            }}
                        >
                            <RefreshRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Top KPI Cards (Organized Grid) */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: isAdmin ? "repeat(7, 1fr)" : "repeat(6, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                    width: "100%",
                }}
            >
                {loading
                    ? Array.from({ length: isAdmin ? 7 : 6 }).map((_, idx) => (
                          <Card key={idx} sx={{ p: 2.2, borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "#FFFFFF" }}>
                              <Skeleton variant="rounded" width={38} height={38} sx={{ borderRadius: 2, mb: 1.5 }} />
                              <Skeleton variant="text" width="60%" height={20} />
                              <Skeleton variant="text" width="45%" height={32} />
                          </Card>
                      ))
                    : cards.map((c) => (
                          <Card
                              key={c.title}
                              onClick={c.onClick}
                              sx={{
                                  p: 2.2,
                                  borderRadius: 3,
                                  cursor: "pointer",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  backgroundColor: "#FFFFFF",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                  transition: "all 0.22s ease-in-out",
                                  "&:hover": {
                                      borderColor: c.color,
                                      transform: "translateY(-3px)",
                                      boxShadow: "0 12px 24px -6px rgba(0,0,0,0.07)",
                                  },
                              }}
                          >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                                  <Box
                                      sx={{
                                          width: 42,
                                          height: 42,
                                          borderRadius: 2.5,
                                          background: c.bg,
                                          color: c.color,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                      }}
                                  >
                                      {c.icon}
                                  </Box>
                                  <ArrowOutwardRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                              </Box>
                              <Box>
                                  <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.82rem" }}>
                                      {c.title}
                                  </Typography>
                                  <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mt: 0.3, letterSpacing: "-0.01em" }}>
                                      {c.value}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.75rem", mt: 0.2, display: "block" }}>
                                      {c.subtitle}
                                  </Typography>
                              </Box>
                          </Card>
                      ))}
            </Box>

            {/* TOP ANALYTICS SECTION */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: isAdmin ? "repeat(2, 1fr)" : "1fr",
                    },
                    gap: 3,
                    mb: 3,
                    width: "100%",
                }}
            >
                {/* 1. Sales Revenue Analytics (Admin Only: 6 cols) */}
                {isAdmin && (
                    <Card sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <ShowChartRoundedIcon sx={{ color: "#7C3AED", fontSize: 24 }} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                                        Sales Revenue Analytics
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Monthly recurring & gross revenue trajectory (12-month period)
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label="Live Revenue Data"
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: "0.72rem", height: 24 }}
                            />
                        </Box>
                        <Divider sx={{ my: 1.5, borderColor: "rgba(226, 232, 240, 0.7)" }} />

                        {loading ? (
                            <Skeleton variant="rectangular" width="100%" height={290} sx={{ borderRadius: 2 }} />
                        ) : salesValues.length === 0 || salesValues.every((v) => v === 0) ? (
                            <Box sx={{ height: 290, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="body2" color="text.secondary">
                                    No sales revenue recorded yet
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ width: "100%", height: 290, mt: "auto" }}>
                                <Chart options={salesAreaOptions} series={salesAreaSeries} type="area" height="100%" />
                            </Box>
                        )}
                    </Card>
                )}

                {/* 2. Order Pipeline (Donut on Left + Stage Breakdown on Right side inside the card) */}
                <Card sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", height: "100%", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <DonutLargeRoundedIcon sx={{ color: "#3B82F6", fontSize: 22 }} />
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                                        Order Pipeline & Fulfillment
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Real-time distribution across active stages
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={`${totalOrderCount} Total Orders`}
                                size="small"
                                sx={{ fontWeight: 700, fontSize: "0.72rem", height: 24, backgroundColor: "rgba(59, 130, 246, 0.08)", color: "#2563EB" }}
                            />
                        </Box>
                        <Divider sx={{ my: 1.5, borderColor: "rgba(226, 232, 240, 0.7)" }} />

                        {loading ? (
                            <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 2 }} />
                        ) : totalOrderCount === 0 ? (
                            <Box sx={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Typography variant="body2" color="text.secondary">
                                    No orders to analyze yet
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1.2fr", md: "1fr 1.35fr" },
                                    alignItems: "center",
                                    gap: { xs: 2.5, sm: 3 },
                                    flex: 1,
                                    width: "100%",
                                    py: 1,
                                }}
                            >
                                {/* Donut Chart */}
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                                    <Box sx={{ width: "100%", maxWidth: 230 }}>
                                        <Chart options={radialDonutOptions} series={donutSeries} type="donut" width="100%" />
                                    </Box>
                                </Box>

                                {/* Stage Breakdown on the Right of Graph - Fills available width smoothly */}
                                <Box
                                    sx={{
                                        pl: { sm: 2.5 },
                                        pr: { sm: 1 },
                                        borderLeft: { sm: "1px solid" },
                                        borderColor: { sm: "divider" },
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            mb: 1.2,
                                            display: "block",
                                        }}
                                    >
                                        Stage Breakdown
                                    </Typography>

                                    <Stack spacing={1.1} sx={{ width: "100%" }}>
                                        {rawOrdersStatus.map((item) => {
                                            const conf = PIPELINE_CONFIG[item.status] || { color: "#6366F1", label: item.status };
                                            const pct = totalOrderCount > 0 ? Math.round(((item.count || 0) / totalOrderCount) * 100) : 0;
                                            return (
                                                <Box key={item.status} sx={{ width: "100%" }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.35 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                                            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: conf.color, flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem", color: "text.primary" }}>
                                                                {conf.label}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "text.primary" }}>
                                                            {item.count || 0} <span style={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.72rem" }}>({pct}%)</span>
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={pct}
                                                        sx={{
                                                            width: "100%",
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: "rgba(241, 245, 249, 1)",
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 3,
                                                                backgroundColor: conf.color,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            </Box>
                        )}
                    </Card>
            </Box>

            {/* LOWER SECTION: Top-Selling Products Full-Width Enterprise Table */}
            <Card sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider", backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", width: "100%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                            Top-Selling Products
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            High-demand catalog items ranked by units sold {isAdmin ? "with associated revenue" : ""}
                        </Typography>
                    </Box>
                    <Chip
                        label="Top Performers"
                        size="small"
                        sx={{ fontWeight: 700, fontSize: "0.72rem", height: 24, backgroundColor: "rgba(99, 102, 241, 0.08)", color: "primary.main" }}
                    />
                </Box>
                <Divider sx={{ my: 1.5, borderColor: "rgba(226, 232, 240, 0.7)" }} />

                {loading ? (
                    <Stack spacing={1.5} sx={{ py: 1 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} variant="rounded" width="100%" height={45} />
                        ))}
                    </Stack>
                ) : topProducts.length === 0 || topProducts.every((p) => (p.quantity ?? 0) === 0) ? (
                    <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            No product sales recorded yet
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto", width: "100%" }}>
                        <Table sx={{ width: "100%", minWidth: 650 }}>
                            <TableHead sx={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", py: 1.4, color: "#64748B" }}>PRODUCT INFO</TableCell>
                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", py: 1.4, color: "#64748B", minWidth: 200 }}>VOLUME RATIO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8rem", py: 1.4, color: "#64748B" }}>UNITS SOLD</TableCell>
                                    {isAdmin && (
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8rem", py: 1.4, color: "#64748B" }}>TOTAL REVENUE</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topProducts.map((p, idx) => {
                                    const pct = Math.round(((p.quantity || 0) / maxQty) * 100);
                                    return (
                                        <TableRow key={p.productId || idx} hover sx={{ "&:hover": { backgroundColor: "rgba(248, 250, 252, 0.6)" } }}>
                                            <TableCell sx={{ py: 1.6 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.8 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 2.5,
                                                            fontSize: "0.88rem",
                                                            fontWeight: 700,
                                                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                                                            color: "#4F46E5",
                                                        }}
                                                    >
                                                        {p.name ? p.name.charAt(0).toUpperCase() : "#"}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                            {p.name || `Product`}
                                                        </Typography>
                                                        {p.sku && (
                                                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem", fontWeight: 500 }}>
                                                                SKU: {p.sku}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.6 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={pct}
                                                        sx={{
                                                            flex: 1,
                                                            height: 7,
                                                            borderRadius: 3.5,
                                                            backgroundColor: "rgba(226, 232, 240, 0.6)",
                                                            "& .MuiLinearProgress-bar": {
                                                                borderRadius: 3.5,
                                                                backgroundColor: idx === 0 ? "#8B5CF6" : "#4F46E5",
                                                            },
                                                        }}
                                                    />
                                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.78rem", minWidth: 32 }}>
                                                        {pct}%
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 1.6, fontWeight: 800, color: "text.primary", fontSize: "0.9rem" }}>
                                                {p.quantity || 0} pcs
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell align="right" sx={{ py: 1.6, fontWeight: 800, color: "#10B981", fontSize: "0.92rem" }}>
                                                    ₹{Number(p.revenue ?? 0).toLocaleString("en-IN")}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </Box>
    );
}
