import { useState, useEffect } from "react";
import { createRestock } from "../services/restockService";
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
import SendRoundedIcon from "@mui/icons-material/SendRounded";

export default function RequestRestockDialog({ open, product, onClose, onSuccess }) {
    const [quantity, setQuantity] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && product) {
            const defaultQty = Math.max((Number(product.reorderLevel) || 0) * 2, 10);
            setQuantity(defaultQty);
            setNote("");
            setError("");
        }
    }, [open, product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const qtyNum = parseInt(quantity, 10);

        if (isNaN(qtyNum) || qtyNum < 1 || qtyNum > 100000) {
            setError("Quantity must be between 1 and 100,000");
            return;
        }

        const cleanNote = note.trim();
        if (cleanNote && cleanNote.length > 300) {
            setError("Note cannot exceed 300 characters");
            return;
        }

        if (cleanNote && /[<>&"']/.test(cleanNote)) {
            setError('Note cannot contain characters: < > & " \'');
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            await createRestock({
                productId: product.id,
                quantity: qtyNum,
                note: cleanNote || undefined,
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            if (err.response?.status === 409) {
                setError("Restock already requested for this product");
            } else {
                setError(err.response?.data?.message?.trim() || "Failed to submit restock request");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
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
                            backgroundColor: "rgba(217, 119, 6, 0.1)",
                            color: "warning.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <SendRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Request Restock
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Send replenishment request to Admin
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} disabled={submitting} size="small">
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
                                Stock: <strong>{product.stock}</strong> / Reorder: <strong>{product.reorderLevel}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    <TextField
                        fullWidth
                        label="Requested Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        inputProps={{ min: 1, max: 100000, step: 1 }}
                        placeholder="e.g. 50"
                        sx={{ mb: 2 }}
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Note for Admin (optional)"
                        multiline
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Fast-selling item, urgent restock needed"
                        helperText={'Max 300 characters. No special symbols (< > & " \')'}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 2.5, py: 1.5 }}>
                    <Button variant="outlined" color="inherit" size="small" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="warning" size="small" disabled={submitting} sx={{ minWidth: 100, fontWeight: 600 }}>
                        {submitting ? <CircularProgress size={18} color="inherit" /> : "Send Request"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
