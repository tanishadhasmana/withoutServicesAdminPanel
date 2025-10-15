import api from "../lib/api";
import type { Role } from "../types/Role";

export type RoleSearchKey = "id" | "role" | "description" | "status";

// for pagination
export const getRoles = async (
  column?: RoleSearchKey,
  value?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  roles: Role[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  const params: Record<string, string | number> = { page, limit };
  if (column && value) params[column] = value;

  const res = await api.get("/roles", { params, withCredentials: true });
  return res.data;
};




// Get single role
export const getRoleById = async (id: number): Promise<Role> => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

// Create role
export const addRole = async (roleData: Partial<Role>): Promise<Role> => {
  const res = await api.post("/roles", roleData);
  return res.data;
};

// Update role
export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
  const res = await api.put(`/roles/${id}`, roleData);
  return res.data;
};

// Delete role
export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};

// Toggle status
export const toggleRoleStatus = async (id: number, status: "active" | "inactive"): Promise<void> => {
  await api.patch(`/roles/${id}/status`, { status });
};

