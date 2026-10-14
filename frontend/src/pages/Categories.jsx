import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, createCategory } from "../services/categoryService";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: "", description: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const load = () =>
        getCategories()
            .then((res) => setCategories(res.data.data))
            .catch((err) => setError(err.response?.data?.message || "Could not load categories"));

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createCategory(form);
            setForm({ name: "", description: "" });
            await load();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <Link to="/">← Home</Link>
            <h2>Categories</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                <input name="name" placeholder="Category name" value={form.name}
                       onChange={handleChange} required maxLength={100} />
                <input name="description" placeholder="Description (optional)" value={form.description}
                       onChange={handleChange} maxLength={500} />
                <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Add"}</button>
            </form>

            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr><th>ID</th><th>Name</th><th>Description</th><th>Status</th></tr>
                </thead>
                <tbody>
                {categories.length === 0 && (
                    <tr><td colSpan="4">No categories yet</td></tr>
                )}
                {categories.map((c) => (
                    <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>{c.description}</td>
                        <td>{c.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}