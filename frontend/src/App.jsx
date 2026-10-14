import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><AdminRoute><Categories /></AdminRoute></ProtectedRoute>} />
                <Route path="/suppliers" element={<ProtectedRoute><AdminRoute><Suppliers /></AdminRoute></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}