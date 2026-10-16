import { useEffect, useState } from "react";
import { getSuppliers, createSupplier, updateSupplier } from "../services/supplierService";
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
    Tooltip,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const load = () => {
        setLoading(true);
        getSuppliers()
            .then((res) => {
                setSuppliers(toList(res));
                setError("");
            })
            .catch((err) => {
                setError(err.response?.data?.message?.trim() || "Could not load suppliers");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setDialogOpen(true);
    };

    const handleOpenEdit = (s) => {
        setEditingId(s.id);
        setForm({
            name: s.name,
            email: s.email,
            phone: s.phone || "",
            address: s.address || "",
        });
        setFormError("");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (!saving) {
            setDialogOpen(false);
            setEditingId(null);
            setForm(emptyForm);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            if (editingId) {
                await updateSupplier(editingId, form);
            } else {
                await createSupplier(form);
            }
            handleCloseDialog();
            load();
        } catch (err) {
            setFormError(err.response?.data?.message?.trim() || "Something went wrong saving supplier");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (s) => {
        setError("");
        try {
            await updateSupplier(s.id, {
                name: s.name,
                email: s.email,
                phone: s.phone || "",
                address: s.address || "",
                status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            });
            load();
        } catch (err) {
            setError(err.response?.data?.message?.trim() || "Something went wrong changing status");
        }
    };

    const filtered = suppliers.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            (s.phone && s.phone.includes(search))
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
                        Supplier Directory
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        Manage vendor relationships, supply points, and contact channels
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenAdd}
                    sx={{
                        width: { xs: "100%", sm: "auto" },
                        px: 2.5,
                        py: 1.2,
                        fontWeight: 700,
                    }}
                >
                    Add Supplier
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
                        placeholder="Search suppliers by name, email, or phone..."
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
                            Total Suppliers
                        </Typography>
                        <Chip
                            label={`${suppliers.length} Vendors`}
                            color="info"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Suppliers Responsive Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    overflowX: "auto",
                }}
            >
                <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                VENDOR NAME
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                CONTACT EMAIL
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                PHONE
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                ADDRESS
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                STATUS
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem" }}>
                                ACTIONS
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} color="primary" />
                                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                                        Loading supplier directory...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <BusinessRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        No suppliers found
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {search ? "No matching vendors found." : "Add your first vendor to start inventory sourcing."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((s) => (
                                <TableRow key={s.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                    color: "info.main",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <LocalShippingRoundedIcon fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                {s.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {s.email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            {s.phone || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                maxWidth: 200,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {s.address || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={s.status}
                                            size="small"
                                            color={s.status === "ACTIVE" ? "success" : "default"}
                                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                                            <Tooltip title="Edit Supplier">
                                                <IconButton size="small" onClick={() => handleOpenEdit(s)} color="primary">
                                                    <EditRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {s.status === "ACTIVE" ? (
                                                <Tooltip title="Deactivate Supplier">
                                                    <IconButton size="small" onClick={() => toggleStatus(s)} color="error">
                                                        <BlockRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Activate Supplier">
                                                    <IconButton size="small" onClick={() => toggleStatus(s)} color="success">
                                                        <CheckCircleOutlineRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add / Edit Supplier Dialog Modal */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
            >
                <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {editingId ? "Edit Supplier" : "Add New Supplier"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {editingId ? "Update supplier vendor information" : "Register a new external supply partner"}
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Supplier Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Acme Logistics Pvt Ltd"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="contact@acme.com"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+91 9876543210"
                                    inputProps={{ pattern: "[0-9+\\- ]{7,15}" }}
                                    helperText="7-15 digits, only numbers and +"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Address / Location"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="e.g. Sector 62, Noida"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={handleCloseDialog} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ minWidth: 100 }}>
                            {saving ? <CircularProgress size={20} color="inherit" /> : editingId ? "Update Supplier" : "Save Supplier"}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </DashboardLayout>
    );
}