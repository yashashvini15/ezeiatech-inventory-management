import api from "./api";

// 1. Request restock for a low-stock product (STAFF only)
// body: { productId, quantity, note? }
export const createRestock = (data) => api.post("/restock-requests", data);

// 2. Fetch restock requests with status filter & pagination (ADMIN/STAFF)
// params: { status: 'OPEN'|'FULFILLED'|'DISMISSED', page (1-based), limit }
export const getRestockRequests = (params) => api.get("/restock-requests", { params });

// 3. Dismiss a pending restock request (ADMIN only)
export const dismissRestock = (id) => api.patch(`/restock-requests/${id}/dismiss`);
