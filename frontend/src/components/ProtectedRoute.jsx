import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const hasToken = Boolean(localStorage.getItem("token"));
    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
}