// src/services/role.service.ts
import db from "../../connection";

export const getRolesService = async (filters?: { id?: string; role?: string; description?: string; status?: string }) => {
  const { id, role, description, status } = filters || {};
  let query = db("roles")
    .select("id", "role", "description", "status", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .orderBy("id", "asc");

  if (id) query = query.where("id", "like", `%${id}%`);
  if (role) query = query.where("role", "like", `%${role}%`);
  if (description) query = query.where("description", "like", `%${description}%`);
  if (status) query = query.where("status", status);

  const rows = await query;
  return rows;
};

export const getRoleByIdService = async (id: number) => {
  return await db("roles")
    .select("id", "role", "description", "status", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .where({ id })
    .first();
};

export const createRoleService = async (data: any) => {
  const insertData = {
    role: data.role,
    description: data.description ?? null,
    status: data.status || "active",
    createdBy: data.createdBy ?? null,
  };

  const inserted = await db("roles").insert(insertData);
  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getRoleByIdService(Number(id));
  return created;
};

export const updateRoleService = async (id: number, data: any) => {
  const updateData = {
    role: data.role,
    description: data.description,
    status: data.status,
    updatedBy: data.updatedBy ?? null,
    updatedAt: db.fn.now(),
  };

  await db("roles").where({ id }).update(updateData);
  const updated = await getRoleByIdService(id);
  return updated;
};

export const deleteRoleService = async (id: number) => {
  await db("roles").where({ id }).update({ status: "inactive", deletedAt: db.fn.now(), updatedAt: db.fn.now() });
  return { message: "Role deleted (soft)" };
};

export const toggleRoleStatusService = async (id: number, status: string) => {
  await db("roles").where({ id }).update({ status, updatedAt: db.fn.now() });
  const updated = await getRoleByIdService(id);
  return updated;
};




// import db from "../../connection";

// export const getRolesService = async () => {
//   return db("roles").select("*");
// };

// export const getRoleByIdService = async (id: number) => {
//   return db("roles").where({ id }).first();
// };

// export const createRoleService = async (data: any) => {
//   const [id] = await db("roles").insert(data);
//   return getRoleByIdService(id);
// };

// export const updateRoleService = async (id: number, data: any) => {
//   await db("roles").where({ id }).update(data);
//   return getRoleByIdService(id);
// };

// export const deleteRoleService = async (id: number) => {
//   await db("roles").where({ id }).del();
//   return { message: "Role deleted" };
// };

// export const toggleRoleStatusService = async (id: number, status: boolean) => {
//   await db("roles").where({ id }).update({ status });
//   return { message: "Role status updated" };
// };





// import db from "../../connection";

// export const getRolesService = async () => {
//   return await db("roles").select("*");
// };

// export const getRoleByIdService = async (id: number) => {
//   return await db("roles").where({ id }).first();
// };

// export const createRoleService = async (data: any) => {
//   const [role] = await db("roles").insert(data).returning("*");
//   return role;
// };

// export const updateRoleService = async (id: number, data: any) => {
//   const [role] = await db("roles").where({ id }).update(data).returning("*");
//   return role;
// };

// export const deleteRoleService = async (id: number) => {
//   const [role] = await db("roles").where({ id }).del().returning("*");
//   return role;
// };

// export const toggleRoleStatusService = async (id: number, status: string) => {
//   const [role] = await db("roles").where({ id }).update({ status }).returning("*");
//   return role;
// };
