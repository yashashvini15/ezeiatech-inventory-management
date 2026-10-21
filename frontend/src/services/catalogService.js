import api from "./api";

export const getCatalogProducts = (params) => api.get("/catalog/products", { params });
export const getCatalogProductById = (id) => api.get(`/catalog/products/${id}`);
export const getCategories = () => api.get("/categories");
