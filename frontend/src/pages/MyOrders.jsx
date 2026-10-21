import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../services/orderService";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";

import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    InputAdornment,
    Alert,
    CircularProgress,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export default function MyOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        const timer = setTimeout(
            () => {
                getOrders({
                    page,
                    limit: 10,
                    status: status || undefined,
                    search: search.trim() || undefined,
                })
                    .then((res) => {
                        if (cancelled) return;
                        const data = res.data?.data || {};
                        setOrders(data.content || []);
                        setTotalPages(data.totalPages || 1);
                        setTotalElements(data.totalElements || 0);
                    })
                    .catch((err) => {
                        if (!cancelled) {
                            setError(err.response?.data?.message || "Failed to load orders");
                        }
                    })
                    .finally(() => {
                        if (!cancelled) setLoading(false);
                    });
            },
            search ? 400 : 0
        );

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [page, status, search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        My Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                        Track your purchase orders, shipment stages, and payment details.
                    </Typography>
                </Box>
                <Button variant="outlined" color="primary" onClick={() => navigate("/shop")}>
                    Browse Shop
                </Button>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <TextField
                        placeholder="Search Order Number..."
                        value={search}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ flex: 1, minWidth: 220 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={handleStatusChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="PLACED">PLACED</MenuItem>
                        <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                        <MenuItem value="PACKED">PACKED</MenuItem>
                        <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                        <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </TextField>
                </Stack>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : orders.length === 0 ? (
                <Card sx={{ p: 6, textAlign: "center" }}>
                    <ReceiptLongRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        You haven't placed any orders matching the selected filter.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate("/shop")}>
                        Start Shopping
                    </Button>
                </Card>
            ) : (
                <Card sx={{ overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date Placed</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Order Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((o) => (
                                    <TableRow key={o.id} hover>
                                        <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {o.orderNumber}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                                        </TableCell>
                                        <TableCell>{o.itemCount || 0}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            ₹{Number(o.total || 0).toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={o.status} type="order" />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={o.paymentStatus} type="payment" />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<VisibilityOutlinedIcon />}
                                                onClick={() => navigate(`/orders/${o.id}`)}
                                                sx={{ py: 0.4 }}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
        </Box>
    );
}
