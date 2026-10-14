import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/authService";

export default function AdminRoute({ children }) {
    const [state, setState] = useState("loading");

    useEffect(() => {
        getMe()
            .then((res) => setState(res.data.data.role === "ADMIN" ? "ok" : "denied"))
            .catch(() => setState("denied"));
    }, []);

    if (state === "loading") return <p>Loading...</p>;
    if (state === "denied") return <Navigate to="/" replace />;
    return children;
}