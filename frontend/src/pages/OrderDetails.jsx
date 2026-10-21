import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getOrderById, updateOrderStatus, cancelOrder } from "../services/orderService";
import StatusBadge from "../components/StatusBadge";

import {
    Box,
    Card,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Divider,
    Alert,
    CircularProgress,
    Grid,
    Breadcrumbs,
    Link,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

const NEXT_STATUS_MAP = {
    PLACED: "CONFIRMED",
    CONFIRMED: "PACKED",
    PACKED: "SHIPPED",
    SHIPPED: "DELIVERED",
};

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    const isStaffOrAdmin = user?.role === "ADMIN" || user?.role === "STAFF";
    const backUrl = isStaffOrAdmin ? "/manage/orders" : "/orders";

    const fetchOrder = () => {
        setLoading(true);
        setError("");
        getOrderById(id)
            .then((res) => {
                setOrder(res.data?.data || null);
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    setError("Order not found.");
                } else {
                    setError(err.response?.data?.message || "Failed to load order.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        setActionLoading(true);
        setError("");
        try {
            await cancelOrder(id);
            fetchOrder();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to cancel order.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAdvanceStatus = async (nextStatus) => {
        setActionLoading(true);
        setError("");
        try {
            await updateOrderStatus(id, nextStatus);
            fetchOrder();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update order status.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box sx={{ maxWidth: 700, mx: "auto", py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || "Order not found."}
                </Alert>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate(backUrl)}
                    variant="outlined"
                >
                    Back to Orders
                </Button>
            </Box>
        );
    }

    const nextStatus = NEXT_STATUS_MAP[order.status];

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", pb: 4 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate(backUrl)}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                    <ArrowBackRoundedIcon fontSize="small" /> {isStaffOrAdmin ? "Manage Orders" : "My Orders"}
                </Link>
                <Typography color="text.primary">#{order.orderNumber}</Typography>
            </Breadcrumbs>

            {/* Top Summary Card */}
            <Card sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                            {order.customerName && ` • Customer: ${order.customerName}`}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <StatusBadge status={order.status} type="order" />
                        <StatusBadge status={order.paymentStatus} type="payment" />

                        {!isStaffOrAdmin && order.status === "PLACED" && (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={actionLoading}
                                onClick={handleCancelOrder}
                                startIcon={<CancelOutlinedIcon />}
                                sx={{ ml: 1 }}
                            >
                                {actionLoading ? "Cancelling..." : "Cancel Order"}
                            </Button>
                        )}

                        {isStaffOrAdmin && nextStatus && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={actionLoading}
                                onClick={() => handleAdvanceStatus(nextStatus)}
                                startIcon={<CheckCircleOutlineRoundedIcon />}
                                sx={{ ml: 1 }}
                            >
                                {actionLoading ? "Updating..." : `Mark ${nextStatus}`}
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Card>

            <Grid container spacing={3}>
                {/* Items Breakdown */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Ordered Items ({order.items?.length || 0})
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Line Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(order.items || []).map((item, idx) => (
                                        <TableRow key={item.productId || idx}>
                                            <TableCell sx={{ fontWeight: 600 }}>{item.productName}</TableCell>
                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{item.sku}</TableCell>
                                            <TableCell>₹{Number(item.unitPrice || 0).toLocaleString("en-IN")}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                ₹{Number(item.lineTotal || 0).toLocaleString("en-IN")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{Number(order.subtotal || 0).toLocaleString("en-IN")}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">Tax:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{Number(order.tax || 0).toLocaleString("en-IN")}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total Paid/Billed:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>₹{Number(order.total || 0).toLocaleString("en-IN")}</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>

                {/* Timeline History */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Status History Timeline
                        </Typography>

                        {!order.history || order.history.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No transitions recorded yet.
                            </Typography>
                        ) : (
                            <Box sx={{ pl: 1, borderLeft: "2px solid", borderColor: "primary.light" }}>
                                {order.history.map((h, i) => (
                                    <Box key={i} sx={{ mb: 2.5, pl: 2, position: "relative" }}>
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                left: "-23px",
                                                top: 4,
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                backgroundColor: "primary.main",
                                            }}
                                        />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {h.oldStatus ? `${h.oldStatus} → ` : ""}
                                            <span style={{ color: "#4338CA" }}>{h.newStatus}</span>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3 }}>
                                            {h.changedByName ? `By ${h.changedByName} • ` : ""}
                                            {h.createdAt ? new Date(h.createdAt).toLocaleString() : ""}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
