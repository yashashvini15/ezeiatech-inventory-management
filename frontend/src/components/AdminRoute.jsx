import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getMe } from "../services/authService";
import { Box, CircularProgress } from "@mui/material";

export default function AdminRoute({ children }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // If user is already loaded in Redux, no delay at all!
    const isAdmin = user?.role === "ADMIN";
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        if (!user) {
            getMe()
                .then((res) => {
                    dispatch(setUser(res.data.data));
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [user, dispatch]);

    // Fast path: if user in Redux is already admin, render instantly without intermediate state!
    if (isAdmin) {
        return children ? children : <Outlet />;
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                <CircularProgress size={28} color="primary" />
            </Box>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}