// src/services/config.service.ts
import db from "../../connection";

export const getConfigListService = async (filters?: { status?: string }) => {
  const { status } = filters || {};
  let query = db("application_config")
    .select("id", "key", "value", "displayOrder", "status", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .orderBy("displayOrder", "asc");

  if (status && status !== "all") query = query.where({ status });

  const rows = await query;
  return rows;
};

export const getConfigByIdService = async (id: number) => {
  const row = await db("application_config")
    .select("id", "key", "value", "displayOrder", "status", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .where({ id })
    .first();
  return row;
};

export const createConfigService = async (data: any) => {
  const insertData = {
    key: data.key,
    value: data.value ?? null,
    displayOrder: data.displayOrder ?? 0,
    status: data.status || "active",
    createdBy: data.createdBy ?? null,
  };

  const inserted = await db("application_config").insert(insertData);
  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getConfigByIdService(Number(id));
  return created;
};

export const updateConfigService = async (id: number, data: any) => {
  const updateData = {
    value: data.value,
    displayOrder: data.displayOrder,
    status: data.status,
    updatedBy: data.updatedBy ?? null,
    updatedAt: db.fn.now(),
  };

  await db("application_config").where({ id }).update(updateData);
  const updated = await getConfigByIdService(id);
  return updated;
};

export const deleteConfigService = async (id: number) => {
  await db("application_config")
    .where({ id })
    .update({ deletedAt: db.fn.now(), status: "inactive", updatedAt: db.fn.now() });
  return { message: "Config deleted (soft)" };
};




// import db from "../../connection";

// export const getConfigListService = async () => {
//   return db("config").select("*");
// };

// export const getConfigByIdService = async (id: number) => {
//   return db("config").where({ id }).first();
// };

// export const createConfigService = async (data: any) => {
//   const [id] = await db("config").insert(data);
//   return getConfigByIdService(id);
// };

// export const updateConfigService = async (id: number, data: any) => {
//   await db("config").where({ id }).update(data);
//   return getConfigByIdService(id);
// };

// export const deleteConfigService = async (id: number) => {
//   await db("config").where({ id }).del();
//   return { message: "Config deleted" };
// };



// import db from "../../connection";

// export const getConfigListService = async () => {
//   return await db("config").select("*");
// };

// export const getConfigByIdService = async (id: number) => {
//   return await db("config").where({ id }).first();
// };

// export const createConfigService = async (data: any) => {
//   const [config] = await db("config").insert(data).returning("*");
//   return config;
// };

// export const updateConfigService = async (id: number, data: any) => {
//   const [config] = await db("config").where({ id }).update(data).returning("*");
//   return config;
// };

// export const deleteConfigService = async (id: number) => {
//   const [config] = await db("config").where({ id }).del().returning("*");
//   return config;
// };
