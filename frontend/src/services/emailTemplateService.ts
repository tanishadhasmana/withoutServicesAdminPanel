import api from "../lib/api";
import type { EmailTemplate, TemplateStatus } from "../types/EmailTemplate";

// export const getEmailTemplates = async (status: TemplateStatus | "all" = "all"): Promise<EmailTemplate[]> => {
//   const { data } = await api.get<EmailTemplate[]>(`/email-templates?status=${status}`);
//   return data;
// };
// email template for pagination
export const getEmailTemplates = async ({
  key,
  title,
  subject,
  status = "all",
  page = 1,
  limit = 10,
}: {
  key?: string;
  title?: string;
  subject?: string;
  status?: TemplateStatus | "all";
  page?: number;
  limit?: number;
}) => {
  const { data } = await api.get("/email-templates", {
    params: { key, title, subject, status, page, limit },
    withCredentials: true, // keep consistent with your other service calls if you use cookies
  });
  return data; // expect { items, total, totalPages, currentPage }
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

