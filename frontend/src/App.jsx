import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy loading: page chunks only load when user navigates to them
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const InventoryHistory = lazy(() => import("./pages/InventoryHistory"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const ManageOrders = lazy(() => import("./pages/ManageOrders"));
const RestockRequests = lazy(() => import("./pages/RestockRequests"));

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

                        {/* Customer Only Routes */}
                        <Route element={<RoleRoute roles={["CUSTOMER"]} />}>
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/shop/:id" element={<ProductDetails />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/orders" element={<MyOrders />} />
                            <Route path="/orders/:id" element={<OrderDetails />} />
                        </Route>

                        {/* Inventory & Order Management for Admin and Staff */}
                        <Route path="/products" element={<Products />} />
                        <Route path="/inventory-history" element={<InventoryHistory />} />

                        <Route element={<RoleRoute roles={["ADMIN", "STAFF"]} />}>
                            <Route path="/manage/orders" element={<ManageOrders />} />
                            <Route path="/manage/orders/:id" element={<OrderDetails />} />
                            <Route path="/restock-requests" element={<RestockRequests />} />
                        </Route>

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