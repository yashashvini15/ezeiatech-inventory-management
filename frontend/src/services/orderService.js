import api from "./api";

export const createOrder = (data) => api.post("/orders", data);
export const getOrders = (params) => api.get("/orders", { params });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const cancelOrder = (id) => api.post(`/orders/${id}/cancel`);
