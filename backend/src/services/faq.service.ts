// src/services/faq.service.ts
import db from "../../connection";

export const getFaqListService = async (filters?: { status?: string }) => {
  const { status } = filters || {};
  let query = db("faq")
    .select("id", "question", "answer", "status", "displayOrder", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .orderBy("displayOrder", "asc");

  if (status && (status === "active" || status === "inactive")) {
    query = query.where({ status });
  }

  const rows = await query;
  return rows;
};

export const getFaqByIdService = async (id: number) => {
  const row = await db("faq")
    .select("id", "question", "answer", "status", "displayOrder", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .where({ id })
    .first();
  return row;
};

export const createFaqService = async (data: any) => {
  const insertData = {
    question: data.question,
    answer: data.answer ?? null,
    displayOrder: data.displayOrder ?? 1,
    status: data.status || "active",
    createdBy: data.createdBy ?? null,
  };

  const inserted = await db("faq").insert(insertData);
  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getFaqByIdService(Number(id));
  return created;
};

export const updateFaqService = async (id: number, data: any) => {
  const updateData = {
    question: data.question,
    answer: data.answer,
    displayOrder: data.displayOrder,
    status: data.status,
    updatedBy: data.updatedBy ?? null,
    updatedAt: db.fn.now(),
  };

  await db("faq").where({ id }).update(updateData);
  const updated = await getFaqByIdService(id);
  return updated;
};

export const deleteFaqService = async (id: number) => {
  await db("faq").where({ id }).update({ deletedAt: db.fn.now(), status: "inactive", updatedAt: db.fn.now() });
  return { message: "FAQ deleted (soft)" };
};




// import db from "../../connection";

// export const getFaqListService = async () => {
//   return db("faq").select("*");
// };

// export const getFaqByIdService = async (id: number) => {
//   return db("faq").where({ id }).first();
// };

// export const createFaqService = async (data: any) => {
//   const [id] = await db("faq").insert(data);
//   return getFaqByIdService(id);
// };

// export const updateFaqService = async (id: number, data: any) => {
//   await db("faq").where({ id }).update(data);
//   return getFaqByIdService(id);
// };

// export const deleteFaqService = async (id: number) => {
//   await db("faq").where({ id }).del();
//   return { message: "FAQ deleted" };
// };







// import db from "../../connection";

// export const getFaqListService = async () => {
//   return await db("faqs").select("*");
// };

// export const getFaqByIdService = async (id: number) => {
//   return await db("faqs").where({ id }).first();
// };

// export const createFaqService = async (data: any) => {
//   const [faq] = await db("faqs").insert(data).returning("*");
//   return faq;
// };

// export const updateFaqService = async (id: number, data: any) => {
//   const [faq] = await db("faqs").where({ id }).update(data).returning("*");
//   return faq;
// };

// export const deleteFaqService = async (id: number) => {
//   const [faq] = await db("faqs").where({ id }).del().returning("*");
//   return faq;
// };
