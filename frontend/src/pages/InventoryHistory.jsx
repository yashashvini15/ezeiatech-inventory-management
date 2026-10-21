import { useEffect, useState } from "react";
import { getInventoryMovements } from "../services/inventoryService";
import { getProducts } from "../services/productService";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Pagination,
    TextField,
    MenuItem,
    Stack,
    CircularProgress,
    Tooltip,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

const LIMIT = 10;

export default function InventoryHistory() {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0); // backend is 0-indexed
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Load products list for dropdown
    useEffect(() => {
        getProducts({ limit: 100 })
            .then((res) => setProducts(res.data?.data?.content || []))
            .catch(() => {});
    }, []);

    // Load movements
    useEffect(() => {
        setLoading(true);
        const params = {
            page,
            limit: LIMIT,
        };
        if (selectedProductId) params.productId = selectedProductId;
        if (selectedType) params.type = selectedType;
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;

        getInventoryMovements(params)
            .then((res) => {
                const pageData = res.data?.data;
                setMovements(pageData?.content || []);
                setTotalPages(Math.max(1, pageData?.totalPages || 1));
                setTotalElements(pageData?.totalElements || 0);
            })
            .catch((err) => {
                console.error("Failed to load inventory movements", err);
            })
            .finally(() => setLoading(false));
    }, [page, selectedProductId, selectedType, fromDate, toDate]);

    const getTypeChip = (type) => {
        switch (type) {
            case "STOCK_IN":
                return (
                    <Chip
                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 14 }} />}
                        label="STOCK IN"
                        size="small"
                        color="success"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                );
            case "ORDER_PLACED":
                return (
                    <Chip
                        icon={<TrendingDownRoundedIcon sx={{ fontSize: 14 }} />}
                        label="ORDER PLACED"
                        size="small"
                        color="error"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                );
            case "ORDER_CANCELLED":
                return (
                    <Chip
                        icon={<TrendingUpRoundedIcon sx={{ fontSize: 14 }} />}
                        label="ORDER CANCELLED"
                        size="small"
                        color="info"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                );
            default:
                return <Chip label={type} size="small" sx={{ height: 22, fontSize: "0.7rem" }} />;
        }
    };

    return (
        <Box sx={{ pb: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Inventory Movements & Audit Log
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3, fontSize: "0.85rem" }}>
                    Complete audit trail of all stock additions, orders placed, and cancellations
                </Typography>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ mb: 2.5, p: 0.5 }}>
                <CardContent sx={{ p: 1.5 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} flexWrap="wrap" alignItems="center">
                        <TextField
                            select
                            label="Filter by Product"
                            size="small"
                            value={selectedProductId}
                            onChange={(e) => {
                                setSelectedProductId(e.target.value);
                                setPage(0);
                            }}
                            sx={{ minWidth: 200, flex: { sm: 1 } }}
                        >
                            <MenuItem value="">All Products</MenuItem>
                            {products.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.name} ({p.sku})
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Movement Type"
                            size="small"
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setPage(0);
                            }}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="STOCK_IN">STOCK IN (+)</MenuItem>
                            <MenuItem value="ORDER_PLACED">ORDER PLACED (-)</MenuItem>
                            <MenuItem value="ORDER_CANCELLED">ORDER CANCELLED (+)</MenuItem>
                        </TextField>

                        <TextField
                            label="From Date"
                            type="date"
                            size="small"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setPage(0);
                            }}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{
                                minWidth: 160,
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
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setPage(0);
                            }}
                            slotProps={{ inputLabel: { shrink: true } }}
                            sx={{
                                minWidth: 160,
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
                    </Stack>
                </CardContent>
            </Card>

            {/* Movements Data Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    width: "100%",
                    overflowX: "auto",
                    backgroundColor: "#FFFFFF",
                }}
            >
                <Table sx={{ width: "100%", minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                PRODUCT
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                TYPE
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                QTY CHANGE
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                STOCK (PREV → NEW)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                PERFORMED BY
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", py: 1.5 }}>
                                DATE & TIME
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={28} color="primary" />
                                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                                        Loading inventory movements...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : movements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <HistoryRoundedIcon sx={{ fontSize: 44, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        No inventory movements found
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        Add stock to products to see movement logs here.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            movements.map((m) => {
                                const isPositive = m.type === "STOCK_IN" || m.type === "ORDER_CANCELLED";
                                return (
                                    <TableRow key={m.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                        <TableCell sx={{ py: 1.2 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                                #{m.id}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1.2 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                {m.productName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                                                {m.sku}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ py: 1.2 }}>{getTypeChip(m.type)}</TableCell>

                                        <TableCell align="center" sx={{ py: 1.2 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: isPositive ? "success.main" : "error.main",
                                                }}
                                            >
                                                {isPositive ? `+${m.quantity}` : `-${m.quantity}`}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center" sx={{ py: 1.2 }}>
                                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                    {m.previousStock}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    →
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    {m.newStock}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ py: 1.2 }}>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {m.createdByName || "System"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right" sx={{ py: 1.2 }}>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {m.createdAt ? new Date(m.createdAt).toLocaleString("en-IN") : "—"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2.5, flexWrap: "wrap", gap: 2 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Showing Page {page + 1} of {totalPages} ({totalElements} total movements)
                </Typography>
                <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={(e, val) => setPage(val - 1)}
                    color="primary"
                    shape="rounded"
                    size="small"
                />
            </Box>
        </Box>
    );
}
