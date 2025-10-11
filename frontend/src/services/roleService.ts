import api from "../lib/api";
import type { Role } from "../types/Role";

export type RoleSearchKey = "id" | "role" | "description" | "status";

// Fetch roles with optional filtering
export const getRoles = async (column?: RoleSearchKey, value?: string): Promise<Role[]> => {
  const params: Record<string, string> = {};
  if (column && value) {
    params[column] = value;
  }
  const res = await api.get("/roles", { params });
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





// import api from "../lib/api";
// import type { Role } from "../types/Role";

// // ✅ All searchable columns including new metaKeyword
// export type RoleSearchKey = "id" | "role" | "description" | "metaKeyword";

// // ✅ Fetch all or filtered roles
// export const getRoles = async (
//   column?: RoleSearchKey,
//   value?: string
// ): Promise<Role[]> => {
//   const params: Record<string, string> = {};
//   if (column && value) {
//     params[column] = value;
//   }
//   const res = await api.get("/roles", { params });
//   return res.data;
// };

// // ✅ Get role by ID (used in edit form)
// export const getRoleById = async (id: number): Promise<Role> => {
//   const res = await api.get(`/roles/${id}`);
//   return res.data;
// };

// // ✅ Add new role (used in AddRole form)
// export const addRole = async (roleData: Partial<Role>): Promise<Role> => {
//   const res = await api.post("/roles", roleData);
//   return res.data;
// };

// // ✅ Update existing role
// export const updateRole = async (id: number, roleData: Partial<Role>): Promise<Role> => {
//   const res = await api.put(`/roles/${id}`, roleData);
//   return res.data;
// };

// // ✅ Delete role
// export const deleteRole = async (id: number): Promise<void> => {
//   await api.delete(`/roles/${id}`);
// };

// // ✅ Toggle active/inactive status
// export const toggleRoleStatus = async (
//   id: number,
//   status: "active" | "inactive"
// ): Promise<void> => {
//   await api.patch(`/roles/${id}/status`, { status });
// };

