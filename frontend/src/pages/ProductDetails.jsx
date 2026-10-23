import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCatalogProductById } from "../services/catalogService";
import { addToCart, selectCartItems } from "../store/cartSlice";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    Stack,
    Divider,
    Breadcrumbs,
    Link,
    Snackbar,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ open: false, message: "" });

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");
        getCatalogProductById(id)
            .then((res) => {
                if (!cancelled) setProduct(res.data?.data || null);
            })
            .catch((err) => {
                if (!cancelled) {
                    if (err.response?.status === 404) {
                        setError("Product not found or is currently inactive.");
                    } else {
                        setError(err.response?.data?.message || "Failed to load product details.");
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Box sx={{ maxWidth: 700, mx: "auto", py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || "Product not found."}
                </Alert>
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => navigate("/shop")}
                    variant="outlined"
                >
                    Back to Shop
                </Button>
            </Box>
        );
    }

    const inCart = cartItems.find((item) => item.productId === product.id);
    const currentQtyInCart = inCart ? inCart.quantity : 0;
    const maxCanAdd = Math.max(0, Math.min(product.stock, 1000) - currentQtyInCart);
    const isOutOfStock = product.stock <= 0;

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) {
            setQuantity(1);
        } else {
            setQuantity(Math.min(val, Math.min(product.stock, 1000)));
        }
    };

    const handleAddToCart = () => {
        if (quantity > 0 && maxCanAdd > 0) {
            dispatch(addToCart({ product, qty: quantity }));
            setToast({
                open: true,
                message: `Added ${quantity} × ${product.name} to your cart! 🛍️`,
            });
        }
    };

    return (
        <Box sx={{ maxWidth: 850, mx: "auto", pb: 4 }}>
            {/* Breadcrumbs Navigation */}
            <Breadcrumbs sx={{ mb: 2.5 }}>
                <Link
                    component="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate("/shop")}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                    <ArrowBackRoundedIcon fontSize="small" /> Shop
                </Link>
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            <Card sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
                            {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            SKU: <strong>{product.sku}</strong> • Category: {product.categoryName || "General"}
                        </Typography>
                    </Box>

                    {isOutOfStock ? (
                        <Chip label="Out of Stock" color="error" sx={{ fontWeight: 700 }} />
                    ) : (
                        <Chip
                            label={`In Stock (${product.stock} units)`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    )}
                </Box>

                <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main", my: 2 }}>
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                </Typography>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Description
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                        {product.description || "No specific description available for this item."}
                    </Typography>
                </Box>

                {!isOutOfStock && product.stock <= 5 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Only <strong>{product.stock} items left</strong> in inventory. Order now to secure stock.
                    </Alert>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={quantity}
                        onChange={handleQuantityChange}
                        disabled={isOutOfStock}
                        inputProps={{ min: 1, max: Math.min(product.stock, 1000) }}
                        sx={{ width: 120 }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={isOutOfStock || maxCanAdd <= 0}
                        onClick={handleAddToCart}
                        startIcon={<ShoppingCartRoundedIcon />}
                        sx={{ px: 4, py: 1 }}
                    >
                        {isOutOfStock ? "Unavailable" : maxCanAdd <= 0 ? "Max in Cart" : "Add to Cart"}
                    </Button>
                </Stack>
            </Card>

            {/* Cute Add to Cart Toast Snackbar */}
            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    severity="success"
                    variant="filled"
                    icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => navigate("/cart")}
                            sx={{ fontWeight: 700, textTransform: "none", bgcolor: "rgba(255,255,255,0.2)", px: 1.5, py: 0.2, borderRadius: 1.5 }}
                        >
                            View Cart →
                        </Button>
                    }
                    sx={{
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
                        fontWeight: 600,
                        alignItems: "center",
                        backgroundColor: "#10B981",
                        color: "#FFFFFF",
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
