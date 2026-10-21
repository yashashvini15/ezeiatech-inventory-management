import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getMe } from "../services/authService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";
import { toList } from "../utils/toList";
import ProductForm from "../components/ProductForm";
import RestockDialog from "../components/RestockDialog";
import RequestRestockDialog from "../components/RequestRestockDialog";
import LowStockAlert from "../components/LowStockAlert";
import { addStock } from "../services/inventoryService";
import {
    getProducts,
    createProduct,
    updateProduct,
    deactivateProduct,
    activateProduct,
} from "../services/productService";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Pagination,
    InputAdornment,
    Alert,
    CircularProgress,
    Stack,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AddBusinessRoundedIcon from "@mui/icons-material/AddBusinessRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const LIMIT = 10;
const defaultFilters = {
    categoryId: "",
    status: "",
    lowStock: false,
    sortBy: "createdAt",
    direction: "desc",
};

export default function Products() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [searchParams] = useSearchParams();
    const initialLowStock = searchParams.get("lowStock") === "true";

    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [data, setData] = useState(null); // { content, page, totalPages, totalElements }
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        ...defaultFilters,
        lowStock: initialLowStock,
    });
    const [reloadKey, setReloadKey] = useState(0);

    // Sync lowStock param if navigated while already on Products page
    useEffect(() => {
        const queryLowStock = searchParams.get("lowStock") === "true";
        if (queryLowStock) {
            setFilters((prev) => ({ ...prev, lowStock: true }));
        }
    }, [searchParams]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Restock dialog state
    const [restockProduct, setRestockProduct] = useState(null);
    const [staffRequestProduct, setStaffRequestProduct] = useState(null);

    const role = user?.role || "CUSTOMER";
    const isAdmin = role === "ADMIN";
    const isStaff = role === "STAFF";
    const canView = isAdmin || isStaff;

    // 1. Load user role & sync Redux if needed
    useEffect(() => {
        if (!user) {
            getMe()
                .then((res) => dispatch(setUser(res.data.data)))
                .catch((err) => setError(err.response?.data?.message || "Could not load user profile"));
        }
    }, [user, dispatch]);

    // 2. Load Categories and Suppliers for dropdowns
    useEffect(() => {
        if (!canView) return;
        getCategories()
            .then((res) => setCategories(toList(res)))
            .catch(() => {});
        getSuppliers()
            .then((res) => setSuppliers(toList(res)))
            .catch(() => {});
    }, [canView]);

    // 3. Debounce search input (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // 4. Fetch Products whenever filters, search, or page changes
    useEffect(() => {
        if (!canView) return;
        setLoading(true);
        const params = { page, limit: LIMIT, sortBy: filters.sortBy, direction: filters.direction };
        if (search) params.search = search;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.status) params.status = filters.status;
        if (filters.lowStock) params.lowStock = true;

        let cancelled = false;
        getProducts(params)
            .then((res) => {
                if (cancelled) return;
                setData(res.data.data);
                setError("");
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || "Could not load products");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [canView, page, search, filters, reloadKey]);

    const changeFilter = (e) => {
        const { name, type, value, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setPage(1);
    };

    const openAdd = () => {
        setEditing(null);
        setFormError("");
        setFormOpen(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setFormError("");
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
    };

    const handleSave = async (payload) => {
        setSaving(true);
        setFormError("");
        try {
            if (editing) {
                await updateProduct(editing.id, payload);
            } else {
                await createProduct(payload);
                setSearchInput("");
                setSearch("");
                setFilters(defaultFilters);
                setPage(1);
            }
            closeForm();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Something went wrong saving product");
        } finally {
            setSaving(false);
        }
    };

    const handleRestockSave = async (payload) => {
        await addStock(payload);
        setReloadKey((k) => k + 1);
    };

    const handleDeactivate = async (p) => {
        if (!window.confirm(`Are you sure you want to deactivate "${p.name}"?`)) return;
        try {
            await deactivateProduct(p.id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not deactivate product");
        }
    };

    const handleActivate = async (p) => {
        try {
            await activateProduct(p.id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not activate product");
        }
    };

    if (!canView) {
        return (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                Access Denied. Only Admin and Staff are authorized to view and manage inventory products.
            </Alert>
        );
    }

    const products = data?.content ?? [];
    const totalPages = Math.max(1, data?.totalPages ?? 1);

    return (
        <Box sx={{ pb: 3 }}>
            {/* Low-Stock and Restock-Request Banner */}
            <LowStockAlert />

            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    mb: 2.5,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Inventory Products
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3, fontSize: "0.85rem" }}>
                        Manage product stock, categories, SKUs, and pricing
                    </Typography>
                </Box>
                {isAdmin && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                        onClick={openAdd}
                        sx={{ px: 2, py: 0.8, fontWeight: 600, fontSize: "0.82rem" }}
                    >
                        Add Product
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filters Bar (Materio & NexaERP Style) */}
            <Card sx={{ mb: 3, p: 0.5 }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", md: "center" }}
                        flexWrap="wrap"
                    >
                        <TextField
                            placeholder="Search by name or SKU..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 260, flex: { md: 1 } }}
                        />

                        <TextField
                            select
                            label="Category"
                            name="categoryId"
                            value={filters.categoryId}
                            onChange={changeFilter}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Status"
                            name="status"
                            value={filters.status}
                            onChange={changeFilter}
                            sx={{ minWidth: 140 }}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </TextField>

                        <TextField
                            select
                            label="Sort By"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={changeFilter}
                            sx={{ minWidth: 140 }}
                        >
                            <MenuItem value="createdAt">Newest</MenuItem>
                            <MenuItem value="price">Price</MenuItem>
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="stock">Stock</MenuItem>
                        </TextField>

                        <FormControlLabel
                            control={
                                <Switch
                                    name="lowStock"
                                    checked={filters.lowStock}
                                    onChange={changeFilter}
                                    color="warning"
                                />
                            }
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <WarningAmberRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Low Stock
                                    </Typography>
                                </Box>
                            }
                            sx={{ ml: { md: 1 } }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Products Data Table */}
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
                <Table sx={{ width: "100%", minWidth: { xs: 650, md: "100%" } }}>
                    <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2, width: 110 }}>SKU</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2 }}>PRODUCT NAME</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 1.5 }}>CATEGORY</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 1.5 }}>SUPPLIER</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 1.5 }}>
                                PRICE (₹)
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 1.5 }}>
                                STOCK
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 1.5 }}>
                                STATUS
                            </TableCell>
                            {canView && (
                                <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.82rem", py: 1.5, px: 2, width: isAdmin ? 140 : 120 }}>
                                    ACTIONS
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} color="primary" />
                                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5 }}>
                                        Loading inventory catalog...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Inventory2OutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1, opacity: 0.5 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        No products found
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        Try adjusting your search criteria or filters.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((p) => {
                                const isLow = p.lowStock || p.stock <= p.reorderLevel;
                                return (
                                    <TableRow
                                        key={p.id}
                                        hover
                                        sx={{
                                            "&:last-child td, &:last-child th": { border: 0 },
                                            transition: "background-color 0.15s ease",
                                        }}
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: "monospace",
                                                    fontWeight: 700,
                                                    color: "text.secondary",
                                                    backgroundColor: "rgba(0,0,0,0.04)",
                                                    px: 1,
                                                    py: 0.3,
                                                    borderRadius: 1.5,
                                                    display: "inline-block",
                                                }}
                                            >
                                                {p.sku}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                {p.name}
                                            </Typography>
                                            {p.description && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "text.secondary",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {p.description}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={p.categoryName || "Uncategorized"}
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderColor: "divider", fontWeight: 600, fontSize: "0.75rem" }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                                {p.supplierName || "—"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                ₹{Number(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                    {p.stock}
                                                </Typography>
                                                {isLow && (
                                                    <Chip
                                                        label="LOW STOCK"
                                                        size="small"
                                                        color="error"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: "0.62rem",
                                                            fontWeight: 800,
                                                            mt: 0.4,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Chip
                                                label={p.status}
                                                size="small"
                                                color={p.status === "ACTIVE" ? "success" : "default"}
                                                sx={{
                                                    height: 22,
                                                    fontSize: "0.72rem",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </TableCell>

                                        {canView && (
                                            <TableCell align="right">
                                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                                                    {/* Admin Controls */}
                                                    {isAdmin && (
                                                        <>
                                                            <Tooltip title="Restock / Add Stock">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => setRestockProduct(p)}
                                                                    color="secondary"
                                                                >
                                                                    <AddBusinessRoundedIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Edit Product">
                                                                <IconButton size="small" onClick={() => openEdit(p)} color="primary">
                                                                    <EditRoundedIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {p.status === "ACTIVE" ? (
                                                                <Tooltip title="Deactivate Product">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleDeactivate(p)}
                                                                        color="error"
                                                                    >
                                                                        <BlockRoundedIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip title="Activate Product">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleActivate(p)}
                                                                        color="success"
                                                                    >
                                                                        <CheckCircleOutlineRoundedIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Staff Controls: Request Restock to Admin */}
                                                    {isStaff && (
                                                        <Tooltip title={isLow ? "Request Restock from Admin" : "Stock is currently healthy"}>
                                                            <span>
                                                                <Button
                                                                    size="small"
                                                                    variant={isLow ? "contained" : "outlined"}
                                                                    color={isLow ? "warning" : "inherit"}
                                                                    startIcon={<SendRoundedIcon sx={{ fontSize: 14 }} />}
                                                                    onClick={() => setStaffRequestProduct(p)}
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        fontWeight: 600,
                                                                        fontSize: "0.74rem",
                                                                        py: 0.3,
                                                                        px: 1,
                                                                    }}
                                                                >
                                                                    Request
                                                                </Button>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Showing Page {page} of {totalPages} ({data?.totalElements ?? 0} total products)
                </Typography>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                />
            </Box>

            {/* Product Form Dialog Modal */}
            {isAdmin && (
                <ProductForm
                    open={formOpen}
                    initial={editing}
                    categories={categories}
                    suppliers={suppliers}
                    saving={saving}
                    error={formError}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            )}

            {/* Restock Inventory Dialog Modal (ADMIN) */}
            {isAdmin && (
                <RestockDialog
                    open={Boolean(restockProduct)}
                    product={restockProduct}
                    onClose={() => setRestockProduct(null)}
                    onSuccess={handleRestockSave}
                />
            )}

            {/* Request Restock Dialog Modal (STAFF) */}
            {isStaff && (
                <RequestRestockDialog
                    open={Boolean(staffRequestProduct)}
                    product={staffRequestProduct}
                    onClose={() => setStaffRequestProduct(null)}
                    onSuccess={() => setReloadKey((k) => k + 1)}
                />
            )}
        </Box>
    );
}