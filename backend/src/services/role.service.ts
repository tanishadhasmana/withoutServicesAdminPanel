import db from "../../connection";

// get roles for pagination
export const getRoles = async (filters: any = {}, limit?: number, offset?: number) => {
  let query = db("roles")
    .whereNull("deletedAt")
    .orderBy("id", "desc");

  if (filters.id) query = query.where("id", filters.id);
  if (filters.role) query = query.where("role", "like", `%${filters.role}%`);
  if (filters.description) query = query.where("description", "like", `%${filters.description}%`);
  if (filters.status) query = query.where("status", filters.status.toLowerCase());

  // 🧩 Separate total count
  const totalRow = await db("roles")
    .whereNull("deletedAt")
    .modify((qb) => {
      if (filters.id) qb.where("id", filters.id);
      if (filters.role) qb.where("role", "like", `%${filters.role}%`);
      if (filters.description) qb.where("description", "like", `%${filters.description}%`);
      if (filters.status) qb.where("status", filters.status.toLowerCase());
    })
    .count({ count: "id" })
    .first();

  const total = Number(totalRow?.count ?? 0);

  if (limit !== undefined && offset !== undefined) {
    query = query.limit(limit).offset(offset);
  }

  const roles = await query.select("*");
  return { roles, total };
};



export const fetchRoleById = async (id: string) => {
  return db("roles").where({ id }).first();
};

export const createRole = async (data: { name: string; status?: string; createdBy?: number | null }) => {
  const [id] = await db("roles").insert(data);
  return db("roles").where({ id }).first();
};

export const updateRole = async (id: string, data: { name?: string; status?: string; updatedBy?: number | null }) => {
  await db("roles").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("roles").where({ id }).first();
};

export const toggleRoleStatus = async (id: string, status: string) => {
  await db("roles").where({ id }).update({ status, updatedAt: db.fn.now() });
  return db("roles").where({ id }).first();
};

export const deleteRole = async (id: string, updatedBy?: number | null) => {
  await db("roles").where({ id }).update({ deletedAt: db.fn.now(), updatedBy });
  return { message: "Role deleted (soft)" };
};

