import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ============================================================
// LAYOUTS & COMMON
// ============================================================
import Loader from "../components/common/Loader";
import AdminLayout from "../components/layout/AdminLayout";
import UserLayout from "../components/layout/UserLayout";

// ============================================================
// PUBLIC PAGES
// ============================================================
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// ============================================================
// DASHBOARD & PROFILE
// ============================================================
import Dashboard from "../pages/dashboard/Dashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import Profile from "../pages/profile/Profile";

// ============================================================
// EQUIPMENT
// ============================================================
import EquipmentCatalog from "../pages/equipment/EquipmentCatalog";
import EquipmentList from "../pages/equipment/EquipmentList";
import EquipmentDetails from "../pages/equipment/EquipmentDetails";
import AddEquipment from "../pages/equipment/AddEquipment";
import EditEquipment from "../pages/equipment/EditEquipment";

// ============================================================
// ALLOCATION
// ============================================================
import CreateRequirement from "../pages/allocation/CreateRequirement";
import Recommendations from "../pages/allocation/Recommendations";
import AllocationHistory from "../pages/allocation/AllocationHistory";

// ============================================================
// ANALYTICS & REPORTS
// ============================================================
import Analytics from "../pages/analytics/Analytics";
import Reports from "../pages/analytics/Reports";

// ============================================================
// USER WORKSPACE
// ============================================================
import Locations from "../pages/locations/Locations";
import Cart from "../pages/cart/Cart";
import Checkout from "../pages/cart/Checkout";
import Orders from "../pages/orders/Orders";

// ============================================================
// ADMIN
// ============================================================
import Approvals from "../pages/admin/Approvals";

// ============================================================
// USER AUTH GUARD
// ============================================================
// Allows authenticated project managers/users into the
// user application.
//
// Admin users are redirected to the admin dashboard.
// Unauthenticated users are redirected to login.
// ============================================================
function RequireUser({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen label="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// ============================================================
// ADMIN AUTH GUARD
// ============================================================
// Allows only admin users into the admin application.
//
// Normal users are redirected to their dashboard.
// Unauthenticated users are redirected to login.
// ============================================================
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen label="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ============================================================
// APPLICATION ROUTES
// ============================================================
export default function AppRoutes() {
  return (
    <Routes>
      {/* ======================================================
          PUBLIC
          ====================================================== */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* ======================================================
          ADMIN APPLICATION
          ====================================================== */}

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        {/* /admin -> /admin/dashboard */}
        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* ----------------------------------------------------
            ADMIN DASHBOARD
            ---------------------------------------------------- */}

        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        {/* ----------------------------------------------------
            ADMIN PROFILE
            ---------------------------------------------------- */}

        <Route
          path="profile"
          element={<Profile />}
        />

        {/* ----------------------------------------------------
            ADMIN EQUIPMENT
            ---------------------------------------------------- */}

        {/* /admin/equipment */}
        <Route
          path="equipment"
          element={<EquipmentList />}
        />

        {/* /admin/equipment/add */}
        <Route
          path="equipment/add"
          element={<AddEquipment />}
        />

        {/* /admin/equipment/:id */}
        <Route
          path="equipment/:id"
          element={<EquipmentDetails />}
        />

        {/* /admin/equipment/:id/edit */}
        <Route
          path="equipment/:id/edit"
          element={<EditEquipment />}
        />

        {/* ----------------------------------------------------
            ADMIN APPROVALS
            ---------------------------------------------------- */}

        {/* /admin/approvals */}
        <Route
          path="approvals"
          element={<Approvals />}
        />

        {/* ----------------------------------------------------
            ADMIN REPORTS
            ---------------------------------------------------- */}

        {/* /admin/reports */}
        <Route
          path="reports"
          element={<Reports />}
        />
      </Route>

      {/* ======================================================
          PROJECT MANAGER / USER APPLICATION
          ======================================================

          IMPORTANT:
          This is intentionally a PATHLESS layout route.

          User pages are therefore wrapped by UserLayout,
          while their actual URLs remain /dashboard, /equipment,
          /allocation, etc.
          ====================================================== */}

      <Route
        element={
          <RequireUser>
            <UserLayout />
          </RequireUser>
        }
      >
        {/* ----------------------------------------------------
            DASHBOARD
            ---------------------------------------------------- */}

        {/* /dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ----------------------------------------------------
            PROFILE
            ---------------------------------------------------- */}

        {/* /profile */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ====================================================
            USER EQUIPMENT
            ==================================================== */}

        {/* /equipment
            ↓
            EquipmentCatalog
        */}
        <Route
          path="/equipment"
          element={<EquipmentCatalog />}
        />

        {/* /equipment/:id
            ↓
            EquipmentDetails
        */}
        <Route
          path="/equipment/:id"
          element={<EquipmentDetails />}
        />

        {/* ====================================================
            SMART ALLOCATION
            ==================================================== */}

        {/* /allocation
            ↓
            Run Smart Allocation
        */}
        <Route
          path="/allocation"
          element={<CreateRequirement />}
        />

        {/* /allocation/recommendations/:requestId
            ↓
            Ranked equipment recommendations
        */}
        <Route
          path="/allocation/recommendations/:requestId"
          element={<Recommendations />}
        />

        {/* /allocation/history
            ↓
            Previous allocation requests
        */}
        <Route
          path="/allocation/history"
          element={<AllocationHistory />}
        />

        {/* ====================================================
            ANALYTICS
            ==================================================== */}

        {/* /analytics */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* ====================================================
            LOCATIONS
            ==================================================== */}

        {/* /locations */}
        <Route
          path="/locations"
          element={<Locations />}
        />

        {/* ====================================================
            CART
            ==================================================== */}

        {/* /cart */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* ====================================================
            CHECKOUT
            ==================================================== */}

        {/* /checkout */}
        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* ====================================================
            ORDERS
            ==================================================== */}

        {/* /orders */}
        <Route
          path="/orders"
          element={<Orders />}
        />
      </Route>

      {/* ======================================================
          404
          ====================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}