import { useEffect, useState } from "react";
import { getCategories, createCategory } from "../services/categoryService";
import { toList } from "../utils/toList";
import DashboardLayout from "../components/layout/DashboardLayout";

import {
    Box,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    InputAdornment,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ name: "", description: "" });
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const load = () => {
        setLoading(true);
        getCategories()
            .then((res) => {
                setCategories(toList(res));
                setError("");
            })
            .catch((err) => {
                setError(err.response?.data?.message?.trim() || "Could not load categories");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpenDialog = () => {
        setForm({ name: "", description: "" });
        setFormError("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (!saving) setDialogOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            await createCategory({
                name: form.name.trim(),
                description: form.description?.trim() || "",
            });
            handleCloseDialog();
            load();
        } catch (err) {
            setFormError(err.response?.data?.message?.trim() || "Something went wrong saving category");
        } finally {
            setSaving(false);
        }
    };

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <DashboardLayout>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 3.5,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
                        Product Categories
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        Structure and organize your inventory items into catalog groups
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                        width: { xs: "100%", sm: "auto" },
                        px: 2.5,
                        py: 1.2,
                        fontWeight: 700,
                    }}
                >
                    Add Category
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Search & Overview Banner */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={8} md={9}>
                    <TextField
                        fullWidth
                        placeholder="Search categories by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.2,
                            px: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: "100%",
                            backgroundColor: "#FFFFFF",
                        }}
                    >
                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            Total Active
                        </Typography>
                        <Chip
                            label={`${categories.length} Groups`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Categories Responsive Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    width: "100%",
                    overflowX: "auto",
                    backgroundColor: "#FFFFFF",
                }}
            >
                <Table sx={{ width: "100%", minWidth: { xs: 500, md: "100%" } }}>
                    <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", width: 80, py: 1.5, px: 2 }}>
                                ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2 }}>
                                CATEGORY NAME
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2 }}>
                                DESCRIPTION
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2, width: 120 }}>
                                STATUS
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} color="primary" />
                                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                                        Loading categories...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <FolderOpenRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        No categories found
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {search ? "No matching categories found." : "Create your first category to get started."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((cat) => (
                                <TableRow key={cat.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell sx={{ py: 1.5, px: 2 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                                            #{cat.id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5, px: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                                                    color: "secondary.main",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <CategoryRoundedIcon fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                {cat.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5, px: 2 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {cat.description || "No description provided"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1.5, px: 2 }}>
                                        <Chip
                                            label="ACTIVE"
                                            size="small"
                                            color="success"
                                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Category Dialog Modal */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
            >
                <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Add Category
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Create a new product grouping
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseDialog} disabled={saving} size="small">
                        <CloseRoundedIcon />
                    </IconButton>
                </DialogTitle>

                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent dividers sx={{ p: 3 }}>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                                {formError}
                            </Alert>
                        )}
                        <TextField
                            fullWidth
                            label="Category Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Electronics, Office Supplies"
                            sx={{ mb: 2.5 }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Optional category description..."
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={handleCloseDialog} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ minWidth: 100 }}>
                            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Category"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </DashboardLayout>
    );
}