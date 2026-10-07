import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Core Components
import Loader from "../components/common/Loader";
import AdminLayout from "../components/layout/AdminLayout";
import UserLayout from "../components/layout/UserLayout";

// Public Pages
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// Dashboard Pages
import Dashboard from "../pages/dashboard/Dashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import Profile from "../pages/profile/Profile";

// Equipment Pages
import EquipmentCatalog from "../pages/equipment/EquipmentCatalog";
import EquipmentList from "../pages/equipment/EquipmentList";
import EquipmentDetails from "../pages/equipment/EquipmentDetails";
import AddEquipment from "../pages/equipment/AddEquipment";
import EditEquipment from "../pages/equipment/EditEquipment";

// Allocation Pages
import CreateRequirement from "../pages/allocation/CreateRequirement";
import Recommendations from "../pages/allocation/Recommendations";
import AllocationHistory from "../pages/allocation/AllocationHistory";

// Insights & Store Pages
import Analytics from "../pages/analytics/Analytics";
import Reports from "../pages/analytics/Reports";
import Locations from "../pages/locations/Locations";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/cart/Checkout";
import Orders from "../pages/orders/Orders";
import Approvals from "../pages/admin/Approvals";

/**
 * STRICT AUTH GUARDS
 */
function RequireUser({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* =========================================
          PUBLIC ROUTES
          ========================================= */}
      {/* The Landing page correctly claims the root path */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* =========================================
          ADMIN APP SHELL
          ========================================= */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<Profile />} />
        
        <Route path="equipment" element={<EquipmentList />} />
        <Route path="equipment/add" element={<AddEquipment />} />
        <Route path="equipment/:id" element={<EquipmentDetails />} />
        <Route path="equipment/:id/edit" element={<EditEquipment />} />
        
        <Route path="approvals" element={<Approvals />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* =========================================
          PROJECT MANAGER APP SHELL
          ========================================= */}
      {/* 
          CRITICAL FIX: Removed path="/" from here. 
          This is now a "pathless layout route" that protects all the children below it 
          without hijacking the Landing page.
      */}
      <Route element={<RequireUser><UserLayout /></RequireUser>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/equipment" element={<EquipmentCatalog />} />
        <Route path="/equipment/:id" element={<EquipmentDetails />} />
        
        <Route path="/allocation" element={<CreateRequirement />} />
        <Route path="/allocation/recommendations/:requestId" element={<Recommendations />} />
        <Route path="/allocation/history" element={<AllocationHistory />} />
        
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}