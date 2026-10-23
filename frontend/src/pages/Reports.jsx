import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Tabs,
    Tab,
    Grid,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    Skeleton,
} from "@mui/material";

import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { getSalesReport, getLowStockReport, getMovementsReport } from "../services/reportService";
import Pagination from "../components/Pagination";

// Helper: Format to YYYY-MM-DD
function formatDateToISO(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function Reports() {
    const [currentTab, setCurrentTab] = useState(0);

    // ==========================================
    // TAB 1: SALES REPORT STATE
    // ==========================================
    // Default last 30 days:
    // toDate = today, fromDate = 30 days ago
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [salesFrom, setSalesFrom] = useState(formatDateToISO(thirtyDaysAgo));
    const [salesTo, setSalesTo] = useState(formatDateToISO(today));
    const [salesDateError, setSalesDateError] = useState(null);
    const [salesApiError, setSalesApiError] = useState(null);
    const [salesLoading, setSalesLoading] = useState(false);
    const [salesData, setSalesData] = useState(null);

    const fetchSales = useCallback(async (from, to) => {
        // Validation: from > to check prevents unnecessary API call
        if (from && to && from > to) {
            setSalesDateError("'From' date cannot be after 'To' date.");
            return;
        }
        setSalesDateError(null);
        setSalesApiError(null);
        setSalesLoading(true);

        try {
            const res = await getSalesReport({ from, to });
            setSalesData(res.data?.data || null);
        } catch (err) {
            console.error("Sales report error:", err);
            const msg = err.response?.data?.message || "Failed to load sales report.";
            setSalesApiError(msg);
        } finally {
            setSalesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentTab === 0) {
            fetchSales(salesFrom, salesTo);
        }
    }, [currentTab, salesFrom, salesTo, fetchSales]);

    const handleApplySalesDates = () => {
        fetchSales(salesFrom, salesTo);
    };

    // ==========================================
    // TAB 2: LOW STOCK REPORT STATE (0-based page)
    // ==========================================
    const [lowStockPage, setLowStockPage] = useState(0);
    const lowStockLimit = 10;
    const [lowStockData, setLowStockData] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [lowStockLoading, setLowStockLoading] = useState(false);
    const [lowStockError, setLowStockError] = useState(null);

    const fetchLowStock = useCallback(async (pageIndex) => {
        setLowStockLoading(true);
        setLowStockError(null);
        try {
            const res = await getLowStockReport({ page: pageIndex, limit: lowStockLimit });
            const data = res.data?.data;
            if (data) {
                setLowStockData({
                    content: data.content || [],
                    totalPages: data.totalPages || 1,
                    totalElements: data.totalElements || 0,
                });
            }
        } catch (err) {
            console.error("Low stock report error:", err);
            setLowStockError(err.response?.data?.message || "Failed to fetch low stock report.");
        } finally {
            setLowStockLoading(false);
        }
    }, [lowStockLimit]);

    useEffect(() => {
        if (currentTab === 1) {
            fetchLowStock(lowStockPage);
        }
    }, [currentTab, lowStockPage, fetchLowStock]);

    // ==========================================
    // TAB 3: STOCK MOVEMENTS REPORT STATE (0-based page)
    // ==========================================
    const [movFrom, setMovFrom] = useState("");
    const [movTo, setMovTo] = useState("");
    const [movDateError, setMovDateError] = useState(null);
    const [movPage, setMovPage] = useState(0);
    const movLimit = 10;
    const [movData, setMovData] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [movLoading, setMovLoading] = useState(false);
    const [movError, setMovError] = useState(null);

    const fetchMovements = useCallback(async (pageIndex, fromDate, toDate) => {
        if (fromDate && toDate && fromDate > toDate) {
            setMovDateError("'From' date cannot be after 'To' date.");
            return;
        }
        setMovDateError(null);
        setMovLoading(true);
        setMovError(null);
        try {
            const params = { page: pageIndex, limit: movLimit };
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const res = await getMovementsReport(params);
            const data = res.data?.data;
            if (data) {
                setMovData({
                    content: data.content || [],
                    totalPages: data.totalPages || 1,
                    totalElements: data.totalElements || 0,
                });
            }
        } catch (err) {
            console.error("Movements report error:", err);
            setMovError(err.response?.data?.message || "Failed to fetch inventory movements.");
        } finally {
            setMovLoading(false);
        }
    }, [movLimit]);

    useEffect(() => {
        if (currentTab === 2) {
            fetchMovements(movPage, movFrom, movTo);
        }
    }, [currentTab, movPage, movFrom, movTo, fetchMovements]);

    const handleApplyMovementsFilter = () => {
        setMovPage(0);
        fetchMovements(0, movFrom, movTo);
    };

    return (
        <Box sx={{ pb: 4 }}>
            {/* Page Header */}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AssessmentRoundedIcon color="primary" sx={{ fontSize: 30 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                            Reports & Analytics
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        Financial audits, inventory replenishment thresholds, and movement ledger
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={(_, val) => setCurrentTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        px: 2,
                        "& .MuiTab-root": { fontWeight: 700, textTransform: "none", fontSize: "0.92rem", py: 1.8 },
                    }}
                >
                    <Tab icon={<MonetizationOnRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Sales Performance" />
                    <Tab icon={<WarningAmberRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Low Stock Audit" />
                    <Tab icon={<SwapHorizRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Stock Movements" />
                </Tabs>
            </Card>

            {/* TAB 0: SALES REPORT */}
            {currentTab === 0 && (
                <Box>
                    {/* Date Filter & Control Card */}
                    <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: 2,
                                    alignItems: { xs: "stretch", sm: "center" },
                                    flexWrap: "wrap",
                                }}
                            >
                                <TextField
                                    label="From Date"
                                    type="date"
                                    size="small"
                                    value={salesFrom}
                                    onChange={(e) => setSalesFrom(e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={{
                                        minWidth: 170,
                                        "& .MuiInputLabel-root": {
                                            backgroundColor: "#FFFFFF",
                                            px: 0.6,
                                            zIndex: 1,
                                        },
                                        "& input[type='date']": {
                                            minHeight: "1.4375em",
                                        },
                                    }}
                                />
                                <TextField
                                    label="To Date"
                                    type="date"
                                    size="small"
                                    value={salesTo}
                                    onChange={(e) => setSalesTo(e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={{
                                        minWidth: 170,
                                        "& .MuiInputLabel-root": {
                                            backgroundColor: "#FFFFFF",
                                            px: 0.6,
                                            zIndex: 1,
                                        },
                                        "& input[type='date']": {
                                            minHeight: "1.4375em",
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleApplySalesDates}
                                    disabled={salesLoading}
                                    sx={{ fontWeight: 600, px: 3 }}
                                >
                                    Apply Filter
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<RefreshRoundedIcon />}
                                    onClick={() => fetchSales(salesFrom, salesTo)}
                                    disabled={salesLoading}
                                    sx={{ borderColor: "divider" }}
                                >
                                    Refresh
                                </Button>
                            </Box>

                            {/* Date validation alert */}
                            {salesDateError && (
                                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                                    {salesDateError}
                                </Alert>
                            )}

                            {/* Backend API Error alert (e.g. range > 366 days 400 error) */}
                            {salesApiError && (
                                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
                                    {salesApiError}
                                </Alert>
                            )}

                            <Typography variant="caption" sx={{ color: "text.secondary", mt: 1.5, display: "block", fontStyle: "italic" }}>
                                * Note: Cancelled orders are not counted in sales revenue or order totals.
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Summary KPI Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: "100%", borderRadius: 2 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Total Orders
                                        </Typography>
                                        <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "rgba(79, 70, 229, 0.08)", color: "primary.main" }}>
                                            <ShoppingBagRoundedIcon fontSize="small" />
                                        </Box>
                                    </Box>
                                    {salesLoading ? (
                                        <Skeleton variant="text" width="60%" height={38} />
                                    ) : (
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {(salesData?.totalOrders ?? 0).toLocaleString("en-IN")}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        Confirmed / Delivered in range
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: "100%", borderRadius: 2 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Total Sales
                                        </Typography>
                                        <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "rgba(16, 185, 129, 0.08)", color: "success.main" }}>
                                            <MonetizationOnRoundedIcon fontSize="small" />
                                        </Box>
                                    </Box>
                                    {salesLoading ? (
                                        <Skeleton variant="text" width="70%" height={38} />
                                    ) : (
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            ₹{(salesData?.totalSales ?? 0).toLocaleString("en-IN")}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        Sum of non-cancelled revenue
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ height: "100%", borderRadius: 2 }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Average Order Value
                                        </Typography>
                                        <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: "rgba(245, 158, 11, 0.08)", color: "warning.main" }}>
                                            <QueryStatsRoundedIcon fontSize="small" />
                                        </Box>
                                    </Box>
                                    {salesLoading ? (
                                        <Skeleton variant="text" width="60%" height={38} />
                                    ) : (
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            ₹{Math.round(salesData?.averageOrderValue ?? 0).toLocaleString("en-IN")}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        Per successful transaction
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Daily Breakdown Table */}
                    <Card sx={{ borderRadius: 2 }}>
                        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Daily Breakdown
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Day-by-day order counts and total sales volume
                            </Typography>
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: 500 }}>
                                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>DATE</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>ORDERS</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>SALES AMOUNT (₹)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {salesLoading ? (
                                        Array.from({ length: 4 }).map((_, index) => (
                                            <TableRow key={index}>
                                                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={60} sx={{ ml: "auto" }} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={90} sx={{ ml: "auto" }} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : !salesData?.daily || salesData.daily.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
                                                No sales recorded for this date range.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        salesData.daily.map((dayItem, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{dayItem.date}</TableCell>
                                                <TableCell align="right">{dayItem.orders}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: "success.main" }}>
                                                    ₹{(dayItem.sales || 0).toLocaleString("en-IN")}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Box>
            )}

            {/* TAB 1: LOW STOCK AUDIT */}
            {currentTab === 1 && (
                <Box>
                    {lowStockError && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {lowStockError}
                        </Alert>
                    )}
                    <Card sx={{ borderRadius: 2 }}>
                        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Low Stock Threshold Alert
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Items with stock level at or below their configured reorder level
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<RefreshRoundedIcon />}
                                onClick={() => fetchLowStock(lowStockPage)}
                                disabled={lowStockLoading}
                                sx={{ borderColor: "divider" }}
                            >
                                Refresh
                            </Button>
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>PRODUCT NAME</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>SKU</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>SUPPLIER</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>CURRENT STOCK</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>REORDER LEVEL</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>STATUS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lowStockLoading ? (
                                        Array.from({ length: 4 }).map((_, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell><Skeleton variant="text" width={140} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={50} sx={{ ml: "auto" }} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={50} sx={{ ml: "auto" }} /></TableCell>
                                                <TableCell align="center"><Skeleton variant="rounded" width={60} height={22} sx={{ mx: "auto" }} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : lowStockData.content.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                                                🎉 All stock levels are currently above reorder thresholds!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lowStockData.content.map((item, idx) => (
                                            <TableRow key={item.id || idx} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                                                <TableCell sx={{ color: "text.secondary", fontFamily: "monospace" }}>{item.sku}</TableCell>
                                                <TableCell>{item.supplierName || "—"}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, color: "error.main" }}>
                                                    {item.stock}
                                                </TableCell>
                                                <TableCell align="right">{item.reorderLevel}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={item.stock === 0 ? "Out of Stock" : "Low Stock"}
                                                        color={item.stock === 0 ? "error" : "warning"}
                                                        size="small"
                                                        sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination (Low Stock is 0-based in backend, UI displays 1-based) */}
                        <Box sx={{ p: 2 }}>
                            <Pagination
                                page={lowStockPage + 1}
                                totalPages={lowStockData.totalPages}
                                totalElements={lowStockData.totalElements}
                                onChange={(displayPage) => setLowStockPage(displayPage - 1)}
                            />
                        </Box>
                    </Card>
                </Box>
            )}

            {/* TAB 2: STOCK MOVEMENTS */}
            {currentTab === 2 && (
                <Box>
                    {/* Movements Filter Bar */}
                    <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: 2,
                                    alignItems: { xs: "stretch", sm: "center" },
                                    flexWrap: "wrap",
                                }}
                            >
                                <TextField
                                    label="From Date"
                                    type="date"
                                    size="small"
                                    value={movFrom}
                                    onChange={(e) => setMovFrom(e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={{
                                        minWidth: 170,
                                        "& .MuiInputLabel-root": {
                                            backgroundColor: "#FFFFFF",
                                            px: 0.6,
                                            zIndex: 1,
                                        },
                                        "& input[type='date']": {
                                            minHeight: "1.4375em",
                                        },
                                    }}
                                />
                                <TextField
                                    label="To Date"
                                    type="date"
                                    size="small"
                                    value={movTo}
                                    onChange={(e) => setMovTo(e.target.value)}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    sx={{
                                        minWidth: 170,
                                        "& .MuiInputLabel-root": {
                                            backgroundColor: "#FFFFFF",
                                            px: 0.6,
                                            zIndex: 1,
                                        },
                                        "& input[type='date']": {
                                            minHeight: "1.4375em",
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleApplyMovementsFilter}
                                    disabled={movLoading}
                                    sx={{ fontWeight: 600, px: 3 }}
                                >
                                    Filter Movements
                                </Button>
                                {(movFrom || movTo) && (
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        onClick={() => {
                                            setMovFrom("");
                                            setMovTo("");
                                            setMovPage(0);
                                            fetchMovements(0, "", "");
                                        }}
                                        sx={{ borderColor: "divider" }}
                                    >
                                        Clear Dates
                                    </Button>
                                )}
                            </Box>

                            {movDateError && (
                                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1.5 }}>
                                    {movDateError}
                                </Alert>
                            )}

                            {movError && (
                                <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
                                    {movError}
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Movements Table */}
                    <Card sx={{ borderRadius: 2 }}>
                        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Stock Movement Ledger
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Complete audit trail of inbound purchases, restocks, adjustments, and customer fulfillments
                            </Typography>
                        </Box>
                        <TableContainer component={Paper} elevation={0} sx={{ overflowX: "auto" }}>
                            <Table sx={{ minWidth: 750 }}>
                                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>TIMESTAMP</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>PRODUCT</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>SKU</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>TYPE</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>QTY</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>PREV → NEW</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem" }}>OPERATOR</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {movLoading ? (
                                        Array.from({ length: 5 }).map((_, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell><Skeleton variant="text" width={110} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={130} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                                                <TableCell><Skeleton variant="rounded" width={60} height={22} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={40} sx={{ ml: "auto" }} /></TableCell>
                                                <TableCell align="right"><Skeleton variant="text" width={80} sx={{ ml: "auto" }} /></TableCell>
                                                <TableCell><Skeleton variant="text" width={90} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : movData.content.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                                                No stock movements found for the selected period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        movData.content.map((item, idx) => (
                                            <TableRow key={item.id || idx} hover>
                                                <TableCell sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "—"}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{item.productName || "—"}</TableCell>
                                                <TableCell sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.82rem" }}>
                                                    {item.sku || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={item.type}
                                                        size="small"
                                                        color={
                                                            item.type === "INBOUND" || item.type === "RESTOCK"
                                                                ? "success"
                                                                : item.type === "OUTBOUND" || item.type === "ORDER"
                                                                ? "info"
                                                                : "warning"
                                                        }
                                                        sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                    {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                                                </TableCell>
                                                <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                    {item.previousStock} → <strong>{item.newStock}</strong>
                                                </TableCell>
                                                <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                    {item.createdByName || "System"}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination (Movements is 0-based in backend, UI displays 1-based) */}
                        <Box sx={{ p: 2 }}>
                            <Pagination
                                page={movPage + 1}
                                totalPages={movData.totalPages}
                                totalElements={movData.totalElements}
                                onChange={(displayPage) => setMovPage(displayPage - 1)}
                            />
                        </Box>
                    </Card>
                </Box>
            )}
        </Box>
    );
}
