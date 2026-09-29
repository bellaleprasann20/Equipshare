import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

/**
 * Root app component. Router lives here; auth lives in main.jsx
 * (AuthProvider wraps <App /> one level up, since AppRoutes
 * needs useAuth() to exist inside the Router already).
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
