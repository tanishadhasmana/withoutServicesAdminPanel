import db from "../../connection";

const ALLOWED_SORT_COLUMNS = new Set([
  "id",
  "role",
  "description",
  "createdAt",
  "updatedAt",
]);

export const getRoles = async (
  filters: any = {},
  limit?: number,
  offset?: number,
  sortBy?: string,
  order?: "asc" | "desc"
) => {
  // Validate sort inputs
  let sortColumn = "id";
  let sortOrder: "asc" | "desc" = "desc";

  if (sortBy && ALLOWED_SORT_COLUMNS.has(sortBy)) {
    sortColumn = sortBy;
    if (order && (order === "asc" || order === "desc")) sortOrder = order;
  }

  // If user attempted to sort by status, ignore it (no sorting for status)
  if (sortBy === "status") {
    sortColumn = "id";
    sortOrder = "desc";
  }

  // Base query
  let query = db("roles")
    .whereNull("deletedAt")
    .orderBy(sortColumn, sortOrder);

  if (filters.id) query = query.where("id", filters.id);
  if (filters.role) query = query.where("role", "like", `%${filters.role}%`);
  if (filters.description) query = query.where("description", "like", `%${filters.description}%`);
  if (filters.status) query = query.where("status", filters.status.toLowerCase());

  // total count with same filters (no sort needed)
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


export const getRolesCountService = async () => {
  const result = await db("roles")
    .whereNull("deletedAt")
    .count({ total: "id" })
    .first();

  return Number(result?.total) || 0;
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

