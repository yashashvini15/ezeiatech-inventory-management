import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy loading: page chunks only load when user navigates to them
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const InventoryHistory = lazy(() => import("./pages/InventoryHistory"));

function PageLoader() {
    return (
        <Box sx={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 9999 }}>
            <LinearProgress color="primary" sx={{ height: 3 }} />
        </Box>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Shared persistent layout: Sidebar never unmounts, zero flicker! */}
                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/inventory-history" element={<InventoryHistory />} />

                        <Route element={<AdminRoute />}>
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/suppliers" element={<Suppliers />} />
                        </Route>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}