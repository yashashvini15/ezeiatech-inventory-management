import api from "./api";

// 1. Dashboard statistics: GET /api/dashboard/stats (ADMIN + STAFF)
export const getDashboardStats = () => api.get("/dashboard/stats");
