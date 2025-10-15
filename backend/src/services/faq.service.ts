// src/services/faq.service.ts
import db from "../../connection";

export interface FaqData {
  question: string;
  answer: string;
  status?: string;
  displayOrder?: number;
  createdBy?: number | null;
  updatedBy?: number | null;
}

// Query + pagination
export const getFaqs = async (
  filters: any = {},
  page: number = 1,
  limit: number = 10
) => {
  const offset = (page - 1) * limit;

  let query = db("faq").whereNull("deletedAt");

  // apply filters
  if (filters.id) query = query.andWhere("id", filters.id);
  if (filters.question) query = query.andWhere("question", "like", `%${filters.question}%`);
  if (filters.answer) query = query.andWhere("answer", "like", `%${filters.answer}%`);
  if (filters.displayOrder) query = query.andWhere("displayOrder", filters.displayOrder);
  if (filters.status && filters.status !== "all") query = query.andWhere("status", filters.status);

  // count total
  const totalRow = await query.clone().count({ count: "id" }).first();
  const total = Number(totalRow?.count ?? 0);

  // fetch page
  const items = await query.select("*").orderBy("createdAt", "desc").limit(limit).offset(offset);

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return { items, total, totalPages, currentPage: page };
};

export const fetchFaqById = async (id: string) => {
  return db("faq").where({ id }).first();
};

export const createFaq = async (data: FaqData) => {
  const [id] = await db("faq").insert(data);
  return db("faq").where({ id }).first();
};

export const updateFaq = async (id: string, data: Partial<FaqData>) => {
  await db("faq").where({ id }).update({ ...data, updatedAt: db.fn.now() });
  return db("faq").where({ id }).first();
};

export const deleteFaq = async (id: string, updatedBy?: number | null) => {
  return db("faq").where({ id }).update({
    deletedAt: db.fn.now(),
    status: "inactive",
    updatedBy: updatedBy || null,
  });
};






// src/services/faq.service.ts
// import db from "../../connection";

// export interface FaqData {
//   question: string;
//   answer: string;
//   status?: string;
//   createdBy?: number | null;
//   updatedBy?: number | null;
// }

// export const getFaqs = async (query?: any) => {
//   let dbQuery = db("faq").select("*").orderBy("createdAt", "desc");

//   if (query?.status && query.status !== "all") {
//     dbQuery = dbQuery.where({ status: query.status });
//   }

//   return dbQuery;
// };

// export const fetchFaqById = async (id: string) => {
//   return db("faq").where({ id }).first();
// };

// export const createFaq = async (data: FaqData) => {
//   const [id] = await db("faq").insert(data);
//   return db("faq").where({ id }).first();
// };

// export const updateFaq = async (id: string, data: Partial<FaqData>) => {
//   await db("faq").where({ id }).update({ ...data, updatedAt: db.fn.now() });
//   return db("faq").where({ id }).first();
// };

// export const deleteFaq = async (id: string, updatedBy?: number | null) => {
//   return db("faq").where({ id }).update({
//     deletedAt: db.fn.now(),
//     status: "inactive",
//     updatedBy: updatedBy || null,
//   });
// };
