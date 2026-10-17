import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

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
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            // Successfully registered, navigate to login with friendly prompt
            navigate("/login");
        } catch (err) {
            // Backend ApiResponse: { success: false, message: "...", data: null }
            if (!err.response) {
                setError("Cannot connect to backend server. Please verify Spring Boot is running on port 8080.");
            } else {
                setError(err.response.data?.message?.trim() || "Registration failed. Please check your inputs.");
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
                            Create Account
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            Get started with EzeiaERP Inventory Suite
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Yashashvini"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineRoundedIcon color="action" fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2.5 }}
                        />

                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="e.g. user@ezeiatech.com"
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
                            helperText="Minimum 8 characters required"
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                        </Button>

                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Already have an account?{" "}
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    sx={{ fontWeight: 600, color: "primary.main", textDecoration: "none" }}
                                >
                                    Log In
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}