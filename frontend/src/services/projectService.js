
import api from "./api";

export async function fetchMyProjects() {
  const { data } = await api.get("/projects");

  return Array.isArray(data?.projects)
    ? data.projects
    : [];
}

export async function completeProject(projectId) {
  const { data } = await api.patch(
    `/projects/${projectId}/complete`
  );

  return data;
}
