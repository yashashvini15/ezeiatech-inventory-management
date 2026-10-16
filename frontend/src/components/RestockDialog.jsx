import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Box,
    IconButton,
    Typography,
    Chip,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";

export default function RestockDialog({ open, product, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setQuantity("");
            setError("");
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qtyNum = Number(quantity);
        if (!qtyNum || qtyNum <= 0) {
            setError("Quantity must be greater than 0");
            return;
        }

        setError("");
        setSaving(true);
        try {
            await onSuccess({
                productId: product.id,
                quantity: qtyNum,
            });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message?.trim() || "Failed to add stock");
        } finally {
            setSaving(false);
        }
    };

    if (!product) return null;

    const currentStock = product.stock ?? 0;
    const addedQty = Number(quantity) || 0;
    const projectedStock = currentStock + addedQty;

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            backgroundColor: "rgba(67, 56, 202, 0.08)",
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <InventoryRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Restock Inventory
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Add stock units (STOCK_IN)
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={saving} size="small">
                    <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 2.5 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: "0.82rem" }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ p: 1.5, mb: 2, borderRadius: 2, backgroundColor: "background.default", border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {product.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <Chip
                                label={`SKU: ${product.sku}`}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 600 }}
                            />
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Current Stock: <strong>{currentStock}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Quantity to Add"
                        type="number"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        inputProps={{ min: 1, max: 1000000, step: 1 }}
                        placeholder="e.g. 50"
                        helperText={addedQty > 0 ? `New total stock will be: ${projectedStock}` : "Enter incoming shipment quantity"}
                        autoFocus
                    />
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                    <Button variant="outlined" color="inherit" size="small" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" size="small" disabled={saving} sx={{ minWidth: 90 }}>
                        {saving ? <CircularProgress size={18} color="inherit" /> : "Confirm Add"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
