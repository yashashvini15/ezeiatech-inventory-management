import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: "60px auto" }}>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" value={form.name}
                       onChange={handleChange} required maxLength={100} />
                <br />
                <input name="email" type="email" placeholder="Email" value={form.email}
                       onChange={handleChange} required />
                <br />
                <input name="password" type="password" placeholder="Password (min 8)" value={form.password}
                       onChange={handleChange} required minLength={8} maxLength={72} />
                <br />
                <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
            </form>
            <p>Already registered? <Link to="/login">Login</Link></p>
        </div>
    );
}