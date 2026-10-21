import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectCartSubtotal, clearCart } from "../store/cartSlice";
import { createOrder } from "../services/orderService";

import {
    Box,
    Card,
    Typography,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";

import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export default function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartSubtotal);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (items.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    const estimatedTax = Math.round(subtotal * 0.18);
    const estimatedTotal = subtotal + estimatedTax;

    const handlePlaceOrder = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError("");

        const payload = {
            items: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
            })),
        };

        try {
            const res = await createOrder(payload);
            const newOrder = res.data?.data;
            dispatch(clearCart());
            navigate(`/orders/${newOrder.id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to place order. Please check availability.");
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", pb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate("/cart")}
                    color="inherit"
                >
                    Back to Cart
                </Button>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Checkout Order
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                            Review Cart Items ({items.length})
                        </Typography>
                        <List disablePadding>
                            {items.map((item, idx) => (
                                <ListItem
                                    key={item.productId}
                                    disableGutters
                                    divider={idx < items.length - 1}
                                    sx={{ py: 1.2 }}
                                >
                                    <ListItemText
                                        primary={item.name}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }}
                                        secondary={`SKU: ${item.sku} • Qty: ${item.quantity}`}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        ₹{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString("en-IN")}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Price Breakdown
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Subtotal:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Tax (18%, estimated):
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ₹{estimatedTax.toLocaleString("en-IN")}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                Total (estimated):
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                                ₹{estimatedTotal.toLocaleString("en-IN")}
                            </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
                            * Final amount is calculated by the server
                        </Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            size="large"
                            disabled={submitting}
                            onClick={handlePlaceOrder}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartCheckoutRoundedIcon />}
                            sx={{ py: 1.4, fontWeight: 700 }}
                        >
                            {submitting ? "Placing Order..." : "Confirm & Place Order"}
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
