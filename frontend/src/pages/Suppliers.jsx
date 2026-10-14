import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuppliers, createSupplier, updateSupplier } from "../services/supplierService";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const load = () =>
        getSuppliers()
            .then((res) => setSuppliers(res.data.data))
            .catch((err) => setError(err.response?.data?.message || "Could not load suppliers"));

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (editingId) {
                await updateSupplier(editingId, form);
            } else {
                await createSupplier(form);
            }
            setForm(emptyForm);
            setEditingId(null);
            await load();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (s) => {
        setEditingId(s.id);
        setForm({ name: s.name, email: s.email, phone: s.phone || "", address: s.address || "" });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const toggleStatus = async (s) => {
        setError("");
        try {
            await updateSupplier(s.id, {
                name: s.name,
                email: s.email,
                phone: s.phone || "",
                address: s.address || "",
                status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            });
            await load();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: "40px auto" }}>
            <Link to="/">← Home</Link>
            <h2>Suppliers</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                <input name="name" placeholder="Name" value={form.name}
                       onChange={handleChange} required maxLength={100} />
                <input name="email" type="email" placeholder="Email" value={form.email}
                       onChange={handleChange} required maxLength={150} />
                <input name="phone" placeholder="Phone (7-15 digits)" value={form.phone}
                       onChange={handleChange} pattern="[0-9+\- ]{7,15}"
                       title="7-15 digits, only 0-9, + , - and space" />
                <input name="address" placeholder="Address" value={form.address}
                       onChange={handleChange} maxLength={300} />
                <button type="submit" disabled={loading}>
                    {loading ? "Please wait..." : editingId ? "Update" : "Add"}
                </button>
                {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
            </form>

            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                {suppliers.length === 0 && (
                    <tr><td colSpan="7">No suppliers yet</td></tr>
                )}
                {suppliers.map((s) => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                        <td>{s.address}</td>
                        <td>{s.status}</td>
                        <td>
                            <button onClick={() => startEdit(s)}>Edit</button>{" "}
                            <button onClick={() => toggleStatus(s)}>
                                {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}