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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export default function ManageOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
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
                    from: from || undefined,
                    to: to || undefined,
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
    }, [page, status, search, from, to]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setPage(1);
    };

    const handleFromChange = (e) => {
        setFrom(e.target.value);
        setPage(1);
    };

    const handleToChange = (e) => {
        setTo(e.target.value);
        setPage(1);
    };

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Manage Orders
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    Review customer orders, verify payments, and advance processing stages.
                </Typography>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Search Order Number..."
                        value={search}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ flex: 1, minWidth: 200 }}
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
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="PLACED">PLACED</MenuItem>
                        <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                        <MenuItem value="PACKED">PACKED</MenuItem>
                        <MenuItem value="SHIPPED">SHIPPED</MenuItem>
                        <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                    </TextField>

                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={from}
                        onChange={handleFromChange}
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
                        value={to}
                        onChange={handleToChange}
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
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        No orders match the current filtering criteria.
                    </Typography>
                </Card>
            ) : (
                <Card sx={{ overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Order Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
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
                                        <TableCell sx={{ color: "text.primary" }}>
                                            {o.customerName || `Customer #${o.customerId}`}
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
                                                onClick={() => navigate(`/manage/orders/${o.id}`)}
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
