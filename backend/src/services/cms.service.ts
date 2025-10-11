// src/services/cms.service.ts
import db from "../../connection";

export const getCmsListService = async (filters?: { id?: string; key?: string; title?: string; status?: string }) => {
  const { id, key, title, status } = filters || {};
  let query = db("cms").select(
    "id",
    "key",
    "title",
    "metaKeyword",
    "metaTitle",
    "metaDescription",
    "status",
    "content",
    "createdBy",
    "updatedBy",
    "createdAt",
    "updatedAt",
    "deletedAt"
  ).orderBy("id", "desc");

  if (id) query = query.where("id", "like", `%${id}%`);
  if (key) query = query.where("key", "like", `%${key}%`);
  if (title) query = query.where("title", "like", `%${title}%`);
  if (status) query = query.where("status", status);

  const rows = await query;
  return rows;
};

export const getCmsByIdService = async (id: number) => {
  const row = await db("cms")
    .select(
      "id",
      "key",
      "title",
      "metaKeyword",
      "metaTitle",
      "metaDescription",
      "status",
      "content",
      "createdBy",
      "updatedBy",
      "createdAt",
      "updatedAt",
      "deletedAt"
    )
    .where({ id })
    .first();
  return row;
};

export const createCmsService = async (data: any) => {
  const insertData = {
    key: data.key,
    title: data.title || null,
    metaKeyword: data.metaKeyword || null,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    content: data.content || null,
    status: data.status || "active",
    createdBy: data.createdBy ?? null,
  };

  const inserted = await db("cms").insert(insertData);
  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getCmsByIdService(Number(id));
  return created;
};

export const updateCmsService = async (id: number, data: any) => {
  const updateData: any = {
    title: data.title,
    metaKeyword: data.metaKeyword,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    content: data.content,
    status: data.status,
    updatedBy: data.updatedBy ?? null,
    updatedAt: db.fn.now(),
  };

  await db("cms").where({ id }).update(updateData);
  const updated = await getCmsByIdService(id);
  return updated;
};

export const deleteCmsService = async (id: number) => {
  await db("cms")
    .where({ id })
    .update({ deletedAt: db.fn.now(), status: "inactive", updatedAt: db.fn.now() });
  return { message: "CMS deleted (soft)" };
};




// import db from "../../connection";

// export const getCmsListService = async () => {
//   return db("cms").select("*");
// };

// export const getCmsByIdService = async (id: number) => {
//   return db("cms").where({ id }).first();
// };

// export const createCmsService = async (data: any) => {
//   const [id] = await db("cms").insert(data);
//   return getCmsByIdService(id);
// };

// export const updateCmsService = async (id: number, data: any) => {
//   await db("cms").where({ id }).update(data);
//   return getCmsByIdService(id);
// };

// export const deleteCmsService = async (id: number) => {
//   await db("cms").where({ id }).del();
//   return { message: "CMS deleted" };
// };





// import db from "../../connection";

// export const getCmsListService = async () => {
//   return await db("cms").select("*");
// };

// export const getCmsByIdService = async (id: number) => {
//   return await db("cms").where({ id }).first();
// };

// export const createCmsService = async (data: any) => {
//   const [cms] = await db("cms").insert(data).returning("*");
//   return cms;
// };

// export const updateCmsService = async (id: number, data: any) => {
//   const [cms] = await db("cms").where({ id }).update(data).returning("*");
//   return cms;
// };

// export const deleteCmsService = async (id: number) => {
//   const [cms] = await db("cms").where({ id }).del().returning("*");
//   return cms;
// };
