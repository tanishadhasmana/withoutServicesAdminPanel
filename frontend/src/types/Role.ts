// types/Role.ts

export type RoleStatus = "active" | "inactive";

export interface Role {
  id: number;
  role: string;
  description?: string | null;
  status: RoleStatus;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}
export type RoleFormData = Omit<Role, "id">;