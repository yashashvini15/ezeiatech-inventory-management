import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await login(form);
            localStorage.setItem("token", data.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: "60px auto" }}>
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="Email" value={form.email}
                       onChange={handleChange} required />
                <br />
                <input name="password" type="password" placeholder="Password" value={form.password}
                       onChange={handleChange} required />
                <br />
                <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
            </form>
            <p>New user? <Link to="/register">Register</Link></p>
        </div>
    );
}