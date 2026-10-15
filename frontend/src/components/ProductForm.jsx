import { useState } from "react";

export default function ProductForm({ initial, categories, suppliers, saving, error, onSave, onCancel }) {
    const isEdit = Boolean(initial);
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        sku: initial?.sku ?? "",
        description: initial?.description ?? "",
        categoryId: initial?.categoryId ?? "",
        supplierId: initial?.supplierId ?? "",
        price: initial?.price ?? "",
        costPrice: initial?.costPrice ?? "",
        stock: initial?.stock ?? 0,
        reorderLevel: initial?.reorderLevel ?? 0,
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        // input se sab string aata hai, backend ko numbers chahiye
        onSave({
            name: form.name.trim(),
            sku: form.sku.trim(),
            description: form.description,
            categoryId: Number(form.categoryId),
            supplierId: Number(form.supplierId),
            price: Number(form.price),
            costPrice: Number(form.costPrice),
            stock: Number(form.stock),
            reorderLevel: Number(form.reorderLevel),
        });
    };

    const field = { display: "block", marginBottom: 10 };

    return (
        <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: 16, marginBottom: 20, maxWidth: 420 }}>
            <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <label style={field}>Name
                <input name="name" value={form.name} onChange={handleChange} required maxLength={150} />
            </label>
            <label style={field}>SKU
                <input name="sku" value={form.sku} onChange={handleChange} required maxLength={50}
                       pattern="[A-Za-z0-9_\-]+" title="Only letters, digits, - and _" />
            </label>
            <label style={field}>Description
                <input name="description" value={form.description} onChange={handleChange} maxLength={1000} />
            </label>
            <label style={field}>Category
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </label>
            <label style={field}>Supplier
                <select name="supplierId" value={form.supplierId} onChange={handleChange} required>
                    <option value="">Select</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </label>
            <label style={field}>Selling price
                <input name="price" type="number" min="0.01" step="0.01" value={form.price}
                       onChange={handleChange} required />
            </label>
            <label style={field}>Cost price
                <input name="costPrice" type="number" min="0" step="0.01" value={form.costPrice}
                       onChange={handleChange} required />
            </label>
            <label style={field}>Stock {isEdit && "(Inventory page se badlega)"}
                <input name="stock" type="number" min="0" step="1" value={form.stock}
                       onChange={handleChange} required disabled={isEdit} />
            </label>
            <label style={field}>Reorder level
                <input name="reorderLevel" type="number" min="0" step="1" value={form.reorderLevel}
                       onChange={handleChange} required />
            </label>

            <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>{" "}
            <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        </form>
    );
}