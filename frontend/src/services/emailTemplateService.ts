import api from "../lib/api";
import type { EmailTemplate, TemplateStatus } from "../types/EmailTemplate";

export const getEmailTemplates = async (status: TemplateStatus | "all" = "all"): Promise<EmailTemplate[]> => {
  const { data } = await api.get<EmailTemplate[]>(`/email-templates?status=${status}`);
  return data;
};

export const createEmailTemplate = async (template: Omit<EmailTemplate, "id">) => {
  const { data } = await api.post("/email-templates", template);
  return data;
};

export const updateEmailTemplate = async (id: number, template: Partial<EmailTemplate>) => {
  const { data } = await api.put(`/email-templates/${id}`, template);
  return data;
};

export const deleteEmailTemplate = async (id: number) => {
  const { data } = await api.delete(`/email-templates/${id}`);
  return data;
};

export const getEmailTemplateById = async (id: number): Promise<EmailTemplate> => {
  const { data } = await api.get<EmailTemplate>(`/email-templates/${id}`);
  return data;
};



// import api from "../lib/api";
// import type { EmailTemplate } from "../types/EmailTemplate";

// export const getEmailTemplates = async (): Promise<EmailTemplate[]> => {
//   const { data } = await api.get<EmailTemplate[]>("/email-templates");
//   return data;
// };

// export const createEmailTemplate = async (template: Omit<EmailTemplate, "id">) => {
//   const { data } = await api.post("/email-templates", template);
//   return data;
// };

// export const updateEmailTemplate = async (id: number, template: Partial<EmailTemplate>) => {
//   const { data } = await api.put(`/email-templates/${id}`, template);
//   return data;
// };

// export const deleteEmailTemplate = async (id: number) => {
//   const { data } = await api.delete(`/email-templates/${id}`);
//   return data;
// };

// export const getEmailTemplateById = async (id: number): Promise<EmailTemplate> => {
//   const { data } = await api.get<EmailTemplate>(`/email-templates/${id}`);
//   return data;
// };


