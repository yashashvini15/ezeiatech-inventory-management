import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout } from "../store/slices/authSlice";
import { getMe } from "../services/authService";
import { Box, CircularProgress } from "@mui/material";

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const { token, user } = useSelector((state) => state.auth);
    const hasToken = Boolean(token || localStorage.getItem("token"));
    const [loading, setLoading] = useState(hasToken && !user);

    useEffect(() => {
        if (hasToken && !user) {
            getMe()
                .then((res) => {
                    if (res.data?.data) {
                        dispatch(setUser(res.data.data));
                    }
                })
                .catch((err) => {
                    console.error("Auth check failed in ProtectedRoute", err);
                    if (err.response?.status === 401) {
                        dispatch(logout());
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [hasToken, user, dispatch]);

    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress size={32} color="primary" />
            </Box>
        );
    }

    return children ? children : <Outlet />;
}