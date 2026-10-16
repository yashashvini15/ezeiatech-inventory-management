import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Button,
    Alert,
    CircularProgress,
    Box,
    IconButton,
    Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function ProductForm({
    open,
    initial,
    categories = [],
    suppliers = [],
    saving = false,
    error = "",
    onSave,
    onCancel,
}) {
    const isEdit = Boolean(initial);

    const [form, setForm] = useState({
        name: "",
        sku: "",
        description: "",
        categoryId: "",
        supplierId: "",
        price: "",
        costPrice: "",
        stock: 0,
        reorderLevel: 0,
    });

    useEffect(() => {
        if (initial) {
            setForm({
                name: initial.name ?? "",
                sku: initial.sku ?? "",
                description: initial.description ?? "",
                categoryId: initial.categoryId ?? "",
                supplierId: initial.supplierId ?? "",
                price: initial.price ?? "",
                costPrice: initial.costPrice ?? "",
                stock: initial.stock ?? 0,
                reorderLevel: initial.reorderLevel ?? 0,
            });
        } else {
            setForm({
                name: "",
                sku: "",
                description: "",
                categoryId: "",
                supplierId: "",
                price: "",
                costPrice: "",
                stock: 0,
                reorderLevel: 0,
            });
        }
    }, [initial, open]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: form.name.trim(),
            sku: form.sku.trim(),
            description: form.description,
            categoryId: Number(form.categoryId),
            supplierId: Number(form.supplierId),
            price: Number(form.price),
            costPrice: Number(form.costPrice),
            stock: Number(form.stock),
            reorderLevel: Number(form.reorderLevel),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={saving ? undefined : onCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3.5, p: 1 },
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {isEdit ? "Update inventory specifications & pricing" : "Create a new catalog item"}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onCancel}
                    disabled={saving}
                    size="small"
                    sx={{ color: "text.secondary" }}
                >
                    <CloseRoundedIcon />
                </IconButton>
            </DialogTitle>

            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Product Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                inputProps={{ maxLength: 150 }}
                                placeholder="e.g. Wireless Ergonomic Mouse"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="SKU Code"
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                required
                                inputProps={{ maxLength: 50, pattern: "[A-Za-z0-9_\\-]+" }}
                                helperText="Letters, digits, -, _"
                                placeholder="e.g. PROD-101"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Category"
                                name="categoryId"
                                value={form.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="">
                                    <em>Select Category</em>
                                </MenuItem>
                                {categories.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Supplier"
                                name="supplierId"
                                value={form.supplierId}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="">
                                    <em>Select Supplier</em>
                                </MenuItem>
                                {suppliers.map((s) => (
                                    <MenuItem key={s.id} value={s.id}>
                                        {s.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                inputProps={{ maxLength: 1000 }}
                                placeholder="Short item description or specs..."
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Selling Price (₹)"
                                name="price"
                                type="number"
                                inputProps={{ min: "0.01", step: "0.01" }}
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Cost Price (₹)"
                                name="costPrice"
                                type="number"
                                inputProps={{ min: "0", step: "0.01" }}
                                value={form.costPrice}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={isEdit ? "Initial Stock (Locked)" : "Initial Stock"}
                                name="stock"
                                type="number"
                                inputProps={{ min: "0", step: "1" }}
                                value={form.stock}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                                helperText={isEdit ? "Stock locked in edit mode" : "Starting quantity"}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Reorder Level Threshold"
                                name="reorderLevel"
                                type="number"
                                inputProps={{ min: "0", step: "1" }}
                                value={form.reorderLevel}
                                onChange={handleChange}
                                required
                                helperText="Alert triggered below this level"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button variant="outlined" color="inherit" onClick={onCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ minWidth: 100 }}>
                        {saving ? <CircularProgress size={20} color="inherit" /> : isEdit ? "Save Changes" : "Create Product"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}