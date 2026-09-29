import axios from "axios";

/**
 * Central axios instance. All service files (authService,
 * equipmentService, allocationService, analyticsService) import
 * this instead of calling axios directly, so the base URL and
 * auth header are handled in exactly one place.
 *
 * Requires VITE_API_BASE_URL in your .env, e.g.:
 *   VITE_API_BASE_URL=http://localhost:5000/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("equipshare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever returns 401 (expired/invalid token),
// clear local auth state so the app doesn't get stuck in a
// broken "logged in but every request fails" state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("equipshare_token");
      localStorage.removeItem("equipshare_user");
    }
    return Promise.reject(error);
  }
);

export default api;
