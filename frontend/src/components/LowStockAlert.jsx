import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLowStock, addStock } from "../services/inventoryService";
import { createRestock, getRestockRequests, dismissRestock } from "../services/restockService";

import {
    Box,
    Alert,
    AlertTitle,
    Typography,
    Button,
    IconButton,
    Chip,
    Stack,
    TextField,
    CircularProgress,
    Tooltip,
} from "@mui/material";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function LowStockAlert() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const role = user?.role;

    // CUSTOMER check: render absolutely nothing, do not even touch APIs
    if (!user || role === "CUSTOMER") {
        return null;
    }

    const isStaff = role === "STAFF";
    const isAdmin = role === "ADMIN";

    const [dismissed, setDismissed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lowStockData, setLowStockData] = useState({ content: [], totalElements: 0 });
    const [openRequests, setOpenRequests] = useState([]); // Array of OPEN requests
    const [requestedProductIds, setRequestedProductIds] = useState(new Set());

    // Staff: inline request form state per product { [productId]: { quantity, note, error, success } }
    const [requestForms, setRequestForms] = useState({});
    const [submittingId, setSubmittingId] = useState(null);

    // Admin: inline restock form state per request { [requestId]: { quantity, error, saving } }
    const [restockForms, setRestockForms] = useState({});

    const cancelledRef = useRef(false);

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);

        try {
            if (isStaff) {
                // STAFF: Fetch low stock (limit 5) + OPEN requests to identify already-requested products
                const [lowStockRes, requestsRes] = await Promise.all([
                    getLowStock(5),
                    getRestockRequests({ status: "OPEN", page: 1, limit: 100 }),
                ]);

                if (cancelledRef.current) return;

                const lowStock = lowStockRes.data?.data || { content: [], totalElements: 0 };
                const reqData = requestsRes.data?.data?.content || [];

                setLowStockData(lowStock);
                setOpenRequests(reqData);

                const ids = new Set(reqData.map((r) => r.productId));
                setRequestedProductIds(ids);
            } else if (isAdmin) {
                // ADMIN: Fetch OPEN requests (limit 5) + low stock count check
                const [requestsRes, lowStockRes] = await Promise.all([
                    getRestockRequests({ status: "OPEN", page: 1, limit: 5 }),
                    getLowStock(1),
                ]);

                if (cancelledRef.current) return;

                const reqData = requestsRes.data?.data?.content || [];
                const lowStock = lowStockRes.data?.data || { content: [], totalElements: 0 };

                setOpenRequests(reqData);
                setLowStockData(lowStock);
            }
        } catch {
            // "show nothing while loading or on error"
        } finally {
            if (!cancelledRef.current) {
                setLoading(false);
            }
        }
    }, [isStaff, isAdmin]);

    useEffect(() => {
        cancelledRef.current = false;
        fetchData();

        // Auto refetch every 60 seconds
        const timer = setInterval(() => {
            fetchData(true);
        }, 60000);

        return () => {
            cancelledRef.current = true;
            clearInterval(timer);
        };
    }, [fetchData]);

    if (dismissed || loading) {
        return null;
    }

    // --- STAFF ACTIONS ---
    const handleOpenStaffForm = (item) => {
        const defaultQty = Math.max((Number(item.reorderLevel) || 0) * 2, 10);
        setRequestForms((prev) => ({
            ...prev,
            [item.id]: {
                quantity: defaultQty,
                note: "",
                error: "",
                success: false,
                open: true,
            },
        }));
    };

    const handleCloseStaffForm = (productId) => {
        setRequestForms((prev) => ({
            ...prev,
            [productId]: { ...prev[productId], open: false },
        }));
    };

    const handleSendStaffRequest = async (item) => {
        const form = requestForms[item.id];
        const qtyNum = parseInt(form.quantity, 10);

        if (isNaN(qtyNum) || qtyNum < 1 || qtyNum > 100000) {
            setRequestForms((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], error: "Quantity must be between 1 and 100,000" },
            }));
            return;
        }

        // Validate note: max 300, no < > & " '
        const note = (form.note || "").trim();
        if (note && note.length > 300) {
            setRequestForms((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], error: "Note cannot exceed 300 characters" },
            }));
            return;
        }

        if (note && /[<>&"']/.test(note)) {
            setRequestForms((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], error: 'Note cannot contain characters: < > & " \'' },
            }));
            return;
        }

        setSubmittingId(item.id);
        setRequestForms((prev) => ({
            ...prev,
            [item.id]: { ...prev[item.id], error: "" },
        }));

        try {
            await createRestock({
                productId: item.id,
                quantity: qtyNum,
                note: note || undefined,
            });

            setRequestForms((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], success: true, open: false },
            }));
            setRequestedProductIds((prev) => new Set([...prev, item.id]));
        } catch (err) {
            let msg = err.response?.data?.message || "Failed to create request";
            if (err.response?.status === 409) {
                msg = "Already requested";
                setRequestedProductIds((prev) => new Set([...prev, item.id]));
            }
            setRequestForms((prev) => ({
                ...prev,
                [item.id]: { ...prev[item.id], error: msg },
            }));
        } finally {
            setSubmittingId(null);
        }
    };

    // --- ADMIN ACTIONS ---
    const handleOpenAdminRestock = (req) => {
        setRestockForms((prev) => ({
            ...prev,
            [req.id]: {
                quantity: req.requestedQuantity,
                open: true,
                error: "",
                saving: false,
            },
        }));
    };

    const handleConfirmAdminRestock = async (req) => {
        const form = restockForms[req.id];
        const qtyNum = parseInt(form.quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            setRestockForms((prev) => ({
                ...prev,
                [req.id]: { ...prev[req.id], error: "Quantity must be greater than 0" },
            }));
            return;
        }

        setRestockForms((prev) => ({
            ...prev,
            [req.id]: { ...prev[req.id], saving: true, error: "" },
        }));

        try {
            // Existing addStock contract: { productId, quantity }
            await addStock({
                productId: req.productId,
                quantity: qtyNum,
            });
            // Reload list immediately
            fetchData(true);
        } catch (err) {
            setRestockForms((prev) => ({
                ...prev,
                [req.id]: {
                    ...prev[req.id],
                    saving: false,
                    error: err.response?.data?.message || "Failed to restock",
                },
            }));
        }
    };

    const handleAdminDismiss = async (req) => {
        if (!window.confirm(`Are you sure you want to dismiss the restock request for "${req.productName}"?`)) {
            return;
        }

        try {
            await dismissRestock(req.id);
            fetchData(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to dismiss request");
        }
    };

    // ==========================================
    // RENDER FOR STAFF
    // ==========================================
    if (isStaff) {
        if (lowStockData.totalElements === 0) {
            return null;
        }

        return (
            <Alert
                severity="warning"
                variant="standard"
                icon={<WarningAmberRoundedIcon sx={{ fontSize: 24 }} />}
                sx={{
                    mb: 3,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "warning.light",
                    backgroundColor: "rgba(217, 119, 6, 0.08)",
                    alignItems: "flex-start",
                }}
                action={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Refresh stock">
                            <IconButton size="small" onClick={() => fetchData(false)}>
                                <RefreshRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss banner">
                            <IconButton size="small" onClick={() => setDismissed(true)}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                }
            >
                <AlertTitle sx={{ fontWeight: 700, fontSize: "0.95rem", color: "warning.dark", mb: 1 }}>
                    ⚠ {lowStockData.totalElements} product(s) low on stock
                </AlertTitle>

                <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {lowStockData.content.map((item) => {
                        const isOutOfStock = (Number(item.stock) || 0) <= 0;
                        const hasOpenRequest = requestedProductIds.has(item.id);
                        const form = requestForms[item.id] || {};

                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid rgba(226, 232, 240, 0.8)",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            SKU: <strong>{item.sku}</strong> • Stock: <strong>{item.stock}</strong> / Reorder level: <strong>{item.reorderLevel}</strong>
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {isOutOfStock ? (
                                            <Chip label="OUT OF STOCK" color="error" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
                                        ) : (
                                            <Chip label="LOW" color="warning" size="small" sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }} />
                                        )}

                                        {form.success ? (
                                            <Chip
                                                icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                                                label="Request sent ✓"
                                                color="success"
                                                size="small"
                                                sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                            />
                                        ) : hasOpenRequest ? (
                                            <Button size="small" variant="outlined" color="inherit" disabled sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.3 }}>
                                                Requested ✓
                                            </Button>
                                        ) : !form.open ? (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="warning"
                                                onClick={() => handleOpenStaffForm(item)}
                                                startIcon={<SendRoundedIcon sx={{ fontSize: 15 }} />}
                                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", py: 0.4 }}
                                            >
                                                Request restock
                                            </Button>
                                        ) : null}
                                    </Stack>
                                </Box>

                                {/* Inline Request Form */}
                                {form.open && (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed rgba(226, 232, 240, 0.9)" }}>
                                        {form.error && (
                                            <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                                                {form.error}
                                            </Typography>
                                        )}
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                label="Quantity"
                                                value={form.quantity}
                                                onChange={(e) =>
                                                    setRequestForms((prev) => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], quantity: e.target.value },
                                                    }))
                                                }
                                                sx={{ width: 130 }}
                                                inputProps={{ min: 1, max: 100000 }}
                                            />
                                            <TextField
                                                size="small"
                                                label="Note (optional)"
                                                placeholder="Max 300 characters"
                                                value={form.note}
                                                onChange={(e) =>
                                                    setRequestForms((prev) => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], note: e.target.value },
                                                    }))
                                                }
                                                sx={{ flex: 1, minWidth: 200 }}
                                            />
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={submittingId === item.id}
                                                    onClick={() => handleSendStaffRequest(item)}
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {submittingId === item.id ? <CircularProgress size={16} color="inherit" /> : "Send"}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="inherit"
                                                    disabled={submittingId === item.id}
                                                    onClick={() => handleCloseStaffForm(item.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            </Alert>
        );
    }

    // ==========================================
    // RENDER FOR ADMIN
    // ==========================================
    if (isAdmin) {
        // If there are NO pending OPEN requests, check if low-stock products exist
        if (openRequests.length === 0) {
            if (lowStockData.totalElements > 0) {
                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1.5,
                            mb: 3,
                            borderRadius: 2,
                            backgroundColor: "rgba(100, 116, 139, 0.08)",
                            border: "1px solid rgba(226, 232, 240, 0.9)",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            ℹ {lowStockData.totalElements} product(s) are low on stock
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                size="small"
                                color="primary"
                                onClick={() => navigate("/products?lowStock=true")}
                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem" }}
                            >
                                View Low-Stock Products →
                            </Button>
                            <IconButton size="small" onClick={() => setDismissed(true)}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>
                );
            }
            return null;
        }

        // Pending OPEN requests exist: Red/Orange Banner
        return (
            <Alert
                severity="error"
                variant="standard"
                icon={<NotificationsActiveRoundedIcon sx={{ fontSize: 24 }} />}
                sx={{
                    mb: 3,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "error.light",
                    backgroundColor: "rgba(220, 38, 38, 0.06)",
                    alignItems: "flex-start",
                }}
                action={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title="Refresh requests">
                            <IconButton size="small" onClick={() => fetchData(false)}>
                                <RefreshRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss banner">
                            <IconButton size="small" onClick={() => setDismissed(true)}>
                                <CloseRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                }
            >
                <AlertTitle sx={{ fontWeight: 700, fontSize: "0.95rem", color: "error.dark", mb: 1 }}>
                    🔔 {openRequests.length} restock request(s) pending
                </AlertTitle>

                <Stack spacing={1.5} sx={{ mt: 1 }}>
                    {openRequests.map((req) => {
                        const form = restockForms[req.id] || {};

                        return (
                            <Box
                                key={req.id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid rgba(226, 232, 240, 0.8)",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                            {req.productName}{" "}
                                            <Typography component="span" variant="caption" sx={{ color: "text.secondary" }}>
                                                (SKU: {req.sku})
                                            </Typography>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.3 }}>
                                            Stock: <strong>{req.currentStock}</strong> / Reorder: <strong>{req.reorderLevel}</strong> • Requested:{" "}
                                            <strong style={{ color: "#4338CA" }}>{req.requestedQuantity}</strong> units by{" "}
                                            <strong>{req.requestedByName || "Staff"}</strong>
                                        </Typography>
                                        {req.note && (
                                            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", display: "block" }}>
                                                Note: "{req.note}"
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                                            {req.createdAt ? new Date(req.createdAt).toLocaleString() : ""}
                                        </Typography>
                                    </Box>

                                    {!form.open && (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                startIcon={<AddBusinessRoundedIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => handleOpenAdminRestock(req)}
                                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", py: 0.4 }}
                                            >
                                                Restock now
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleAdminDismiss(req)}
                                                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", py: 0.4 }}
                                            >
                                                Dismiss
                                            </Button>
                                        </Stack>
                                    )}
                                </Box>

                                {/* Admin Inline Restock Form */}
                                {form.open && (
                                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px dashed rgba(226, 232, 240, 0.9)" }}>
                                        {form.error && (
                                            <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
                                                {form.error}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <TextField
                                                type="number"
                                                size="small"
                                                label="Quantity to Add"
                                                value={form.quantity}
                                                onChange={(e) =>
                                                    setRestockForms((prev) => ({
                                                        ...prev,
                                                        [req.id]: { ...prev[req.id], quantity: e.target.value },
                                                    }))
                                                }
                                                sx={{ width: 160 }}
                                                inputProps={{ min: 1 }}
                                            />
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                disabled={form.saving}
                                                onClick={() => handleConfirmAdminRestock(req)}
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {form.saving ? <CircularProgress size={16} color="inherit" /> : "Confirm Add"}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="inherit"
                                                disabled={form.saving}
                                                onClick={() =>
                                                    setRestockForms((prev) => ({
                                                        ...prev,
                                                        [req.id]: { ...prev[req.id], open: false },
                                                    }))
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            </Alert>
        );
    }

    return null;
}
