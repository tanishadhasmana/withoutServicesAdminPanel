// src/services/permission.service.ts
import db from "../../connection";

export interface PermissionItem {
  id: number;
  name: string;
  status?: string | null;
}

export const getAllPermissions = async (): Promise<PermissionItem[]> => {
  return db("permissions").select("*").orderBy("id", "asc");
};

export const getRolePermissions = async (roleId: number): Promise<number[]> => {
  const rows = await db("role_permissions")
    .select("permissionId")
    .where({ roleId });
  return rows.map((r) => r.permissionId);
};

export const updateRolePermissions = async (
  roleId: number,
  permissionIds: number[]
): Promise<void> => {
  await db.transaction(async (trx) => {
    await trx("role_permissions").where({ roleId }).del();
    if (permissionIds.length > 0) {
      const data = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
      await trx("role_permissions").insert(data);
    }
  });
};




// src/services/permission.service.ts
// import db from "../../connection";

// export const getAllPermissions = async (): Promise<any[]> => {
//   return db("permissions").select("*").orderBy("id", "asc");
// };

// export const getRolePermissions = async (roleId: number): Promise<number[]> => {
//   const rows = await db("role_permissions")
//     .select("permissionId")
//     .where({ roleId });
//   return rows.map((r) => r.permissionId);
// };

// export const updateRolePermissions = async (
//   roleId: number,
//   permissionIds: number[]
// ): Promise<void> => {
//   await db.transaction(async (trx) => {
//     await trx("role_permissions").where({ roleId }).del();
//     if (permissionIds.length > 0) {
//       const data = permissionIds.map((pid) => ({ roleId, permissionId: pid }));
//       await trx("role_permissions").insert(data);
//     }
//   });
// };
