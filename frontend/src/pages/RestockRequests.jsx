import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getRestockRequests, dismissRestock } from "../services/restockService";
import Pagination from "../components/Pagination";

import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Chip,
    Alert,
    CircularProgress,
} from "@mui/material";

import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

export default function RestockRequests() {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === "ADMIN";

    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState(null);

    const fetchRequests = () => {
        setLoading(true);
        setError("");

        getRestockRequests({
            status: status || undefined,
            page,
            limit: 10,
        })
            .then((res) => {
                const data = res.data?.data || {};
                setRequests(data.content || []);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "Failed to load restock requests");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRequests();
    }, [page, status]);

    const handleDismiss = async (req) => {
        if (!window.confirm(`Are you sure you want to dismiss the restock request for "${req.productName}"?`)) {
            return;
        }

        setActionId(req.id);
        try {
            await dismissRestock(req.id);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to dismiss request");
        } finally {
            setActionId(null);
        }
    };

    const getStatusChip = (st) => {
        switch (st) {
            case "OPEN":
                return <Chip label="OPEN" color="warning" size="small" sx={{ fontWeight: 700 }} />;
            case "FULFILLED":
                return <Chip label="FULFILLED" color="success" size="small" sx={{ fontWeight: 700 }} />;
            case "DISMISSED":
                return <Chip label="DISMISSED" color="default" size="small" sx={{ fontWeight: 700 }} />;
            default:
                return <Chip label={st} size="small" />;
        }
    };

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Restock Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                    Audit inventory restock requests submitted by staff and review actions taken by admins.
                </Typography>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        select
                        label="Status Filter"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        size="small"
                        sx={{ minWidth: 200 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="OPEN">OPEN</MenuItem>
                        <MenuItem value="FULFILLED">FULFILLED</MenuItem>
                        <MenuItem value="DISMISSED">DISMISSED</MenuItem>
                    </TextField>
                </Stack>
            </Card>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : requests.length === 0 ? (
                <Card sx={{ p: 6, textAlign: "center" }}>
                    <NotificationsActiveRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        No restock requests found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        There are currently no restock requests matching the filter criteria.
                    </Typography>
                </Card>
            ) : (
                <Card sx={{ overflow: "hidden" }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Stock / Reorder</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Requested Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Requested By</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Note</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Resolved</TableCell>
                                    {isAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                            {r.productName}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontFamily: "monospace" }}>
                                            {r.sku}
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ color: r.currentStock <= 0 ? "#DC2626" : "#D97706", fontWeight: 700 }}>
                                                {r.currentStock}
                                            </span>{" "}
                                            / {r.reorderLevel}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                                            {r.requestedQuantity}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.primary" }}>
                                            {r.requestedByName || `Staff #${r.requestedById}`}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem", maxWidth: 180 }}>
                                            {r.note || "—"}
                                        </TableCell>
                                        <TableCell>{getStatusChip(r.status)}</TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                            {r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : "—"}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell align="right">
                                                {r.status === "OPEN" ? (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        disabled={actionId === r.id}
                                                        onClick={() => handleDismiss(r)}
                                                        startIcon={<DeleteOutlineRoundedIcon />}
                                                        sx={{ py: 0.3 }}
                                                    >
                                                        Dismiss
                                                    </Button>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
        </Box>
    );
}
