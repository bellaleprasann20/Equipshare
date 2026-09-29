import api from "./api";

/**
 * Auth-related API calls. Matches routes expected in
 * backend/src/routes/authRoutes.js:
 *   POST /auth/login    { email, password } -> { token, user }
 *   POST /auth/register { name, email, password, role, companyName } -> { token, user }
 *   GET  /auth/me        (JWT required)      -> { user }
 */
export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data; // { token, user }
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data.user;
}
