import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook used throughout the app to read auth state and act on
 * it — this is what Navbar, Sidebar, Login, Register, and the
 * role-gated pages (AddEquipment, EditEquipment, AdminDashboard)
 * all call.
 *
 * Usage:
 *   const { user, login, register, logout, loading } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>. Wrap your app in main.jsx.");
  }
  return context;
}
