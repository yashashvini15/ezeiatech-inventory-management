import api from "./api";

export const getProducts = (params) => api.get("/products", { params });
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deactivateProduct = (id) => api.delete(`/products/${id}`);
export const activateProduct = (id) => api.patch(`/products/${id}/activate`);