// src/services/emailTemplate.service.ts
import db from "../../connection";

export const getEmailTemplatesService = async (filters?: { status?: string }) => {
  const { status } = filters || {};
  let query = db("email_templates")
    .select("id", "key", "title", "subject", "fromEmail", "fromName", "status", "body", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .whereNull("deletedAt")
    .orderBy("id", "desc");

  if (status && status !== "all") query = query.where({ status });

  const rows = await query;
  return rows;
};

export const getEmailTemplateByIdService = async (id: number) => {
  const row = await db("email_templates")
    .select("id", "key", "title", "subject", "fromEmail", "fromName", "status", "body", "createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt")
    .where({ id })
    .whereNull("deletedAt")
    .first();
  return row;
};

export const createEmailTemplateService = async (data: any) => {
  const insertData = {
    key: data.key,
    title: data.title ?? null,
    subject: data.subject ?? null,
    fromEmail: data.fromEmail ?? null,
    fromName: data.fromName ?? null,
    body: data.body ?? null,
    status: data.status || "active",
    createdBy: data.createdBy ?? null,
  };

  const inserted = await db("email_templates").insert(insertData);
  const id = Array.isArray(inserted) ? inserted[0] : (inserted as number);
  const created = await getEmailTemplateByIdService(Number(id));
  return created;
};

export const updateEmailTemplateService = async (id: number, data: any) => {
  const updateData = {
    title: data.title,
    subject: data.subject,
    fromEmail: data.fromEmail,
    fromName: data.fromName,
    body: data.body,
    status: data.status,
    updatedBy: data.updatedBy ?? null,
    updatedAt: db.fn.now(),
  };

  await db("email_templates").where({ id }).update(updateData);
  const updated = await getEmailTemplateByIdService(id);
  return updated;
};

export const deleteEmailTemplateService = async (id: number) => {
  await db("email_templates")
    .where({ id })
    .update({ deletedAt: db.fn.now(), status: "inactive", updatedAt: db.fn.now() });
  return { message: "Email template deleted (soft)" };
};



// import db from "../../connection";

// export const getEmailTemplatesService = async () => {
//   return await db("email_templates").select("*");
// };

// export const getEmailTemplateByIdService = async (id: number) => {
//   return await db("email_templates").where({ id }).first();
// };

// export const createEmailTemplateService = async (data: any) => {
//   const [id] = await db("email_templates").insert(data);
//   return getEmailTemplateByIdService(id);
// };

// export const updateEmailTemplateService = async (id: number, data: any) => {
//   await db("email_templates").where({ id }).update(data);
//   return getEmailTemplateByIdService(id);
// };

// export const deleteEmailTemplateService = async (id: number) => {
//   await db("email_templates").where({ id }).del();
//   return { message: "Email template deleted successfully" };
// };





// import db from "../../connection";

// export const getEmailTemplatesService = async () => {
//   return await db("email_templates").select("*");
// };

// export const getEmailTemplateByIdService = async (id: number) => {
//   return await db("email_templates").where({ id }).first();
// };

// export const createEmailTemplateService = async (data: any) => {
//   const [template] = await db("email_templates").insert(data).returning("*");
//   return template;
// };

// export const updateEmailTemplateService = async (id: number, data: any) => {
//   const [template] = await db("email_templates").where({ id }).update(data).returning("*");
//   return template;
// };

// export const deleteEmailTemplateService = async (id: number) => {
//   const [template] = await db("email_templates").where({ id }).del().returning("*");
//   return template;
// };
