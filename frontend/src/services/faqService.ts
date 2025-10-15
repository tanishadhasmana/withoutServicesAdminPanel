// src/services/faqService.ts
import api from "../lib/api";
import type { FAQ, FAQFormData, FAQStatus } from "../types/FAQ";

export type GetFaqListParams = {
  id?: string;
  question?: string;
  answer?: string;
  displayOrder?: string | number;
  status?: FAQStatus | "all";
  page?: number;
  limit?: number;
};

// Get paginated FAQ list (returns { items, total, totalPages, currentPage })
export const getFaqList = async (params?: GetFaqListParams) => {
  const { data } = await api.get("/faq", { params });
  return data;
};

// existing functions unchanged:
export const getFaqById = async (id: number): Promise<FAQ> => {
  const { data } = await api.get<FAQ>(`/faq/${id}`);
  return data;
};

export const createFaq = async (faq: FAQFormData): Promise<FAQ> => {
  const { data } = await api.post<FAQ>("/faq", faq);
  return data;
};

export const updateFaq = async (id: number, faq: Partial<FAQFormData>): Promise<FAQ> => {
  const { data } = await api.put<FAQ>(`/faq/${id}`, faq);
  return data;
};

export const deleteFaq = async (id: number): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/faq/${id}`);
  return data;
};



