// src/services/emailTemplate.service.ts
import db from "../../connection";

export const fetchEmailTemplates = async (status?: "active" | "inactive" | "all") => {
  let query = db("email_templates").select("*").whereNull("deletedAt").orderBy("id", "desc");
  if (status && status !== "all") query = query.where({ status });
  return query;
};

// for pagination + sorting
export const getEmailTemplatesService = async (
  filters: any = {},
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  order?: "asc" | "desc"
) => {
  const offset = (page - 1) * limit;

  // white-list columns to avoid SQL injection via orderBy
  const allowedSortCols = ["id", "key", "title", "subject", "createdAt", "updatedAt"];
  const sortCol = sortBy && allowedSortCols.includes(sortBy) ? sortBy : "id";
  const sortOrder = order === "asc" ? "asc" : "desc";

  let baseQuery = db("email_templates").whereNull("deletedAt");

  if (filters.key) baseQuery = baseQuery.where("key", "like", `%${filters.key}%`);
  if (filters.title) baseQuery = baseQuery.where("title", "like", `%${filters.title}%`);
  if (filters.subject) baseQuery = baseQuery.where("subject", "like", `%${filters.subject}%`);
  if (filters.status && filters.status !== "all") baseQuery = baseQuery.where("status", filters.status);

  // total (use clone to avoid modifying baseQuery)
  const totalRow = await baseQuery.clone().count({ count: "id" }).first();
  const total = Number(totalRow?.count ?? 0);

  // fetch items with ordering
  const items = await baseQuery
    .clone()
    .orderBy(sortCol, sortOrder)
    .limit(limit)
    .offset(offset)
    .select("*");

  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  return { items, total, totalPages, currentPage: page };
};

export const fetchEmailTemplateById = async (id: string) => {
  return db("email_templates").where({ id }).whereNull("deletedAt").first();
};

export const insertEmailTemplate = async (data: {
  key: string;
  title?: string;
  subject?: string;
  fromEmail?: string;
  fromName?: string;
  body?: string;
  status?: string;
  createdBy?: number | null;
}) => {
  const formattedData = {
    ...data,
    createdAt: new Date().toISOString().slice(0, 19).replace("T", " "), // MySQL DATETIME format
  };
  const result = await db("email_templates").insert(formattedData);
  const id = Array.isArray(result) ? result[0] : result;
  return await db("email_templates").where({ id }).first();
};

export const updateEmailTemplateById = async (
  id: string,
  data: { title?: string; subject?: string; fromEmail?: string; fromName?: string; body?: string; status?: string; updatedBy?: number | null }
) => {
  await db("email_templates").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("email_templates").where({ id }).first();
};

export const softDeleteEmailTemplate = async (id: string, updatedBy?: number | null) => {
  return db("email_templates").where({ id }).update({ deletedAt: db.fn.now(), status: "inactive", updatedBy: updatedBy || null });
};




// import db from "../../connection";

// export const fetchEmailTemplates = async (status?: "active" | "inactive" | "all") => {
//   let query = db("email_templates").select("*").whereNull("deletedAt").orderBy("id", "desc");
//   if (status && status !== "all") query = query.where({ status });
//   return query;
// };

// // for pagination
// export const getEmailTemplatesService = async (
//   filters: any = {},
//   page: number = 1,
//   limit: number = 10
// ) => {
//   const offset = (page - 1) * limit;

//   // base query (do NOT modify original fetchEmailTemplates)
//   let baseQuery = db("email_templates").whereNull("deletedAt");

//   if (filters.key) baseQuery = baseQuery.where("key", "like", `%${filters.key}%`);
//   if (filters.title) baseQuery = baseQuery.where("title", "like", `%${filters.title}%`);
//   if (filters.subject) baseQuery = baseQuery.where("subject", "like", `%${filters.subject}%`);
//   if (filters.status && filters.status !== "all") baseQuery = baseQuery.where("status", filters.status);

//   // count total using cloned query
//   const totalRow = await baseQuery.clone().count({ count: "id" }).first();
//   const total = Number(totalRow?.count ?? 0);

//   // fetch items for page
//   const items = await baseQuery
//     .clone()
//     .orderBy("id", "desc")
//     .limit(limit)
//     .offset(offset)
//     .select("*");

//   const totalPages = total > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

//   return { items, total, totalPages, currentPage: page };
// };

// export const fetchEmailTemplateById = async (id: string) => {
//   return db("email_templates").where({ id }).whereNull("deletedAt").first();
// };

// export const insertEmailTemplate = async (data: {
//   key: string;
//   title?: string;
//   subject?: string;
//   fromEmail?: string;
//   fromName?: string;
//   body?: string;
//   status?: string;
//   createdBy?: number | null;
// }) => {
//   const formattedData = {
//     ...data,
//     createdAt: new Date().toISOString().slice(0, 19).replace("T", " "), // MySQL DATETIME format
//   };
//   const result = await db("email_templates").insert(formattedData);
//   const id = Array.isArray(result) ? result[0] : result;
//   return await db("email_templates").where({ id }).first();
// };

// export const updateEmailTemplateById = async (
//   id: string,
//   data: { title?: string; subject?: string; fromEmail?: string; fromName?: string; body?: string; status?: string; updatedBy?: number | null }
// ) => {
//   await db("email_templates").where({ id }).update({ ...data, updatedAt: db.fn.now() });
//   return db("email_templates").where({ id }).first();
// };

// export const softDeleteEmailTemplate = async (id: string, updatedBy?: number | null) => {
//   return db("email_templates").where({ id }).update({ deletedAt: db.fn.now(), status: "inactive", updatedBy: updatedBy || null });
// };
