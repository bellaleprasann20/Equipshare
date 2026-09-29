import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/common/Loader";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Dashboard from "../pages/dashboard/Dashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

import EquipmentCatalog from "../pages/equipment/EquipmentCatalog";
import EquipmentList from "../pages/equipment/EquipmentList";
import EquipmentDetails from "../pages/equipment/EquipmentDetails";
import AddEquipment from "../pages/equipment/AddEquipment";
import EditEquipment from "../pages/equipment/EditEquipment";

import CreateRequirement from "../pages/allocation/CreateRequirement";
import Recommendations from "../pages/allocation/Recommendations";
import AllocationHistory from "../pages/allocation/AllocationHistory";

import Analytics from "../pages/analytics/Analytics";
import Reports from "../pages/analytics/Reports";

import Locations from "../pages/locations/Locations";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/cart/Checkout";
import Orders from "../pages/orders/Orders";

import NotFound from "../pages/NotFound";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Loading..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

// Wraps a page in the login check and the shared layout
function Page({ admin = false, children }) {
  const Guard = admin ? RequireAdmin : RequireAuth;
  return (
    <Guard>
      <DashboardLayout>{children}</DashboardLayout>
    </Guard>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboards */}
      <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
      <Route path="/admin" element={<Page admin><AdminDashboard /></Page>} />

      {/* Equipment: Rent and Buy both use the catalog, switched by ?mode= */}
      <Route path="/equipment" element={<Page><EquipmentCatalog /></Page>} />
      <Route path="/equipment/manage" element={<Page><EquipmentList /></Page>} />
      <Route path="/equipment/add" element={<Page admin><AddEquipment /></Page>} />
      <Route path="/equipment/:id" element={<Page><EquipmentDetails /></Page>} />
      <Route path="/equipment/:id/edit" element={<Page admin><EditEquipment /></Page>} />

      {/* Allocation */}
      <Route path="/allocation" element={<Page><CreateRequirement /></Page>} />
      <Route path="/allocation/recommendations/:requestId" element={<Page><Recommendations /></Page>} />
      <Route path="/allocation/history" element={<Page><AllocationHistory /></Page>} />

      {/* Insights */}
      <Route path="/analytics" element={<Page><Analytics /></Page>} />
      <Route path="/reports" element={<Page admin><Reports /></Page>} />

      {/* Store */}
      <Route path="/locations" element={<Page><Locations /></Page>} />
      <Route path="/cart" element={<Page><Cart /></Page>} />
      <Route path="/checkout" element={<Page><Checkout /></Page>} />
      <Route path="/orders" element={<Page><Orders /></Page>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}