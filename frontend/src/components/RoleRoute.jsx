import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getMe } from "../services/authService";

export default function RoleRoute({ roles = [], children }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        let cancelled = false;
        if (!user) {
            getMe()
                .then((res) => {
                    if (!cancelled && res.data?.data) {
                        dispatch(setUser(res.data.data));
                    }
                })
                .catch(() => {})
                .finally(() => {
                    if (!cancelled) setLoading(false);
                });
        }
        return () => {
            cancelled = true;
        };
    }, [user, dispatch]);

    if (user && roles.includes(user.role)) {
        return children ? children : <Outlet />;
    }

    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px" }}>Loading...</div>;
    }

    if (!user || !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
}
