import api from "./api";

// 1. Sales report: GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD (ADMIN only)
export const getSalesReport = (params) => api.get("/reports/sales", { params });

// 2. Low-stock report: GET /api/inventory/low-stock?page=0&limit=10 (0-BASED)
export const getLowStockReport = (params) => api.get("/inventory/low-stock", { params });

// 3. Stock movements report: GET /api/inventory/movements?page=0&limit=10&from=&to= (0-BASED)
export const getMovementsReport = (params) => api.get("/inventory/movements", { params });
