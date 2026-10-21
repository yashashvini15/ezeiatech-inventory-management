import api from "./api";

// 1. Add / Restock inventory for a product: POST /inventory/add
export const addStock = (data) => api.post("/inventory/add", data);

// 2. Fetch inventory movement history (audit log): GET /inventory/movements
export const getInventoryMovements = (params) => api.get("/inventory/movements", { params });

// 3. Fetch low-stock critical items: GET /inventory/low-stock
export const getLowStockProducts = (params) => api.get("/inventory/low-stock", { params });

// 4. Low-stock helper with 0-based page default for alerts
export const getLowStock = (limit = 5) => api.get("/inventory/low-stock", { params: { page: 0, limit } });
