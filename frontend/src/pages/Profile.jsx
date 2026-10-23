import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Divider,
    Grid,
    Alert,
    Skeleton,
    Paper,
    Button,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import { useNavigate } from "react-router-dom";

import { getMe } from "../services/authService";
import { setUser } from "../store/slices/authSlice";

export default function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: cachedUser } = useSelector((state) => state.auth);

    const [user, setProfileUser] = useState(cachedUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMe();
            const data = res.data?.data;
            if (data) {
                setProfileUser(data);
                dispatch(setUser(data));
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError(err.response?.data?.message || "Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return String(dateStr);
        }
    };

    return (
        <Box sx={{ pb: 4, maxWidth: 800, mx: "auto" }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PersonRoundedIcon color="primary" sx={{ fontSize: 30 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                            My Profile
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        Manage your account information and preferences
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={loadProfile}
                    disabled={loading}
                    sx={{ borderColor: "divider" }}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Profile Overview Card */}
            <Card sx={{ borderRadius: 3, mb: 3, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                {/* Banner Gradient */}
                <Box
                    sx={{
                        height: 110,
                        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                        position: "relative",
                    }}
                />

                <CardContent sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, pt: 0, position: "relative" }}>
                    {/* Avatar Overlap */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 2,
                            mt: -6,
                            mb: 2.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 88,
                                height: 88,
                                bgcolor: "primary.main",
                                fontSize: "2.2rem",
                                fontWeight: 700,
                                border: "4px solid #FFFFFF",
                                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </Avatar>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip
                                icon={<VerifiedUserRoundedIcon sx={{ fontSize: 16 }} />}
                                label={user?.status === "INACTIVE" ? "Blocked" : "Active"}
                                color={user?.status === "INACTIVE" ? "error" : "success"}
                                size="small"
                                sx={{ fontWeight: 700, px: 0.5 }}
                            />
                            <Chip
                                label={user?.role || "CUSTOMER"}
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700 }}
                            />
                        </Box>
                    </Box>

                    {/* Name & Basic Info */}
                    {loading ? (
                        <>
                            <Skeleton variant="text" width="40%" height={36} />
                            <Skeleton variant="text" width="30%" height={20} />
                        </>
                    ) : (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                                {user?.name || "Customer User"}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.2 }}>
                                Valued customer account
                            </Typography>
                        </Box>
                    )}

                    <Divider sx={{ my: 2.5 }} />

                    {/* Information Grid */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    borderColor: "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.2,
                                        borderRadius: 2,
                                        backgroundColor: "rgba(79, 70, 229, 0.08)",
                                        color: "primary.main",
                                    }}
                                >
                                    <PersonRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                        Full Name
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                                        {user?.name || "—"}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    borderColor: "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.2,
                                        borderRadius: 2,
                                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                                        color: "success.main",
                                    }}
                                >
                                    <EmailRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                                        {user?.email || "—"}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    borderColor: "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.2,
                                        borderRadius: 2,
                                        backgroundColor: "rgba(245, 158, 11, 0.08)",
                                        color: "warning.main",
                                    }}
                                >
                                    <CalendarMonthRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                        Member Since
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                                        {formatDate(user?.createdAt)}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    borderColor: "divider",
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 1.2,
                                        borderRadius: 2,
                                        backgroundColor: "rgba(14, 165, 233, 0.08)",
                                        color: "info.main",
                                    }}
                                >
                                    <SecurityRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                        Account Role
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                                        {user?.role || "CUSTOMER"}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Quick navigation actions */}
                    <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ShoppingBagRoundedIcon />}
                            onClick={() => navigate("/shop")}
                            sx={{ fontWeight: 600 }}
                        >
                            Browse Store
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate("/orders")}
                            sx={{ borderColor: "divider", fontWeight: 600 }}
                        >
                            View Order History
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
