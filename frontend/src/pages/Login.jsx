import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { login, getMe } from "../services/authService";

import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Link,
} from "@mui/material";

import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await login({
                email: form.email.trim(),
                password: form.password,
            });

            const authData = res.data.data; // { token, tokenType, user }

            // Redux store aur localStorage dono update karega
            dispatch(
                setCredentials({
                    token: authData.token,
                    user: authData.user,
                })
            );

            // Fetch profile to verify role and redirect appropriately
            let userRole = authData.user?.role;
            try {
                const meRes = await getMe();
                userRole = meRes.data?.data?.role || userRole;
            } catch {
                // If getMe fails, fallback to userRole
            }

            if (userRole === "CUSTOMER") {
                navigate("/shop");
            } else {
                navigate("/");
            }
        } catch (err) {
            // Backend ApiResponse: { success: false, message: "...", data: null }
            if (!err.response) {
                setError("Cannot connect to backend server. Please verify Spring Boot is running on port 8080.");
            } else {
                setError(err.response.data?.message?.trim() || "Login failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                p: 2.5,
            }}
        >
            <Card
                sx={{
                    maxWidth: 440,
                    width: "100%",
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {/* Brand Header */}
                    <Box sx={{ textAlign: "center", mb: 3.5 }}>
                        <Box
                            sx={{
                                width: 52,
                                height: 52,
                                borderRadius: "14px",
                                backgroundColor: "primary.main",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto",
                                mb: 2,
                                boxShadow: "0 6px 14px rgba(79, 70, 229, 0.3)",
                            }}
                        >
                            <InventoryRoundedIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Enter your credentials to access EzeiaERP
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="e.g. admin@ezeiatech.com"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2.5 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? (
                                                <VisibilityOffOutlinedIcon fontSize="small" />
                                            ) : (
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                            sx={{ py: 1.4, fontWeight: 700, mb: 2.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                        </Button>

                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Don't have an account?{" "}
                                <Link
                                    component={RouterLink}
                                    to="/register"
                                    sx={{ fontWeight: 600, color: "primary.main", textDecoration: "none" }}
                                >
                                    Create Account
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}