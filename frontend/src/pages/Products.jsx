import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMe } from "../services/authService";
import { getCategories } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";
import { toList } from "../utils/toList";
import ProductForm from "../components/ProductForm";
import { getProducts, createProduct, updateProduct, deactivateProduct, activateProduct } from "../services/productService";

const LIMIT = 10;
const defaultFilters = { categoryId: "", status: "", lowStock: false, sortBy: "createdAt", direction: "desc" };

export default function Products() {
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [data, setData] = useState(null);          // { content, page, totalPages, totalElements }
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState(""); // jo user type kar raha hai
    const [search, setSearch] = useState("");           // jo API ko jaata hai (debounced)
    const [filters, setFilters] = useState(defaultFilters);
    const [reloadKey, setReloadKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const isAdmin = user?.role === "ADMIN";
    const canView = isAdmin || user?.role === "STAFF";

    // 1) Logged-in user ka role
    useEffect(() => {
        getMe()
            .then((res) => setUser(res.data.data))
            .catch((err) => setError(err.response?.data?.message || "Could not load profile"));
    }, []);

    // 2) Dropdowns ka data (role pata chalne ke baad, ek baar)
    useEffect(() => {
        if (!canView) return;
        getCategories().then((res) => setCategories(toList(res))).catch(() => {});
        getSuppliers().then((res) => setSuppliers(toList(res))).catch(() => {});
    }, [canView]);

    // 3) Debounce: type band hone ke 400ms baad hi search API ko jaayega
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // 4) Products fetch: in me se kuch bhi badle to dobara chalega
    useEffect(() => {
        if (!canView) return;
        const params = { page, limit: LIMIT, sortBy: filters.sortBy, direction: filters.direction };
        if (search) params.search = search;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.status) params.status = filters.status;
        if (filters.lowStock) params.lowStock = true;

        let cancelled = false;
        getProducts(params)
            .then((res) => {
                if (cancelled) return;
                setData(res.data.data);
                setError("");
            })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || "Could not load products");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [canView, page, search, filters, reloadKey]);

    const changeFilter = (e) => {
        const { name, type, value, checked } = e.target;
        setFilters((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
        setPage(1);   // filter badla to page 1 se shuru
    };

    const openAdd = () => { setEditing(null); setFormError(""); setFormOpen(true); };
    const openEdit = (p) => { setEditing(p); setFormError(""); setFormOpen(true); };
    const closeForm = () => { setFormOpen(false); setEditing(null); };

    const handleSave = async (payload) => {
        setSaving(true);
        setFormError("");
        try {
            if (editing) {
                await updateProduct(editing.id, payload);   // edit: wahi page par raho
            } else {
                await createProduct(payload);
                // naya product: filters/search/page reset taaki wo page 1 par upar dikhe
                setSearchInput("");
                setSearch("");
                setFilters(defaultFilters);
                setPage(1);
            }
            closeForm();
            setReloadKey((k) => k + 1);
        } catch (err) {
            setFormError(err.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (p) => {
        if (!window.confirm(`Deactivate "${p.name}"?`)) return;
        try {
            await deactivateProduct(p.id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not deactivate");
        }
    };

    const handleActivate = async (p) => {
        try {
            await activateProduct(p.id);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err.response?.data?.message || "Could not activate");
        }
    };

    if (!user) return <p style={{ padding: 20 }}>{error || "Loading..."}</p>;
    if (!canView) {
        return (
            <div style={{ padding: 20 }}>
                <p>Access denied. Only Admin and Staff can view products.</p>
                <Link to="/">Back</Link>
            </div>
        );
    }

    const products = data?.content ?? [];
    const totalPages = Math.max(1, data?.totalPages ?? 1);

    return (
        <div style={{ padding: 20, textAlign: "left" }}>
            <Link to="/">← Home</Link>
            <h2>Products</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <input placeholder="Search name or SKU" value={searchInput}
                       onChange={(e) => setSearchInput(e.target.value)} />
                <select name="categoryId" value={filters.categoryId} onChange={changeFilter}>
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={changeFilter}>
                    <option value="">All status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                <select name="sortBy" value={filters.sortBy} onChange={changeFilter}>
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="stock">Stock</option>
                </select>
                <select name="direction" value={filters.direction} onChange={changeFilter}>
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                </select>
                <label>
                    <input type="checkbox" name="lowStock" checked={filters.lowStock} onChange={changeFilter} /> Low stock only
                </label>
                {isAdmin && <button onClick={openAdd}>+ Add Product</button>}
            </div>

            {isAdmin && formOpen && (
                <ProductForm
                    key={editing?.id ?? "new"}
                    initial={editing}
                    categories={categories}
                    suppliers={suppliers}
                    saving={saving}
                    error={formError}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            )}

            {/* Table */}
            {loading ? <p>Loading...</p> : (
                <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                    <tr>
                        <th>SKU</th><th>Name</th><th>Category</th><th>Supplier</th>
                        <th>Price (₹)</th><th>Stock</th><th>Reorder</th><th>Status</th>
                        {isAdmin && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {products.length === 0 && (
                        <tr><td colSpan={isAdmin ? 9 : 8}>No products found</td></tr>
                    )}
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.sku}</td>
                            <td>{p.name}</td>
                            <td>{p.categoryName}</td>
                            <td>{p.supplierName}</td>
                            <td>{Number(p.price).toLocaleString("en-IN")}</td>
                            <td>
                                {p.stock}{" "}
                                {p.lowStock && (
                                    <span style={{ background: "#ffe0e0", color: "#b00020", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>
                                            LOW STOCK
                                        </span>
                                )}
                            </td>
                            <td>{p.reorderLevel}</td>
                            <td>{p.status}</td>
                            {isAdmin && (
                                <td>
                                    <button onClick={() => openEdit(p)}>Edit</button>{" "}
                                    {p.status === "ACTIVE" ? (
                                        <button onClick={() => handleDeactivate(p)}>Deactivate</button>
                                    ) : (
                                        <button onClick={() => handleActivate(p)}>Activate</button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Pagination */}
            <div style={{ marginTop: 12 }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
                <span style={{ margin: "0 10px" }}>
                    Page {page} of {totalPages} ({data?.totalElements ?? 0} items)
                </span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
        </div>
    );
}