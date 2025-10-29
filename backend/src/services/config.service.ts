import db from "../../connection";

// ✅ Type declaration here (no separate types folder needed)
export type ConfigStatus = "active" | "inactive";

export const fetchConfigList = async (
  status?: ConfigStatus | "all",
  page = 1,
  limit = 10,
  sortBy?: string,
  order?: "asc" | "desc"
) => {
  const offset = (page - 1) * limit;

  const allowedSortCols = ["id", "key", "value", "displayOrder", "status", "createdAt", "updatedAt"];
  const sortCol = sortBy && allowedSortCols.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  let query = db("application_config").select("*").whereNull("deletedAt").orderBy(sortCol, sortOrder);

  if (status && status !== "all") query = query.where({ status });

  const [rows, [{ count }]] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    db("application_config")
      .whereNull("deletedAt")
      .modify((qb) => { if (status && status !== "all") qb.where({ status }); })
      .count({ count: "*" }),
  ]);

  return { rows, total: Number(count) };
};



// Fetch single config by ID
export const fetchConfigById = async (id: string) => {
  return db("application_config").where({ id }).first();
};

// Insert new config
export const insertConfig = async (data: {
  key: string;
  value: string;
  displayOrder?: number;
  status?: string;
  createdBy?: number | null;
}) => {
  const [id] = await db("application_config").insert(data);
  return db("application_config").where({ id }).first();
};

// Update config by ID
export const updateConfigById = async (
  id: string,
  data: { value?: string; displayOrder?: number; status?: string; updatedBy?: number | null }
) => {
  await db("application_config").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("application_config").where({ id }).first();
};

// Soft delete config
export const softDeleteConfig = async (id: string, updatedBy?: number | null) => {
  return db("application_config").where({ id }).update({
    deletedAt: db.fn.now(),
    status: "inactive",
    updatedBy: updatedBy || null,
  });
};
