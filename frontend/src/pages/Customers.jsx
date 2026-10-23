import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Skeleton,
    Tooltip,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { getCustomers, updateCustomerStatus } from "../services/customerService";
import Pagination from "../components/Pagination";

export default function Customers() {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === "ADMIN";

    // State
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Pagination (page is 1-based as per backend API)
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Confirmation Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Toast Snackbar
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

    // 400ms Debounce on Search Input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput.trim());
            setPage(1); // Reset to page 1 on search change
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Fetch customers
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit,
            };
            if (debouncedSearch) {
                params.search = debouncedSearch;
            }
            if (statusFilter !== "ALL") {
                params.status = statusFilter;
            }

            const res = await getCustomers(params);
            const data = res.data?.data;
            if (data) {
                setCustomers(data.content || []);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else {
                setCustomers([]);
            }
        } catch (err) {
            console.error("Customers fetch error:", err);
            const backendMsg = err.response?.data?.message || "Failed to load customers list.";
            setError(backendMsg);
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Dialog Handlers
    const handleOpenConfirm = (customer) => {
        setSelectedCustomer(customer);
        setDialogOpen(true);
    };

    const handleCloseConfirm = () => {
        if (actionLoading) return;
        setDialogOpen(false);
        setSelectedCustomer(null);
    };

    const handleConfirmStatusChange = async () => {
        if (!selectedCustomer) return;
        const newStatus = selectedCustomer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        setActionLoading(true);
        try {
            await updateCustomerStatus(selectedCustomer.id, newStatus);
            setToast({
                open: true,
                message: `Customer ${newStatus === "ACTIVE" ? "unblocked" : "blocked"} successfully!`,
                severity: "success",
            });
            handleCloseConfirm();
            fetchCustomers();
        } catch (err) {
            console.error("Update customer status error:", err);
            const backendMsg = err.response?.data?.message || "Failed to update customer status.";
            setToast({
                open: true,
                message: backendMsg,
                severity: "error",
            });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return String(dateStr);
        }
    };

    return (
        <Box sx={{ pb: 4 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 3,
                }}
            >
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PeopleRoundedIcon color="primary" sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                            Customer Management
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        Search, monitor, and regulate customer accounts ({totalElements} registered)
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={fetchCustomers}
                    disabled={loading}
                    sx={{ borderColor: "divider", fontWeight: 600 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Filters Bar */}
            <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 2,
                            alignItems: { xs: "stretch", sm: "center" },
                        }}
                    >
                        {/* Search field with 400ms debounce */}
                        <TextField
                            size="small"
                            placeholder="Search by customer name or email..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            inputProps={{ maxLength: 100 }}
                            sx={{ flex: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Status Filter */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="customer-status-filter-label">Account Status</InputLabel>
                            <Select
                                labelId="customer-status-filter-label"
                                value={statusFilter}
                                label="Account Status"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <MenuItem value="ALL">All Statuses</MenuItem>
                                <MenuItem value="ACTIVE">Active Only</MenuItem>
                                <MenuItem value="INACTIVE">Blocked Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Customers Table */}
            <Card sx={{ borderRadius: 2 }}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, overflowX: "auto" }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>NAME</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>EMAIL</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>ROLE</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>JOINED</TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>STATUS</TableCell>
                                {isAdmin && (
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.82rem", py: 1.5 }}>
                                        ACTIONS
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={180} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={70} /></TableCell>
                                        <TableCell><Skeleton variant="text" width={90} /></TableCell>
                                        <TableCell><Skeleton variant="rounded" width={65} height={24} /></TableCell>
                                        {isAdmin && <TableCell align="right"><Skeleton variant="rounded" width={75} height={28} sx={{ ml: "auto" }} /></TableCell>}
                                    </TableRow>
                                ))
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} sx={{ py: 6, textAlign: "center" }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                            No customers found
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.disabled", mt: 0.5 }}>
                                            Try adjusting your search criteria or status filter.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                customers.map((c) => {
                                    const isBlocked = c.status === "INACTIVE";
                                    return (
                                        <TableRow
                                            key={c.id}
                                            hover
                                            sx={{
                                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.015)" },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                                {c.name}
                                            </TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>
                                                {c.email}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={c.role || "CUSTOMER"}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: "0.72rem", height: 22, fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                {formatDate(c.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={isBlocked ? "Blocked" : "Active"}
                                                    color={isBlocked ? "error" : "success"}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: "0.72rem",
                                                        height: 22,
                                                    }}
                                                />
                                            </TableCell>

                                            {isAdmin && (
                                                <TableCell align="right">
                                                    {isBlocked ? (
                                                        <Tooltip title="Restore customer access">
                                                            <Button
                                                                variant="outlined"
                                                                color="success"
                                                                size="small"
                                                                startIcon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                                                                onClick={() => handleOpenConfirm(c)}
                                                                sx={{
                                                                    fontSize: "0.75rem",
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                    py: 0.4,
                                                                    px: 1.2,
                                                                }}
                                                            >
                                                                Unblock
                                                            </Button>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Block customer account">
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="small"
                                                                startIcon={<BlockRoundedIcon sx={{ fontSize: 16 }} />}
                                                                onClick={() => handleOpenConfirm(c)}
                                                                sx={{
                                                                    fontSize: "0.75rem",
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                    py: 0.4,
                                                                    px: 1.2,
                                                                }}
                                                            >
                                                                Block
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination (Existing reusable component) */}
                <Box sx={{ p: 2 }}>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onChange={(newPage) => setPage(newPage)}
                    />
                </Box>
            </Card>

            {/* Confirmation Dialog (Admin only) */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseConfirm}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1, maxWidth: 460 },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: selectedCustomer?.status === "ACTIVE" ? "error.main" : "success.main" }}>
                    {selectedCustomer?.status === "ACTIVE" ? "Block Customer Account?" : "Unblock Customer Account?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "text.primary", fontSize: "0.92rem" }}>
                        {selectedCustomer?.status === "ACTIVE" ? (
                            <>
                                Are you sure you want to block <strong>{selectedCustomer?.name}</strong> (
                                {selectedCustomer?.email})? Once blocked, they will be logged out and unable to log in
                                or place orders.
                            </>
                        ) : (
                            <>
                                Are you sure you want to restore access for <strong>{selectedCustomer?.name}</strong> (
                                {selectedCustomer?.email})? They will be able to log in and use the store immediately.
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseConfirm} color="inherit" disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmStatusChange}
                        variant="contained"
                        color={selectedCustomer?.status === "ACTIVE" ? "error" : "success"}
                        disabled={actionLoading}
                        startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ fontWeight: 600 }}
                    >
                        {actionLoading ? "Processing..." : selectedCustomer?.status === "ACTIVE" ? "Confirm Block" : "Confirm Unblock"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toast Snackbar */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    severity={toast.severity}
                    variant="filled"
                    sx={{ width: "100%", fontWeight: 600, borderRadius: 2 }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
