import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    selectCartItems,
    selectCartSubtotal,
    setQuantity,
    removeFromCart,
    clearCart,
} from "../store/cartSlice";

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
    IconButton,
    TextField,
    Divider,
    Stack,
    Grid,
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items = useSelector(selectCartItems);
    const subtotal = useSelector(selectCartSubtotal);

    const handleQtyChange = (productId, newQty, stock) => {
        const val = parseInt(newQty, 10);
        if (isNaN(val) || val < 1) {
            dispatch(setQuantity({ productId, quantity: 1 }));
        } else {
            const capped = Math.min(val, Math.min(stock, 1000));
            dispatch(setQuantity({ productId, quantity: capped }));
        }
    };

    if (items.length === 0) {
        return (
            <Card sx={{ p: 6, textAlign: "center", maxWidth: 600, mx: "auto", mt: 4 }}>
                <ShoppingBagRoundedIcon sx={{ fontSize: 56, color: "text.secondary", mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    Your Cart is Empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You have not added any products to your shopping cart yet.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/shop")}
                    startIcon={<ShoppingBagRoundedIcon />}
                >
                    Browse Catalog
                </Button>
            </Card>
        );
    }

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Shopping Cart ({items.length} unique items)
                </Typography>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => dispatch(clearCart())}
                >
                    Clear Cart
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Cart Items Table */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ overflow: "hidden" }}>
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700, width: 170 }}>Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Line Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => {
                                        const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                                        const maxQty = Math.min(item.stock, 1000);
                                        return (
                                            <TableRow key={item.productId} hover>
                                                <TableCell>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        SKU: {item.sku}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                                </TableCell>

                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <IconButton
                                                            size="small"
                                                            disabled={item.quantity <= 1}
                                                            onClick={() => handleQtyChange(item.productId, item.quantity - 1, item.stock)}
                                                            sx={{ border: "1px solid", borderColor: "divider", p: 0.5 }}
                                                        >
                                                            <RemoveRoundedIcon fontSize="small" />
                                                        </IconButton>

                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQtyChange(item.productId, e.target.value, item.stock)}
                                                            inputProps={{ min: 1, max: maxQty, style: { textAlign: "center", padding: "4px 8px", width: 45 } }}
                                                        />

                                                        <IconButton
                                                            size="small"
                                                            disabled={item.quantity >= maxQty}
                                                            onClick={() => handleQtyChange(item.productId, item.quantity + 1, item.stock)}
                                                            sx={{ border: "1px solid", borderColor: "divider", p: 0.5 }}
                                                        >
                                                            <AddRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                    {item.quantity >= maxQty && (
                                                        <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.5 }}>
                                                            Max stock ({maxQty})
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    ₹{lineTotal.toLocaleString("en-IN")}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => dispatch(removeFromCart(item.productId))}
                                                    >
                                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>

                {/* Subtotal & Checkout Card */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Order Summary
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                                Total Items:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {items.reduce((sum, i) => sum + i.quantity, 0)} items
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Subtotal:
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
                                ₹{subtotal.toLocaleString("en-IN")}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => navigate("/checkout")}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{ py: 1.3, fontWeight: 700 }}
                        >
                            Proceed to Checkout
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            color="inherit"
                            onClick={() => navigate("/shop")}
                            sx={{ mt: 1.5 }}
                        >
                            Continue Shopping
                        </Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
