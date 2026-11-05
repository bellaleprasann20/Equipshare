import api from "./api";

export async function fetchMyProjects() {
  const { data } = await api.get("/projects");

  return Array.isArray(data?.projects)
    ? data.projects
    : [];
}
