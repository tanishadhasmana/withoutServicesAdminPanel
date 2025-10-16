import api from "../lib/api";
import type { Role } from "../types/Role";

export type RoleSearchKey = "id" | "role" | "description" | "status";

// -----------------------------
// Permissions API helpers
// -----------------------------
export type PermissionItem = {
  id: number;
  name: string; // e.g., "user_list", "email_edit"
  status?: string | null;
};

// Get all permissions
export const getAllPermissions = async (): Promise<PermissionItem[]> => {
  const res = await api.get("/permissions", { withCredentials: true });
  return res.data; // PermissionItem[]
};

// Get role permissions by roleId
export const getRolePermissions = async (roleId: number): Promise<number[]> => {
  const res = await api.get(`/permissions/${roleId}`, { withCredentials: true });
  return res.data; // number[]
};

// Update role permissions
export const updateRolePermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<void> => {
  const res = await api.post(
    `/permissions/${roleId}`,
    { permissionIds },
    { withCredentials: true }
  );
  return res.data;
};

// -----------------------------
// Roles API helpers (unchanged)
// -----------------------------
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

export const getRoleById = async (id: number): Promise<Role> => {
  const res = await api.get(`/roles/${id}`);
  return res.data;
};

export const addRole = async (roleData: Partial<Role>): Promise<Role> => {
  const res = await api.post("/roles", roleData);
  return res.data;
};

export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
  const res = await api.put(`/roles/${id}`, roleData);
  return res.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};

export const toggleRoleStatus = async (id: number, status: "active" | "inactive"): Promise<void> => {
  await api.patch(`/roles/${id}/status`, { status });
};


