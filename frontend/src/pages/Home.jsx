import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMe } from "../services/authService";

export default function Home() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getMe()
            .then((res) => setUser(res.data.data))
            .catch((err) => setError(err.response?.data?.message || "Could not load profile"));
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={{ maxWidth: 480, margin: "60px auto" }}>
            <h2>Home</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {user && (
                <div>
                    <p>Welcome, {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>
                    <p>Joined: {new Date(user.createdAt).toLocaleString()}</p>
                    {user.role === "ADMIN" && (
                        <p>
                            <Link to="/categories">Categories</Link> | <Link to="/suppliers">Suppliers</Link>
                        </p>
                    )}
                </div>
            )}

            {import.meta.env.DEV && (
                <details style={{ marginTop: 16 }}>
                    <summary>Dev only: token</summary>
                    <code style={{ wordBreak: "break-all" }}>{localStorage.getItem("token")}</code>
                </details>
            )}

            <br />
            <button onClick={logout}>Logout</button>
        </div>
    );
}