import api from "./api";

// 1. List customers: GET /api/customers?search=&status=&page=&limit= (ADMIN + STAFF)
export const getCustomers = (params) => api.get("/customers", { params });

// 2. Update customer status: PATCH /api/customers/{id}/status (ADMIN only)
// body: { status: "ACTIVE" | "INACTIVE" }
export const updateCustomerStatus = (id, status) => api.patch(`/customers/${id}/status`, { status });
