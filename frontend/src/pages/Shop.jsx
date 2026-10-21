import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, selectCartItems } from "../store/cartSlice";
import { getCatalogProducts, getCategories } from "../services/catalogService";
import Pagination from "../components/Pagination";

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    Chip,
    InputAdornment,
    Alert,
    CircularProgress,
    Stack,
    Divider,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

export default function Shop() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems);

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [sortOption, setSortOption] = useState("createdAt:desc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getCategories()
            .then((res) => {
                if (!cancelled) setCategories(res.data?.data || []);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const [sortBy, direction] = sortOption.split(":");
        const timer = setTimeout(
            () => {
                setLoading(true);
                setError("");
                getCatalogProducts({
                    page,
                    limit: 12,
                    search: search.trim() || undefined,
                    categoryId: categoryId || undefined,
                    sortBy,
                    direction,
                })
                    .then((res) => {
                        if (cancelled) return;
                        const data = res.data?.data || {};
                        setProducts(data.content || []);
                        setTotalPages(data.totalPages || 1);
                        setTotalElements(data.totalElements || 0);
                    })
                    .catch((err) => {
                        if (!cancelled) {
                            setError(err.response?.data?.message || "Failed to load products");
                        }
                    })
                    .finally(() => {
                        if (!cancelled) setLoading(false);
                    });
            },
            search ? 400 : 0
        );

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [search, categoryId, sortOption, page]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryChange = (e) => {
        setCategoryId(e.target.value);
        setPage(1);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setPage(1);
    };

    return (
        <Box sx={{ pb: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                        Product Catalog
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3 }}>
                        Browse active stock, add items to cart, and place customer orders.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartRoundedIcon />}
                    onClick={() => navigate("/cart")}
                >
                    Go to Cart
                </Button>
            </Box>

            {/* Filter Card */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <TextField
                        placeholder="Search product name or SKU..."
                        value={search}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ flex: 1, minWidth: 220 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        select
                        label="Category"
                        value={categoryId}
                        onChange={handleCategoryChange}
                        size="small"
                        sx={{ minWidth: 180 }}
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
                        label="Sort By"
                        value={sortOption}
                        onChange={handleSortChange}
                        size="small"
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="createdAt:desc">Newest First</MenuItem>
                        <MenuItem value="createdAt:asc">Oldest First</MenuItem>
                        <MenuItem value="price:asc">Price: Low to High</MenuItem>
                        <MenuItem value="price:desc">Price: High to Low</MenuItem>
                        <MenuItem value="name:asc">Name: A-Z</MenuItem>
                        <MenuItem value="name:desc">Name: Z-A</MenuItem>
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
            ) : products.length === 0 ? (
                <Card sx={{ p: 6, textAlign: "center" }}>
                    <StorefrontRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Try clearing search terms or selecting another category.
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={2.5}>
                    {products.map((p) => {
                        const inCart = cartItems.find((item) => item.productId === p.id);
                        const qtyInCart = inCart ? inCart.quantity : 0;
                        const isOutOfStock = p.stock <= 0;
                        const isMaxInCart = qtyInCart >= Math.min(p.stock, 1000);

                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        p: 2,
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "text.primary",
                                                    lineHeight: 1.3,
                                                    cursor: "pointer",
                                                    "&:hover": { color: "primary.main" },
                                                }}
                                                onClick={() => navigate(`/shop/${p.id}`)}
                                            >
                                                {p.name}
                                            </Typography>
                                            {isOutOfStock ? (
                                                <Chip label="Out of Stock" color="error" size="small" />
                                            ) : p.stock <= 5 ? (
                                                <Chip label={`Only ${p.stock} left`} color="warning" size="small" />
                                            ) : null}
                                        </Box>

                                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
                                            SKU: {p.sku} • {p.categoryName || "General"}
                                        </Typography>

                                        <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main", my: 1 }}>
                                            ₹{Number(p.price || 0).toLocaleString("en-IN")}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                disabled={isOutOfStock || isMaxInCart}
                                                onClick={() => dispatch(addToCart({ product: p, qty: 1 }))}
                                                startIcon={<ShoppingCartRoundedIcon sx={{ fontSize: 16 }} />}
                                            >
                                                {isOutOfStock ? "Out of Stock" : isMaxInCart ? "Max in Cart" : "Add to Cart"}
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                color="inherit"
                                                size="small"
                                                onClick={() => navigate(`/shop/${p.id}`)}
                                                sx={{ minWidth: 40, px: 1.5 }}
                                            >
                                                <ArrowForwardRoundedIcon fontSize="small" />
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={setPage} />
        </Box>
    );
}
